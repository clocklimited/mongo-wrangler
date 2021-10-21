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
  return value.toLowerCase().indexOf('clock.co.uk') !== -1
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

function updatePrivateKeyMap(document, currentMap) {
  if (!currentMap) {
    return {}
  }
  if (!document) {
    return currentMap
  }
  var keys = Object.keys(document)
  var keysNotInMap = keys.filter(
    (key) => typeof currentMap[key] === 'undefined'
  )
  var updatedKeyMap = keysNotInMap.reduce(
    (acc, key) => Object.assign(acc, { [key]: isPrivate(key) }),
    currentMap
  )
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

    collectionPrivateKeyMap = updatePrivateKeyMap(
      document,
      collectionPrivateKeyMap
    )
    keys.forEach(function (key) {
      if (typeof document[key] === 'string') {
        if (isClock(document[key])) {
          found = false
          print(
            'Skipping document containing ' +
              document[key] +
              ' from collection ' +
              collectionName
          )
          return
        }
        if (collectionPrivateKeyMap[key]) {
          found = true
          document[key] = obfuscate(document[key])
        }
      }
    })
    if (found) {
      collection.save(document)
      counter += 1
    }
  })
  if (counter > 0) print('\tUpdated', counter)
})
