var execSync = require('child_process').execSync
var exists = require('fs').existsSync

var argv = require('./minimist')(process.argv.slice(2), {
  boolean: ['v', 'n', 'bland']
})
var log = require('./log')(argv.bland)
var color = require('./color')(argv.bland)
var path = require('path')
var databaseName = argv._[0] || process.env.DATABASE_NAME
var tarUrl = process.env.URL || argv._[1]
var verbose = !!process.env.VERBOSE || !!argv.v
var noIndex = !!process.env.NO_INDEX || !!argv.n
var isDocker = !!process.env.IS_DOCKER || !!argv.d

var rnd = Math.random().toString(36).substr(2)
var tmpPath = '/tmp/' + rnd + '/'

function printUsage() {
  log('')
  log('Usage:')
  log('\t' + path.basename(process.argv[1]) + ' [options] database url')
  log('Options:')
  log('\t-v - verbose')
  log('\t-n - no indexes')
  log('\t-d - restore to a mongodb docker container')
  log('\n')
}

if (!databaseName) {
  console.error(color('Missing database name', 'red'))
  printUsage()
  process.exit(1)
}

if (!tarUrl) {
  console.error(color('Missing database URL', 'red'))
  printUsage()
  process.exit(1)
}

function exec(cmd) {
  let output
  if (verbose) log('$ ' + color(cmd, 'dark grey'))
  try {
    output = execSync(cmd).toString()
  } catch (e) {
    console.error(
      'There was an error. Use `-v` / `VERBOSE` to see the failed output. Often `-n` / `NO_INDEX` to ignore indexes, fixes the issue.'
    )
    process.exit(1)
  }
  if (verbose) log(output)
  return output
}

var parse = require('url').parse
var basename = require('path').basename
var tarName = basename(parse(tarUrl).path)
var dumpName = tarName.replace(/\.tar\.zst$/g, '')
log(
  'Restoring Database',
  color(databaseName, 'yellow'),
  'from',
  color(tarUrl, 'green')
)

if (isDocker) {
  var containerName =
    databaseName.substr(0, databaseName.lastIndexOf('-')) + '-mongo-1'
  var containerId = exec('docker ps -q -f name="' + containerName + '"')
  if (!containerId) {
    console.error(
      color(
        'Database docker container "' + containerName + '" not found!',
        'red'
      )
    )
    console.error(color('Have you started the project\'s docker containers?', 'red'))
    process.exit(1)
  }
  var hasDatabaseDataDir = exists('./data/db/')
  if (!hasDatabaseDataDir) {
    console.error(
      color('Could not find ./data/db directory to restore dump!', 'red')
    )
    console.error(color('Please restore from the project root.', 'red'))
    process.exit(1)
  }
  exec('mkdir -p ./data/db' + tmpPath)
  exec(
    'curl --silent ' + tarUrl + ' | unzstd | tar -xf - -C ./data/db' + tmpPath
  )
  exec(
    'docker exec ' +
      containerName +
      ' mongorestore ' +
      (!verbose ? '--quiet ' : '') +
      (noIndex ? '--noIndexRestore' : '') +
      ' --drop -d ' +
      databaseName +
      ' /data/db' +
      tmpPath +
      'dump/' +
      dumpName
  )
  if (!noIndex && exists('./data/db' + tmpPath + 'indexes')) {
    log('Restoring Indexes')
    exec(
      'docker exec ' +
        containerName +
        ' mongo --norc ' +
        databaseName +
        ' /data/db' +
        tmpPath +
        'indexes'
    )
  }
} else {
  exec('mkdir -p ' + tmpPath)
  exec('curl --silent ' + tarUrl + ' | unzstd | tar -xf - -C ' + tmpPath)
  exec(
    'mongorestore ' +
      (!verbose ? '--quiet ' : '') +
      (noIndex ? '--noIndexRestore' : '') +
      ' --drop -d ' +
      databaseName +
      ' ' +
      tmpPath +
      'dump/' +
      dumpName
  )
  if (!noIndex && exists(tmpPath + 'indexes')) {
    log('Restoring Indexes')
    exec('mongo --norc ' + databaseName + ' ' + tmpPath + 'indexes')
  }
}
log('Clearing up')
exec('rm -rf ' + tmpPath)
exec('rm -rf ./data/db' + tmpPath)
