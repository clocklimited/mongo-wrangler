#!/usr/bin/env node
var exec = require('child_process').execSync
var databaseName = process.argv[2]
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
console.log('Restoring locally to ', newDatabaseName)
exec('mongorestore --quiet -d ' + newDatabaseName + ' dump/' + databaseName)
console.log('Obfuscating', newDatabaseName)
console.log(exec('mongo ' + newDatabaseName + ' ' + './obfuscate.js').toString())
exec('rm -rf dump')
console.log('Dumping', newDatabaseName)
exec('mongodump --quiet --db ' + newDatabaseName)
console.log('Compressing', tarFilename)
exec('tar jcf ' + tarFilename + ' dump')
exec('rm -rf dump')
console.log('Uploading to xfer')
var url = exec('curl --silent -H "Max-Days: 1" -H "Max-Downloads: 10" --upload-file ./' + tarFilename + ' https://xfer.clock.co.uk/' + tarFilename).toString()
console.log(url)
exec('rm -rf ' + tarFilename)
console.log('To restore use this command:')
console.log('./restore ' + likelyRestoreName + ' ' + url)
