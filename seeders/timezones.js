const timeZone = require("../models/timezone.model");
const mongoose = require("mongoose");
const dev = require("../config/dev"); //get your mongoose string
//create your array. i inserted only 1 object here
const products = [
    new Product({
        image:
            "https://static.seattletimes.com/wp-content/uploads/2018/01/a8e801dc-f665-11e7-bf8f-ddd02ba4a187-780x1181.jpg",
        title: "Origin",
        author: "Dan Brown",
        description:
            "2017 mystery thriller novel. Dan Brown is back with another thriller so moronic you can feel your IQ points flaking away like dandruff",
        price: 12
    }),]
//connect mongoose
mongoose
    .connect(String(dev.db), { useNewUrlParser: true })
    .catch(err => {
        console.log(err.stack);
        process.exit(1);
    })
    .then(() => {
        console.log("connected to db in development environment");
    });
//save your data. this is an async operation
//after you make sure you seeded all the products, disconnect automatically
products.map(async (p, index) => {
    await p.save((err, result) => {
        if (index === products.length - 1) {
            console.log("DONE!");
            mongoose.disconnect();
        }
    });
});