#!/usr/bin/env node
var path = require('path')
var execSync = require('child_process').execSync
var argv = require('./src/minimist')(process.argv.slice(2), {
  boolean: ['v', 'bland']
})
var log = require('./src/log')(argv.bland)
var color = require('./src/color')(argv.bland)
var databaseName = argv._[0]
var verbose = !!argv.v
var customExcludes = (argv.e && argv.e.split(',')) || []
var customIncludes = (argv.i && argv.i.split(',')) || []

function printUsage() {
  log('')
  log('Usage:')
  log('\t' + path.basename(process.argv[1]) + ' [options] database')
  log('Options:')
  log('\t-v - verbose')
  log('\t--bland - removes emoji and colour from output')
  log('\t-e - comma separated list of collections to exclude')
  log(
    '\t-i - comma separated list of collections to include, overrides default excludes'
  )
  log('\n')
}

if (!databaseName) {
  console.error(color('Missing database name', 'red'))
  printUsage()
  process.exit(1)
}

function exec(cmd) {
  const output = execSync(cmd).toString()
  if (verbose) {
    log('$ ' + color(cmd, 'dark grey'))
    log(output)
  }
  return output
}

var supportCollectionExclude = !/version: 2/.test(exec('mongo --version'))

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
log(
  color('\n❌\tExcluding collections', 'grey'),
  color(excludeCollections.join(', '), 'green')
)
exec('rm -rf dump indexes')
if (supportCollectionExclude) {
  exec(
    'mongodump ' +
      (!verbose ? '--quiet' : '') +
      ' --db ' +
      databaseName +
      ' ' +
      excludeCollections
        .map(function (collection) {
          return '--excludeCollection ' + collection
        })
        .join(' ')
  )
} else {
  var collections = JSON.parse(
    exec(
      'echo "db.getCollectionNames()" | mongo --norc --quiet ' + databaseName
    ).toString()
  )
  var includeCollections = []
  collections.forEach(function (collection) {
    if (excludeCollections.indexOf(collection) !== -1) return false
    exec(
      'mongodump -c ' +
        collection +
        ' ' +
        (!verbose ? '--quiet' : '') +
        ' --db ' +
        databaseName
    )
  })
}

log(color('\n💩\tDumping indexes', 'grey'), color(databaseName, 'yellow'))
exec('mongo --norc --quiet ' + databaseName + ' index-getter.js > indexes')

log(
  color('✨\tRestoring locally to ', 'grey') + color(newDatabaseName, 'yellow')
)
exec(
  'mongorestore --noIndexRestore ' +
    (!verbose ? '--quiet' : '') +
    ' -d ' +
    newDatabaseName +
    ' dump/' +
    databaseName
)

log(color('🔏\tObfuscating ' + newDatabaseName, 'grey'))
exec('mongo --norc ' + newDatabaseName + ' ' + './obfuscate.js')
exec('rm -rf dump')
log(color('💩\tDumping ' + newDatabaseName, 'grey'))
exec('mongodump ' + (!verbose ? '--quiet' : '') + ' --db ' + newDatabaseName)
log(color('🗜\tCompressing and uploading to xfer', 'grey'))
var url = exec(
  'tar -cf - dump indexes | zstd | curl --silent -H "Max-Days: 1" -H "Max-Downloads: 50" --upload-file - https://xfer.clock.co.uk/' +
    filename
).toString()
exec('rm -rf dump indexes')
exec('echo "db.dropDatabase()" | mongo --norc ' + newDatabaseName)

log(color('\n✅\tHow to restore the 💩\n', 'white'))
log(
  color(
    'If you have cloned https://github.com/clocklimited/mongo-wrangler.git` then use this\n',
    'yellow'
  )
)
log(color('\t./src/restore.js ' + likelyRestoreName + ' ' + url + '\n', 'white'))
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
