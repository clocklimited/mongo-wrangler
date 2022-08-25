var execSync = require('child_process').execSync
var exists = require('fs').existsSync

var argv = require('./minimist')(process.argv.slice(2), { boolean: ['v', 'n', 'bland'] })
var log = require('./log')(argv.bland)
var color = require('./color')(argv.bland)
var path = require('path')
var databaseName = argv._[0] || process.env.DATABASE_NAME
var tarUrl = process.env.URL || argv._[1]
var verbose = !!argv.v
var noIndex = !!argv.n

var rnd = Math.random().toString(36).substr(2)
var tmpPath = '/tmp/' + rnd + '/'

function printUsage() {
  log('')
  log('Usage:')
  log('\t' + path.basename(process.argv[1]) + ' [options] database url')
  log('Options:')
  log('\t-v - verbose')
  log('\t-n - no indexes')
  log('\n')
}

if (!databaseName) {
  console.error(color('Missing database name', 'red'))
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
      'There was an error. Use `-v` to see the failed output. Often -n to ignore indexes, fixes the issue.'
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
  exec('mongo ' + databaseName + ' ' + tmpPath + 'indexes')
}
log('Clearing up')
exec('rm -rf ' + tmpPath)
