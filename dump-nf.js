#!/usr/bin/env node
var execSync = require('child_process').execSync
var bland = !!process.env.BLAND
var log = require('./src/log')(bland)
var color = require('./src/color')(bland)
var databaseName = process.env.DB_NAME
var verbose = !!process.env.VERBOSE
var customExcludes =
  (process.env.EXCLUDES && process.env.EXCLUDES.split(',')) || []
var customIncludes =
  (process.env.INCLUDES && process.env.INCLUDES.split(',')) || []
var customOnly = (process.env.ONLY && process.env.ONLY.split(',')) || []
var input = process.env.INPUT
var output = process.env.OUTPUT

function printUsage() {
  log('')
  log('Usage:')
  log('\t[options] database')
  log('Options:')
  log('\t-v - verbose')
  log('\t--bland - removes emoji and colour from output')
  log('\t-e - comma separated list of collections to exclude')
  log(
    '\t-i - comma separated list of collections to include, overrides default excludes'
  )
  log(
    '\t--only - comma separated list of collections to include, will only dump these collections'
  )
}

if (!databaseName) {
  console.error(color('Missing database name', 'red'))
  printUsage()
  process.exit(1)
}

function exec(cmd) {
  if (true) {
    log('$ ' + color(cmd, 'dark grey'))
  }

  const output = execSync(cmd).toString()

  if (true) {
    log(output)
  }

  return output
}

var excludeCollections = [
  'trash',
  'revision',
  'userActivity',
  'questionResponse',
  'sessions',
  'formResponse',
  'latLongCache',
  'customerEventLog',
  'order',
  'uniqueCode',
  'userData'
]
  .concat(customExcludes)
  .filter((collection) => !customIncludes.includes(collection))

var date = new Date().toISOString().substr(0, 19).replace(/[^\d]/g, '')
var newDatabaseName = databaseName + '-' + date
var filename = newDatabaseName + '.tar.zst'
var likelyRestoreName = databaseName.replace(
  /(staging|production)$/,
  'development'
)
log(color('\n💩\tDumping', 'grey'), color(databaseName, 'yellow'))
if (customOnly.length) {
  log(
    color('\tOnly dumping collections:', 'grey'),
    color(customOnly.join(', '), 'yellow')
  )
} else {
  log(
    color('\n❌\tExcluding collections', 'grey'),
    color(excludeCollections.join(', '), 'green')
  )
}

var verbose = !verbose ? '--quiet' : ''

exec('mongo --version')
exec('mongodump --version')
exec('rm -rf dump indexes')
if (customOnly.length) {
  customOnly.forEach(function (collection) {
    exec(`mongodump --uri="${input}" -c ${collection} ${verbose}`)
  })
} else {
  exec(
    `mongodump --uri="${input}" ${verbose}` +
      ' ' +
      excludeCollections
        .map(function (collection) {
          return '--excludeCollection=' + collection
        })
        .join(' ')
  )
}

log(color('\n💩\tDumping indexes', 'grey'), color(databaseName, 'yellow'))
exec(`mongo "${input}" --norc --quiet index-getter.js > indexes`)

log(
  color('✨\tRestoring locally to ', 'grey') + color(newDatabaseName, 'yellow')
)
exec(
  `mongorestore --uri="${output}" --noIndexRestore ${verbose} -d=${newDatabaseName} dump/${databaseName}`
)

log(color('🔏\tObfuscating ' + newDatabaseName, 'grey'))
exec(
  `mongo "${output.replace(
    '/?',
    `/${newDatabaseName}?`
  )}" --norc ./obfuscate.js`
)
exec('rm -rf dump')
log(color('💩\tDumping ' + newDatabaseName, 'grey'))
exec(`mongodump "${output}" ${verbose} --db ${newDatabaseName}`)
log(color('🗜\tCompressing and uploading to xfer', 'grey'))
var url = exec(
  'tar -cf - dump indexes | zstd | curl --silent -H "Max-Days: 1" -H "Max-Downloads: 50" --upload-file - https://xfer.clock.co.uk/' +
    filename
).toString()
exec('rm -rf dump indexes')

log(color('\n✅\tHow to restore the 💩\n', 'white'))
log(
  color(
    'If you have cloned https://github.com/clocklimited/mongo-wrangler.git` then use this\n',
    'yellow'
  )
)
log(
  color('\t./src/restore.js ' + likelyRestoreName + ' ' + url + '\n', 'white')
)
log(color('Too lazy for git cloning? Use this:\n', 'yellow'))
log(
  color(
    '\tcurl -L --silent https://w.kco.lc/master/restore.sh | DATABASE_NAME=' +
      likelyRestoreName +
      ' URL=' +
      url +
      ' bash\n',
    'white'
  )
)

log(color('Restoring to a docker container? Use this:\n', 'yellow'))
log(
  color(
    '\tcurl -L --silent https://w.kco.lc/master/restore.sh | IS_DOCKER=1 DATABASE_NAME=' +
      likelyRestoreName +
      ' URL=' +
      url +
      ' bash\n',
    'white'
  )
)
