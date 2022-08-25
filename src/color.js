var colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  grey: '\u001b[38;5;245m',
  'dark grey': '\u001b[38;5;245m',
  yellow: '\u001b[33;1m',
  white: '\u001b[37;1m'
}

function color(message, colorName) {
  var colorToUse = colors[colorName] || colors.reset
  return colorToUse + message + colors.reset
}
module.exports = color
