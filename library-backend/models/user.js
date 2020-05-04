const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const schema = new mongoose.Schema({
  username: {
    type: String,
    minLength: 4,
    unique: true,
    required: true
  },
  favoriteGenre: String
})

schema.plugin(uniqueValidator)

module.exports = mongoose.model('User', schema)