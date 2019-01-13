const mongoose = require('mongoose');
const timestamp = require('mongoose-timestamp');

const UrlEntrySchema = new mongoose.Schema({
    originalURL: {
        type: String,
        required: true,
        trim: true
    },
    miniURL: {
        type: String,
        required: true,
        trim: true
    },
    customName: {
        type: String,
        default: null
    }
});

UrlEntrySchema.plugin(timestamp);

const UrlEntry = mongoose.model('UrlEntry', UrlEntrySchema);
module.exports = UrlEntry;
