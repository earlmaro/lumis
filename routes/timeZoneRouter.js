const express = require("express");
const router = express.Router();
let timezone = require("../models/timezone.model");
const timezoneController = require("../controllers/timezoneController");


const AppError = require("../utilis/appError");

router.get("/timezone", timezoneController.getAllTimezones);

router.post("/timezones", timezoneController.checkForOverLaps);

// "dates": [
//     {
//         "from": "2022-05-02T09:00:00.0+08:00",
//         "to": "2022-05-02T17:00:00.0+08:00",
//         "CC": "SG"
//     },
//     {
//         "from": "2022-05-02T09:00:00.0+01:00",
//         "to": "2022-05-02T17:00:00.0+01:00",
//         "CC": "NG"
//     },
//     {
//         "from": "2022-05-02T09:00:00.0+05:30",
//         "to": "2022-05-02T17:00:00.0+05:30",
//         "CC": "IN"
//     }
// ]

module.exports = router;
