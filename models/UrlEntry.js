const mongoose = require('mongoose');

const UrlEntrySchema = new mongoose.Schema({
    _id: {
        type: Number,
        required: true
    },
    originalURL: {
        type: String,
        required: true,
        trim: true
    },
    miniURL: {
        type: String,
        required: false,
        trim: true
    },
    customName: {
        type: String,
        default: null
    },
    dateCreated: {
        type: Number,
        required: true
    },
    dateUpdated: {
        type: Number,
        required: true
    },
    lastDateAccessed: {
        type: Number,
        required: true
    },
});

const UrlEntry = mongoose.model('UrlEntry', UrlEntrySchema);
module.exports = UrlEntry;
