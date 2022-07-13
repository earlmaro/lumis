const timeZone = require("../models/timezone.model");
const mongoose = require("mongoose");
require("dotenv").config(); //get your mongoose string
const uri = process.env.ATLAS_URI;
//create your array. i inserted only 1 object here
const timeZones = [
    {
        country:
            "Philippines",
        UTC: "+02:00",
        DST: "+03:00",
        Dst_start_day:
            "",
        Dst_start_week:
            "",
        Dst_start_month:
            "",
        Dst_start_add_hours:
            "",
        Dst_stop_day:
            "",
        Dst_stop_week:
            "",
        Dst_stop_month:
            "",
        Dst_stop_sub_hours:
            ""
    },
    {
        country:
            "Philipffpines",
        UTC: "+02:00",
        DST: "+03:00",
        Dst_start_day:
            "",
        Dst_start_week:
            "",
        Dst_start_month:
            "",
        Dst_start_add_hours:
            "",
        Dst_stop_day:
            "",
        Dst_stop_week:
            "",
        Dst_stop_month:
            "",
        Dst_stop_sub_hours:
            ""
    },
    {
        country:
            "Ukraine",
        UTC: "+02:00",
        DST: "+03:00",
        Dst_start_day:
            "sunday",
        Dst_start_week:
            "last",
        Dst_start_month:
            "2",
        Dst_start_add_hours:
            "02:00",
        Dst_stop_day:
            "sunday",
        Dst_stop_week:
            "last",
        Dst_stop_month:
            "9",
        Dst_stop_sub_hours:
            "03:00"
    },
    {
        country:
            "United Kingdom",
        UTC: "+00:00",
        DST: "+01:00",
        Dst_start_day:
            "sunday",
        Dst_start_week:
            "last",
        Dst_start_month:
            "2",
        Dst_start_add_hours:
            "01:00",
        Dst_stop_day:
            "sunday",
        Dst_stop_week:
            "last",
        Dst_stop_month:
            "9",
        Dst_stop_sub_hours:
            "02:00"
    },
]
//connect mongoose
mongoose
    .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .catch(err => {
        console.log(err.stack);
        process.exit(1);
    })
    .then(() => {
        console.log("connected to db in development environment");
    });
//save your data. this is an async operation
//after you make sure you seeded all the products, disconnect automatically
timeZones.map(async (p, index) => {
    data = new timeZone(p)
    data.save((err, result) => {
        if (index === timeZones.length - 1) {
            console.log("DONE!");
            mongoose.disconnect();
        }
    });
});