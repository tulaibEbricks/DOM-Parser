const mongoose = require('mongoose');

const WebPageData = new mongoose.Schema({
    webURL: {type: String, trim: true, unique: true},
    width: {type: Number},
    height: {type: Number},
    elementsDict: {type: {}, trim: true},
    timeStamp: {type: String, trim: true}
})

module.exports = mongoose.model('WebPageData', WebPageData)