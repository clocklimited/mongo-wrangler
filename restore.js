#!/usr/bin/env node
var execSync = require('child_process').execSync

var argv = require('./minimist')(process.argv.slice(2), { boolean: ['v', 'n'] })
var color = require('./color')
var path = require('path')
var databaseName = argv._[0]
var tarUrl = process.env.URL || argv._[1]
var verbose = !!argv.v
var noIndex = !!argv.n

function printUsage () {
  console.log('')
  console.log('Usage:')
  console.log('\t' + path.basename(process.argv[1]) + ' [options] database url')
  console.log('Options:')
  console.log('\t-v - verbose')
  console.log('\t-n - no indexes')
  console.log('\n')
}

if (!databaseName) {
  console.error(color('Missing database name', 'red'))
  printUsage()
  process.exit(1)
}

function exec(cmd) {
  let output
  try {
    output = execSync(cmd).toString()
  } catch (e) {
    console.error('There was an error. Use `-v` to see the failed output. Often -n to ignore indexes, fixes the issue.')
    process.exit(1)
  }
  if (verbose) {
    console.log('$ ' + color(cmd, 'dark grey'))
    console.log(output)
  }
  return output
}

var parse = require('url').parse
var basename = require('path').basename
var tarName = basename(parse(tarUrl).path)
var dumpName = tarName.replace(/\.tar\.bz$/g, '')

var rnd = Math.random().toString(36).substr(2)
var tmpPath = '/tmp/' + rnd + '/'
console.log('Restoring Database', color(databaseName, 'yellow'), 'from', color(tarUrl, 'green'))
exec('mkdir -p /tmp/' + rnd)
exec('curl --silent ' + tarUrl + ' -o ' + tmpPath + tarName)
exec('tar jxvf ' + tmpPath + tarName + ' -C ' + tmpPath)

exec('mongorestore ' + (!verbose ?'--quiet' : '') + ' ' + (noIndex ?'--noIndexRestore' : '') + ' --drop -d ' + databaseName + ' ' + tmpPath + 'dump/' + dumpName)
exec('rm -rf /tmp/' + rnd)
