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
    const allAvailableHours = {};
    // const allAvailableInPm = [];


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
        const availableInPm = [];
        let countryCode = item.cc
        

        if (item.timeFrom.slice(-2) === 'am') {
            let spill = false;
            let start = parseInt(item.timeFrom.substring(0, 2), 10);
            let stop = 0;
            let trailing = false;
            if (item.timeTo.slice(-2) === 'am') {
                stop = parseInt(item.timeTo.substring(0, 2), 10);
                trailing = true
            }
            if (item.timeTo.slice(-2) === 'pm') {
                // console.log('stop');
                stop = 11;
                spill = true
            }
            // console.log(item.cc, start);
            if (item.timeFrom.substring(3, 5) != '00') {
                // availableInAm.push(start)
                availableInAm.push(`${start}:${item.timeFrom.substring(3, 5)}`)
                start++
             }
            for (let i = start; i <= stop; i += 1) {
                // console.log(i);
                availableInAm.push(i)
                if (spill || trailing) {
                    if (item.timeFrom.slice(-2) == item.timeTo.slice(-2)) {
                        availableInAm.push(`${i}:${item.timeTo.substring(3, 5)}`)

                    } else {
                        if (i != stop) availableInAm.push(i + ':30')
                    }
                } else {
                    if (i != stop) availableInAm.push(i + ':30')
                }
            }
            // console.log(item.cc);
            allAvailableHours[countryCode] = {
                avalableHoursAm: availableInAm,
            }
            // console.log(allAvailableHours);
        }
        if (item.timeFrom.slice(-2) === 'am' && item.timeTo.slice(-2) === 'pm') {
            start = 1
            availableInPm.push(12)
            availableInPm.push(`12:${item.timeTo.substring(3, 5)}`)

            stop = parseInt(item.timeTo.substring(0, 2), 10)
            if (stop != 12) {
                for (let i = start; i <= stop; i += 1) {
                    availableInPm.push(i)
                    // console.log(stop);
                    if (i != stop) availableInPm.push(`${i}:${item.timeTo.substring(3, 5)}`)
                }
            }
            allAvailableHours[countryCode].avalableHoursPm = availableInPm
            console.log(allAvailableHours);
        }

        if (item.timeFrom.slice(-2) === 'pm') {
            let start = parseInt(item.timeFrom.substring(0, 2), 10);
            let stop = 0;
            let spill = false;
            let trailing = false;
            if (item.timeTo.slice(-2) === 'pm') {
                stop = parseInt(item.timeTo.substring(0, 2), 10);
            }
            if (item.timeTo.slice(-2) === 'am') {
                // console.log('stop');
                stop = 11;
                spill = true
            }
            // console.log(item.cc, start);
            if (item.timeFrom.substring(3, 5) != '00') {
                // availableInAm.push(start)
                availableInAm.push(`${start}:${item.timeFrom.substring(3, 5)}`)
                start++
            }
            for (let i = start; i <= stop; i += 1) {
                // console.log(i);
                availableInPm.push(i)
                if (spill || trailing) {
                    if (item.timeFrom.slice(-2) == item.timeTo.slice(-2)) {
                        availableInPm.push(`${i}:${item.timeTo.substring(3, 5)}`)

                    } else {
                        if (i != stop) availableInPm.push(i + ':30')
                    }
                } else {
                    if (i != stop) availableInPm.push(i + ':30')
                }
            }
            // for (let i = start; i <= stop; i += 1) {
            //     // console.log(i);
            //     availableInPm.push(i)
            //     if (spill) availableInPm.push(i + ':30')
            // }
            // console.log(item.cc);
            if (allAvailableHours[countryCode].avalableHoursPm) {
                allAvailableHours[countryCode].avalableHoursPm = [...allAvailableHours[countryCode].avalableHoursPm, ...avalableHoursPm]
            } else {
                allAvailableHours[countryCode].avalableHoursPm = avalableHoursPm
            }
        }
        if (item.timeFrom.slice(-2) === 'pm' && item.timeTo.slice(-2) === 'am') {
            start = 1
            availableInAm.push(12)
            availableInAm.push(`12:${item.timeTo.substring(3, 5)}`)

            stop = parseInt(item.timeTo.substring(0, 2), 10)
            if (stop != 12) {
                for (let i = start; i <= stop; i += 1) {
                    availableInAm.push(i)
                    // console.log(stop);
                    if (i != stop) availableInAm.push(`${i}:${item.timeTo.substring(3, 5)}`)
                    // if (i != stop) availableInAm.push(i + ':30')
                }
            }
            allAvailableHours[countryCode].availableInAm = availableInAm
            console.log(allAvailableHours);
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
