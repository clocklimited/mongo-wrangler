module.exports = function (bland) {
  return function () {
    var args = Array.prototype.slice.call(arguments)
    var cleanArgs = args
    if (bland) {
      // Strip any character outside of the extended ascii set
      cleanArgs = args.map((arg) =>
        typeof arg === 'string' ? arg.replace(/[^\x00-\xFF]/gu, '') : arg
      )
    }
    console.log.apply(console.log, cleanArgs)
  }
}
