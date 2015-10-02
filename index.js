module.exports = exports = function htoTimestamps(schema, options) {
  var trackCreatedAt = !options || options.createdAt !== false
    , trackUpdatedAt = !options || options.updatedAt !== false

  if (trackCreatedAt) schema.add({ createdAt : { type : Date, index : true } })
  if (trackUpdatedAt) schema.add({ updatedAt : { type : Date, index : true } })

  schema.pre('save', function(next) {
    var currentDate = new Date()

    if (trackUpdatedAt && !this.isModified('updatedAt')) {
      this.updatedAt = currentDate
    }

    if (trackCreatedAt && !this.createdAt) {
      this.createdAt = currentDate
    }

    next()
  })
}