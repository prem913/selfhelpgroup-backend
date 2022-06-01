const mongoose = require('mongoose');

const zoneSchema = mongoose.Schema({
    zonename: {
        type: String,
        required: true
    },
    institutes: [
        {
            instituteid: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Institute",
                required: true
            },
            institutename: {
                type: String,
                required: true
            },
        },
    ],
    shgs: [
        {
            shgid: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Shg",
                required: true
            },
            shgname: {
                type: String,
                required: true
            },
        },
    ],
})

module.exports = mongoose.model('Zone', zoneSchema);