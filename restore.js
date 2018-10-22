#!/usr/bin/env node
var execSync = require('child_process').execSync

function exec(cmd) {
  var output = execSync(cmd).toString()
  if (process.env.DEBUG) {
    console.log(cmd)
    console.log(output)
  }
}

var databaseName = process.env.DATABASE_NAME || process.argv[2]
var tarUrl = process.env.URL || process.argv[3]

var parse = require('url').parse
var basename = require('path').basename
var tarName = basename(parse(tarUrl).path)
var dumpName = tarName.replace(/\.tar\.bz$/g, '')

var rnd = Math.random().toString(36).substr(2)
var tmpPath = '/tmp/' + rnd + '/'
console.log('Getting Database', databaseName, tarUrl, tarName)
exec('mkdir -p /tmp/' + rnd)
exec('curl --silent ' + tarUrl + ' -o ' + tmpPath + tarName)
exec('tar jxvf ' + tmpPath + tarName + ' -C ' + tmpPath)

exec('mongorestore --quiet --drop -d ' + databaseName + ' ' + tmpPath + 'dump/' + dumpName)
exec('rm -rf /tmp/' + rnd)
