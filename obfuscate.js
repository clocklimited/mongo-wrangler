var privateProperties = [
  /email/,
  /firstName/,
  /lastName/,
  /surname/,
  /addressLine/,
  /street1/,
  /street2/,
  /postcode/,
  /postalCode/,
  /first_name/,
  /last_name/,
  /phone/,
  /birthday/,
  /nationality/,
  /full_name/

]

var ignoreCollections = ['player']

function isPrivate(propertyName) {
  return privateProperties.some(function (privatePropertyName) {
    return privatePropertyName.test(propertyName)
  })
}

function isClock(value) {
  return value.toLowerCase().indexOf('clock.co.uk') !== -1
}

var lowerChars = 'abcdefghijklmnopqrstuvwxyz1234567890'
var upperChars = lowerChars.toUpperCase()

function obfuscate(value) {
  return value
    .replace(/[a-z0-9]/g, function () {
      return lowerChars[Math.floor(Math.random() * 36)]
    })
    .replace(/[A-Z]/g, function () {
      return upperChars[Math.floor(Math.random() * 26)]
    })
}

function updatePrivateKeyMap(document, currentMap) {
  if (!currentMap) {
    return {}
  }
  if (!document) {
    return currentMap
  }
  var keys = Object.keys(document)
  var keysNotInMap = keys.filter(function (key) {
    return typeof currentMap[key] === 'undefined'
  })
  var updatedKeyMap = keysNotInMap.reduce(function (acc, key) {
    acc[key] = isPrivate(key)
    return acc
  }, currentMap)
  return updatedKeyMap
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
  var collectionPrivateKeyMap = {}

  collection.find({}).forEach(function (document) {
    var found = false
    var keys = Object.keys(document)
    var totalKeys = keys.length

    collectionPrivateKeyMap = updatePrivateKeyMap(
      document,
      collectionPrivateKeyMap
    )
    for (var i = 0; i < totalKeys; i++) {
      var key = keys[i]
      if (typeof document[key] === 'string') {
        if (isClock(document[key])) {
          found = false
          print(
            'Skipping document containing ' +
              document[key] +
              ' from collection ' +
              collectionName
          )
          break
        }
        if (collectionPrivateKeyMap[key]) {
          found = true
          document[key] = obfuscate(document[key])
        }
      } else if (Array.isArray(document[key]) && collectionPrivateKeyMap[key]) {
        found = true
        document[key] = document[key].map((value) => obfuscate(value))
      }
    }

    if (found) {
      collection.save(document)
      counter += 1
    }
  })
  if (counter > 0) print('\tUpdated', counter)
})
