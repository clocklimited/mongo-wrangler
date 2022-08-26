db.getCollectionNames().forEach(function (collection) {
  indexes = db
    .getCollection(collection)
    .getIndexes()
    .forEach(function (index) {
      if (index.name === '_id_') return // skip defalut _id indexes
      const keys = tojsononeline(index.key)
      delete index.id
      delete index.key
      delete index.v
      delete index.ns
      print(
        "db['" +
          collection +
          "'].createIndex(" +
          keys +
          ', ' +
          tojsononeline(index) +
          ');'
      )
    })
})
