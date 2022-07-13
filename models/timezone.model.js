const mongoose = require("mongoose");
const timeZone = new mongoose.Schema({
    country: { type: String, required: true },
    title: { type: String, required: true },
    author: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true }
});
const Product = mongoose.model("timeZone", timeZone);
module.exports = Product;