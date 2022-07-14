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
                availableInAm.push(`${start}:${item.timeFrom.substring(3, 5)}`)
                start++
             }
            for (let i = start; i <= stop; i += 1) {
                // console.log(i);
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
                            // if (item.timeTo.substring(3, 5) != '00')
                                availableInAm.push(`${i}:30`)
                        }
                    }

                }
            }
            allAvailableHours[countryCode] = {
                avalableHoursAm: availableInAm,
            }
            // console.log(allAvailableHours);
        }
        if (item.timeFrom.slice(-2) === 'am' && item.timeTo.slice(-2) === 'pm') {
            start = 1
            availableInPm.push(12 + ':00')
            // availableInPm.push(`12:${item.timeTo.substring(3, 5)}`)
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
                        // if (item.timeFrom.substring(3, 5) == '00') availableInPm.push(`${i}:00`)
                    }

                }
            }
            allAvailableHours[countryCode].avalableHoursPm = availableInPm
            // console.log(allAvailableHours);
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
            
            // for (let i = start; i <= stop; i += 1) {
            //     // console.log(i);
            //     availableInPm.push(i + ':00')
            //     if (spill || trailing) {
            //         if (item.timeFrom.slice(-2) == item.timeTo.slice(-2)) {
            //             availableInPm.push(`${i}:${item.timeTo.substring(3, 5)}`)

            //         } else {
            //             if (i != stop) availableInPm.push(i + ':30')
            //         }
            //     } else {
            //         if (i != stop) availableInPm.push(i + ':30')
            //     }
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
            availableInAm.push(12 + ':00')
            if (item.timeTo.substring(0, 2) == 12) {
                availableInAm.push(`${12}:${item.timeTo.substring(3, 5)}`)
            } else {
                availableInAm.push(12 + ':30')
            }
            // availableInAm.push(`12:${item.timeTo.substring(3, 5)}`)

            stop = parseInt(item.timeTo.substring(0, 2), 10)
            if (stop != 12) {
                for (let i = start; i <= stop; i += 1) {
                    availableInAm.push(i + ':00')
                    // console.log(stop);
                    // if (i != stop) availableInAm.push(`${i}:${item.timeTo.substring(3, 5)}`)
                    if (i != stop) {
                        availableInAm.push(`${i}:30`)
                    } else {
                        if (item.timeFrom.substring(3, 5) != '00') availableInAm.push(`${i}:${item.timeTo.substring(3, 5)}`)
                        // if (item.timeFrom.substring(3, 5) == '00') availableInAm.push(`${i}:00`)
                    }
                    // if (i != stop) availableInAm.push(i + ':30')
                }
            }
            allAvailableHours[countryCode].availableInAm = availableInAm
        }
    })
    // console.log(allAvailableHours);
    // console.log(recordedDates)

    
    // console.log(allAvailableHours);
    let amMerger = []
    let pmMerger = []
    const numberOfTimestamps = Object.keys(allAvailableHours).length
    
    
    Object.keys(allAvailableHours).forEach(function (key) {
        // amMerger = [...amMerger, ...allAvailableHours[key].avalableHoursAm]
        if (allAvailableHours[key].avalableHoursAm) amMerger = [...amMerger, ...allAvailableHours[key].avalableHoursAm]
        if (allAvailableHours[key].avalableHoursPm) pmMerger = [...pmMerger, ...allAvailableHours[key].avalableHoursPm]
    });
    
    // console.log(pmMerger);
    // console.log(amMerger);
    // console.log(recordedDates)

    // return
    let pmOverLap = [];
    let amOverLap = [];
    var amOverlapCount = 0;
    var pmOverlapCount = 0;
    
    // const pmOccurrenceCokunter = async (el) => {
    //     for (let i = 0; i < pmMerger.length; i += 1) {
    //         if(pmMerger[i] == el){
    //             pmOverlapCount++
    //         };
    //         // console.log(overlapCount, pmMerger[i]);
    //         if (pmOverlapCount === numberOfTimestamps) {
    //             pmOverLap.push(pmMerger[i])
    //         }
    //     }
        
    // };
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
        // console.log(amMerger[i])
    }

    let uniqueAm = [...new Set(amOverLap)];
    let uniquePm = [...new Set(pmOverLap)];


    console.log(uniqueAm);
    console.log(uniquePm);



    
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
