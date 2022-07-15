const express = require("express");
const router = express.Router();
const timezoneController = require("../controllers/timezoneController");


const AppError = require("../utilis/appError");

router.get("/timezone", timezoneController.getAllTimezones);

router.post("/timezones", timezoneController.checkForOverLaps);

module.exports = router;
