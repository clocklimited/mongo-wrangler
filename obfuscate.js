var privateProperties = [
  /email/,
  /firstName/,
  /lastName/,
  /surname/,
  /addressLine/,
  /postcode/
]

var ignoreCollections = ['player']

function isPrivate(propertyName) {
  return privateProperties.some(function (privatePropertyName) {
    return privatePropertyName.test(propertyName)
  })
}

function isClock(value) {
  var value = false
  var found = Object.keys(document).some(function (key) {
    value = document[key]
    return typeof value === 'string' && value.toLowerCase().indexOf('clock.co.uk') !== -1
  })
  return found ? value : false
}

var lowerChars = 'abcdefghijklmnopqrstuvwxyz'
var upperChars = lowerChars.toUpperCase()

function obfuscate(value) {
  return value
    .replace(/[a-z]/g, function () {
      // return lowerChars[Math.floor(Math.random() * 26)]
      return lowerChars[0]
    })
    .replace(/[A-Z]/g, function () {
      // return upperChars[Math.floor(Math.random() * 26)]
      return upperChars[1]
    })
}

db.getCollectionNames().forEach(function (collectionName) {
  var collection = db.getCollection(collectionName)
  var count = collection.count({})
  print(count, '\t', collectionName)
  if (count > 15000) {
    print('Very large collection. Consider excluding.')
  }
  // Ignore some collections
  if (ignoreCollections.indexOf(collectionName) !== -1) {
    print('Ignoring collection ' + collectionName)
    return false
  }
  if (count === 0) return false
  var counter = 0
  collection.find({}).forEach(function (document) {
    var found = false
    var clockValue = isClock(document)
    if (clockValue) {
      print(
        'Skipping document containing ' +
          clockValue +
          ' from collection ' +
          collectionName
      )
      return false
    }
    Object.keys(document).forEach(function (key) {
      if (typeof document[key] === 'string' && isPrivate(key)) {
        found = true
        document[key] = osfuscate(document[key])
      }
    })
    if (found) {
      collection.save(document)
      counter += 1
    }
  })
  if (counter > 0) print('\tUpdated', counter)
})
