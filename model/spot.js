const mongoose = require('mongoose');

const spotSchema = new mongoose.Schema({
    location: {
        type: String,
    },
    owner: [mongoose.Schema.Types.ObjectId], // the admin
    name: {
        type: String,
    },
    source: {
        type: String
    },

})

const Spots = mongoose.model('Spot', spotSchema);


exports.Spots = Spots;
exports.spotSchema = spotSchema;