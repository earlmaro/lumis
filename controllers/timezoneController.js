const catchAsync = require("../utilis/catchAsync");
const AppError = require("../utilis/appError");
let timezone = require("../models/timezone.model");

var moment = require('moment');

exports.getAllTimezones = catchAsync(async (req, res, next) => {
    const doc = await timezone.find();
    if (!doc) {
        return next(new AppError("No document found", 404));
    }
    res.status(200).json({
        status: "success",
        message: "Documents fetched!",
        data: {
            doc
        }
    });
});

exports.checkForOverLaps = catchAsync(async (req, res, next) => {
    // console.log(req.body.dates);
    let dates = req.body.dates;
    const recordedDates = [];
    const allAvailableInPm = [];

    dates.forEach((item, index) => {
        // console.log(index, item)
        item.from = Date.parse(item.from);
        item.to = Date.parse(item.to);
        item.from = new Date(item.from)
        item.to = new Date(item.to)
        let timeFrom = moment(item.from).format("hh:mm:ss a")
        let timeTo = moment(item.to).format("hh:mm:ss a")
        var dateFrom = moment(item.from).format("YYYY-MM-DD")
        var dateTo = moment(item.to).format("YYYY-MM-DD")
        recordedDates.push({
            dateFrom: dateFrom,
            timeFrom: timeFrom,
            dateTo: dateTo,
            timeTo: timeTo,
            cc: item.cc
        })
    })
    recordedDates.forEach((item, index) => {
        const availableInAm = [];
        if (item.timeFrom.slice(-2) === 'am') {
            const start = parseInt(item.timeFrom.substring(0, 2), 10);
            let stop = 0;
            if (item.timeTo.slice(-2) === 'am') {
                stop = parseInt(item.timeTo.substring(0, 2), 10);
            }
            if (item.timeTo.slice(-2) === 'pm') {
                // console.log('stop');
                stop = 12 - parseInt(item.timeFrom.substring(0, 2), 10);
            }
            for (let i = start; i <= stop; i += 1){
                availableInAm.push(i)
                // console.log(stop);
                if (i != stop) availableInAm.push(i + ':30')
            }
            allAvailableInPm.push({
                avalableHoursAm: availableInAm,

            })
            console.log(availableInAm);
        }
     })

    
    console.log(recordedDates)

    const doc = 'req';
    if (!doc) {
        return next(new AppError("No document found", 404));
    }
    res.status(200).json({
        status: "success",
        message: "Documents fetched!",
        data: {
            doc
        }
    });
});
