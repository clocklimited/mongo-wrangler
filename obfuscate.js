var privateProperties = [
  /email/,
  /firstName/,
  /lastName/,
  /surname/,
  /addressLine/,
  /postcode/,
  /password/
  ]

function isPrivate (propertyName) {
  return privateProperties.some(function (privatePropertyName) {
    return privatePropertyName.test(propertyName)
  })
}

function isClock (value) {
  return value.toLowerCase().indexOf('clock.co.uk') !== -1
}
var lowerChars = 'abcdefghijklmnopqrstuvwxyz'
var upperChars = lowerChars.toUpperCase()

function osfuscate (value) {
  return value.replace(/[a-z]/g, function () {
    return lowerChars[Math.floor(Math.random() * 26)]
  }).replace(/[A-Z]/g, function () {
    return upperChars[Math.floor(Math.random() * 26)]
  })
}

db.getCollectionNames().forEach(function (collectionName) {
  var collection = db.getCollection(collectionName)
  var count = collection.count({})
  print(count, '\t', collectionName)
  if (count > 15000) {
    print('Very large collection. Considered excluding.')
  }
  if (count === 0) return false
  var counter = 0
  collection.find({}).forEach(function (document) {
    var found = false
    Object.keys(document).forEach(function (key) {
      if (typeof document[key] === 'string' && isPrivate(key) && !isClock(document[key])) {
        found = true
        document[key] = osfuscate(document[key])
      }
    })
    if (found) {
      collection.save(document)
      counter += 1
    }
  })
  if (counter > 0)print('\tUpdated', counter)
})
