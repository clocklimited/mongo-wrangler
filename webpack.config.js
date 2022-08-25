const path = require('path')
const webpack = require('webpack')

const config = {
  mode: 'production',
  target: 'node',
  entry: ['./src/restore.js'],
  output: {
    filename: 'restore.js',
    path: __dirname
  },
  plugins: [
    new webpack.BannerPlugin({ banner: '#!/usr/bin/env node', raw: true })
  ]
}

module.exports = config
