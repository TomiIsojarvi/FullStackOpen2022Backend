const mongoose = require('mongoose')

const config = require('../utils/config')

const blogSchema = mongoose.Schema({
  title: String,
  author: String,
  url: String,
  likes: Number,
  user: {
    username: String,
    name: String,
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }
})

blogSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

const mongoUrl = config.MONGODB_URI
mongoose.connect(mongoUrl)

module.exports = mongoose.model('Blog', blogSchema)