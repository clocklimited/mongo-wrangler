#!/usr/bin/env node
var exec = require('child_process').execSync
var databaseName = process.argv[2]

var colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  grey: '\u001b[38;5;239m',
  yellow: '\u001b[33;1m',
  white: '\u001b[37;1m'
}

function color (message, colorName) {
  var colorToUse = colors[colorName] || colors.reset
  return colorToUse + message + colors.reset
}

console.log('Getting Database', databaseName)
var excludeCollections = [
  'userActivity',
  'questionResponse',
  'sessions',
  'formResponse',
  'latLongCache',
  `customerEventLog`,
  `order`
]
var date = new Date().toISOString().substr(0, 19).replace(/[^\d]/g,'')
var newDatabaseName = databaseName + '-' + date
var tarFilename = newDatabaseName + '.tar.bz'
var likelyRestoreName = databaseName.replace(/(staging|production)$/, 'development')
console.log('Dumping', databaseName)
exec('mongodump --quiet --db ' + databaseName + ' ' + excludeCollections.map(function (collection) { return '--excludeCollection ' + collection }).join(' '))
console.log(color('Restoring locally to ' + newDatabaseName, 'grey'))
exec('mongorestore --quiet -d ' + newDatabaseName + ' dump/' + databaseName)
console.log(color('Obfuscating ' + newDatabaseName, 'grey'))
console.log(exec('mongo ' + newDatabaseName + ' ' + './obfuscate.js').toString())
exec('rm -rf dump')
console.log(color('Dumping ' + newDatabaseName, 'grey'))
exec('mongodump --quiet --db ' + newDatabaseName)
console.log(color('Compressing ' + tarFilename, 'grey'))
exec('tar jcf ' + tarFilename + ' dump')
exec('rm -rf dump')
console.log(color('Uploading to xfer', 'grey'))
var url = exec('curl --silent -H "Max-Days: 1" -H "Max-Downloads: 10" --upload-file ./' + tarFilename + ' https://xfer.clock.co.uk/' + tarFilename).toString()
exec('rm -rf ' + tarFilename)
exec('echo "db.dropDatabase()" | mongo ' + newDatabaseName)

console.log(color('\n\nRestoring the 💩\n', 'white'))
console.log(color('If you have cloned git@github.com:clocklimited/mongo-wrangler.git then use this\n', 'yellow'))
console.log(color('\t./restore.js ' + likelyRestoreName + ' ' + url + '\n', 'white'))
console.log(color('Too lazy for git cloning? Use this:\n', 'yellow'))
console.log(color('\tcurl --silent https://raw.githubusercontent.com/clocklimited/mongo-wrangler/master/restore.js | tail -n+2 | DATABASE_NAME=' + likelyRestoreName + ' URL=' + url + ' node\n', 'white'))
