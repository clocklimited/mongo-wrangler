#!/usr/bin/env node
var execSync = require('child_process').execSync
var readline = require('readline')
var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function exec(cmd) {
  console.log(cmd)
  console.log(execSync(cmd).toString())
}
var databaseName = process.argv[2]
var tarUrl = process.argv[3]

rl.question('Create or replace ' + databaseName + ' (Yes)? ', function (answer) {
  if (!!answer && answer.toLowerCase() !== 'yes') {
    console.log('Aborting')
    rl.close()
    return
  }
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

  exec('mongorestore --drop --quiet -d ' + databaseName + ' ' + tmpPath + 'dump/' + dumpName)
  exec('rm -rf /tmp/' + rnd)
  rl.close()
})
