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
    let dates = req.body.dates;
    const recordedDates = [];
    const allAvailableHours = {};


    dates.forEach((item, index) => {
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
                stop = 11;
                spill = true
            }
            if (item.timeFrom.substring(3, 5) != '00') {
                availableInAm.push(`${start}:${item.timeFrom.substring(3, 5)}`)
                start++
             }
            for (let i = start; i <= stop; i += 1) {
                if (i != stop) {
                    availableInAm.push(i + ':00')
                    availableInAm.push(i + ':30')
                 }
                if (i == stop) {
                    availableInAm.push(i + ':00')
                    if (spill || trailing) {
                        if (item.timeFrom.slice(-2) == item.timeTo.slice(-2) && trailing) {
                            if (item.timeTo.substring(3, 5) != '00') availableInAm.push(`${i}:${item.timeTo.substring(3, 5)}`)
                        }
                        if (item.timeFrom.slice(-2) != item.timeTo.slice(-2) && spill) {
                                availableInAm.push(`${i}:30`)
                        }
                    }

                }
            }
            allAvailableHours[countryCode] = {
                avalableHoursAm: availableInAm,
            }
        }
        if (item.timeFrom.slice(-2) === 'am' && item.timeTo.slice(-2) === 'pm') {
            start = 1
            availableInPm.push(12 + ':00')
            if (item.timeTo.substring(0, 2) == 12) {
                availableInPm.push(`${12}:${item.timeTo.substring(3, 5)}`)
            } else {
                availableInPm.push(12 + ':30')
            }

            stop = parseInt(item.timeTo.substring(0, 2), 10)
            if (stop != 12) {
                for (let i = start; i <= stop; i += 1) {
                    availableInPm.push(i + ':00')
                    if (i != stop) {
                        availableInPm.push(`${i}:30`)
                    } else {
                        if (item.timeFrom.substring(3, 5) != '00') availableInPm.push(`${i}:${item.timeTo.substring(3, 5)}`)
                    }

                }
            }
            allAvailableHours[countryCode].avalableHoursPm = availableInPm
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
                stop = 11;
                spill = true
            }
            if (item.timeFrom.substring(3, 5) != '00') {
                availableInAm.push(`${start}:${item.timeFrom.substring(3, 5)}`)
                start++
            }

            for (let i = start; i <= stop; i += 1) {
                if (i != stop) {
                    availableInPm.push(i + ':00')
                    availableInPm.push(i + ':30')
                }
                if (i == stop) {
                    availableInPm.push(i + ':00')
                    if (spill || trailing) {
                        if (item.timeFrom.slice(-2) == item.timeTo.slice(-2) && trailing) {
                            if (item.timeTo.substring(3, 5) != '00') availableInPm.push(`${i}:${item.timeTo.substring(3, 5)}`)
                        }
                        if (item.timeFrom.slice(-2) != item.timeTo.slice(-2) && spill) {
                            // if (item.timeTo.substring(3, 5) != '00')
                            availableInPm.push(`${i}:30`)
                        }
                    }
                }
            }
            
            if (allAvailableHours[countryCode].avalableHoursPm) {
                allAvailableHours[countryCode].avalableHoursPm = [...allAvailableHours[countryCode].avalableHoursPm, ...avalableHoursPm]
            } else {
                allAvailableHours[countryCode].avalableHoursPm = avalableHoursPm
            }
        }
        if (item.timeFrom.slice(-2) === 'pm' && item.timeTo.slice(-2) === 'am') {
            start = 1
            availableInAm.push(12 + ':00')
            if (item.timeTo.substring(0, 2) == 12) {
                availableInAm.push(`${12}:${item.timeTo.substring(3, 5)}`)
            } else {
                availableInAm.push(12 + ':30')
            }

            stop = parseInt(item.timeTo.substring(0, 2), 10)
            if (stop != 12) {
                for (let i = start; i <= stop; i += 1) {
                    availableInAm.push(i + ':00')
                    if (i != stop) {
                        availableInAm.push(`${i}:30`)
                    } else {
                        if (item.timeFrom.substring(3, 5) != '00') availableInAm.push(`${i}:${item.timeTo.substring(3, 5)}`)
                    }
                }
            }
            allAvailableHours[countryCode].availableInAm = availableInAm
        }
    })

    let amMerger = []
    let pmMerger = []
    const numberOfTimestamps = Object.keys(allAvailableHours).length
    
    
    Object.keys(allAvailableHours).forEach(function (key) {
        if (allAvailableHours[key].avalableHoursAm) amMerger = [...amMerger, ...allAvailableHours[key].avalableHoursAm]
        if (allAvailableHours[key].avalableHoursPm) pmMerger = [...pmMerger, ...allAvailableHours[key].avalableHoursPm]
    });
    
    let pmOverLap = [];
    let amOverLap = [];
    var amOverlapCount = 0;
    var pmOverlapCount = 0;
    

    const pmOccurrenceCounter = async (el) => {
        for (let i = 0; i < pmMerger.length; i += 1) {
            if (pmMerger[i] == el) {
                pmOverlapCount++
                if (pmOverlapCount === numberOfTimestamps) pmOverLap.push(pmMerger[i])
            };
        }

    };
    const amOccurrenceCounter = async (el) => {
        for (let i = 0; i < amMerger.length; i += 1) {
            if (amMerger[i] == el) {
                amOverlapCount++
                if (amOverlapCount === numberOfTimestamps) amOverLap.push(amMerger[i])
            };
        }

    };

    for (let i = 0; i < pmMerger.length; i += 1) {
        pmOverlapCount = 0;
        pmOccurrenceCounter(pmMerger[i]);
    }
    for (let i = 0; i < amMerger.length; i += 1) {
        amOverlapCount = 0;
        amOccurrenceCounter(amMerger[i]);
    }

    let uniqueAm = [...new Set(amOverLap)];
    let uniquePm = [...new Set(pmOverLap)];

    let arrayUniquePm = [...uniquePm];
    let arrayUniqueAm = [...uniqueAm];

    arrayUniquePm = arrayUniquePm.sort((a, b) => parseInt(a.substring(0, 2)) - parseInt(b.substring(0, 2)));
    arrayUniqueAm = arrayUniqueAm.sort((a, b) => parseInt(a.substring(0, 2)) - parseInt(b.substring(0, 2)));
    for (let i = 0; i < arrayUniqueAm.length; i++){
        if (arrayUniqueAm[i].split(":")[0].length == 1) {
            let left = arrayUniqueAm[i].split(":")[0]
            let right = arrayUniqueAm[i].split(":")[1]
            left = '0' + left
            let fullString = left + ':' + right
            arrayUniqueAm[i] = fullString
        }
    }
    for (let i = 0; i < arrayUniquePm.length; i++) {
        if (arrayUniquePm[i].split(":")[0].length == 1) {
            let left = arrayUniquePm[i].split(":")[0]
            let right = arrayUniquePm[i].split(":")[1]
            left = '0' + left
            let fullString = left + ':' + right
            arrayUniquePm[i] = fullString
        }
    }
    
    let overlapStartTime = ''
    let overlapEndTime = ''
    let overlapDate = '2022-05-02'

    // arrayUniquePm = []
    // arrayUniqueAm = []


    if (arrayUniquePm.length < 1 && arrayUniqueAm.length < 1) {
        res.status(400).json({
            status: "Fail",
            message: 'Ooops! your selected time range is unavailable',
        });
    }

    if (arrayUniquePm.length !== 0 && arrayUniqueAm.length === 0) {
        if (arrayUniquePm.length === 1) {
            res.status(400).json({
                status: "Fail",
                message: 'Ooops! your selected time range is unavailable',
            });
        }
        overlapStartTime = moment(overlapDate + ' ' + arrayUniquePm[0]);
        overlapEndTime = moment(overlapDate + ' ' + arrayUniquePm[arrayUniquePm.length - 1]);
    }
    
    if (arrayUniquePm.length === 0 && arrayUniqueAm.length !== 0) {
        if (arrayUniqueAm.length === 1) {
            res.status(400).json({
                status: "Fail",
                message: 'Ooops! your selected time range is unavailable',
            });
        }
        overlapStartTime = moment(overlapDate + ' ' + arrayUniqueAm[0]);
        overlapEndTime = moment(overlapDate + ' ' + arrayUniqueAm[arrayUniqueAm.length - 1]);
    }

    if (arrayUniquePm.length > 0 && arrayUniqueAm.length > 0) {

        overlapStartTime = moment(overlapDate + ' ' + arrayUniqueAm[0]);
        overlapEndTime = moment(overlapDate + ' ' + arrayUniquePm[arrayUniquePm.length - 1]);
    }
    
    if (!overlapStartTime || !overlapEndTime) {
        return next(new AppError("No time range found", 404));
    }
    res.status(200).json({
        status: "success",
        message: "The following time range is currently available",
        data: {
            start_time: overlapStartTime,
            end_time: overlapEndTime
        }
    });
});
