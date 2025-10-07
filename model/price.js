const mongoose = require('mongoose');

const priceSchema = new mongoose.Schema({
    duration:{
        type:String,
        required:true
    },
    amount:{
        type:String,
        required:true
    },
    spot:[mongoose.Schema.Types.ObjectId],
})


const Prices = mongoose.model("Price", priceSchema);

exports.priceSchema = priceSchema;
exports.Prices = Prices;