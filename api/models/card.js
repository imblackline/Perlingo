const mongoose = require('mongoose');

const cardSchema = mongoose.Schema({
    _id : mongoose.Schema.Types.ObjectId,
    text : String,
    translation : String,
    status : String,
})

module.exports = mongoose.model('Card', cardSchema)