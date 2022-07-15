const catchAsync = require("../utilis/catchAsync");
const AppError = require("../utilis/appError");
const Regions = require("../utilis/regions");

const fetch = require("node-fetch");


var moment = require('moment');

exports.getAllTimezones = catchAsync(async (req, res, next) => {
    const regions = Regions;
    if (!regions) {
        return next(new AppError("No document found", 404));
    }
    res.status(200).json({
        status: "success",
        message: "Documents fetched!",
        data: {
            regions
        }
    });
});
// function to get holidays from google calendar
const getHoliday = async (zone) => {
    const BASE_CALENDAR_URL = "https://www.googleapis.com/calendar/v3/calendars";
    const BASE_CALENDAR_ID_FOR_PUBLIC_HOLIDAY = "holiday@group.v.calendar.google.com"; // Calendar Id. This is public but apparently not documented anywhere officialy.
    const API_KEY = "AIzaSyAuS2w0bGLnH_4smxcfEQpW15wODksXk-c";
    const CALENDAR_REGION = `en.${zone}`;

    const url = `${BASE_CALENDAR_URL}/${CALENDAR_REGION}%23${BASE_CALENDAR_ID_FOR_PUBLIC_HOLIDAY}/events?key=${API_KEY}`
    try {
        const response = await fetch(url).catch((err) => console.log(err));
        const json = await response.json();
        return json;
    } catch (error) {
        return error;
    }
};

exports.checkForOverLaps = catchAsync(async (req, res, next) => {
    let dates = req.body.dates;
    const recordedDates = [];
    const allAvailableHours = {};
    var requestStartDate = '';
    var requestEndDate = '';
    var datesValid = true;
    var countryCodes = [];

    Object.keys(allAvailableHours).length
    if (dates.length === 0 || dates.length === 1) {
        res.status(400).json({
            status: "Fail",
            message: 'Ooops! Invalid request',
        });
        return;
    }

    // process and validate request data
    dates.forEach((item, index) => {
        let timeFrom = moment(item.from).format("hh:mm:ss a");
        let timeTo = moment(item.to).format("hh:mm:ss a");
        var dateFrom = moment(item.from).format("YYYY-MM-DD");
        var dateTo = moment(item.to).format("YYYY-MM-DD");
        countryCodes.push(item.cc);
        if (index === 0) requestStartDate = dateFrom;
        if (index === 0) requestEndDate = dateTo;
        if (dateFrom != requestStartDate) {
            datesValid = false;
        }
        if (dateFrom !== dateTo) {
            datesValid = false;
        }
        if (dateTo != requestEndDate) {
            datesValid = false;
        }
        // create an array of objects to hold processed and validated request data
        recordedDates.push({
            dateFrom: dateFrom,
            timeFrom: timeFrom,
            dateTo: dateTo,
            timeTo: timeTo,
            cc: item.cc
        });
    })
    // response if request data fails validation
    if (!datesValid) {
        res.status(400).json({
            status: "Fail",
            message: 'Ooops! Dates on timestamps do not match',
        });
        return;
    }
    var holidayList = [];
    var fetchHolidayFailed = false;

    // fetch holidays for requested regions into an array
    for (const el of countryCodes) {
        const holiday = await getHoliday(el);
        if (holiday.error) {
            fetchHolidayFailed = true;
        }

        if (!fetchHolidayFailed) {
            holiday.items.forEach(element => {
                holidayList.push({
                    start: element.start.date,
                    end: element.end.date,
                })
            });
        }
    }

    if (fetchHolidayFailed) {
        res.status(400).json({
            status: "Fail",
            message: 'Ooops! Unable to fetch holiday list',
        });
        return
    }
    
    var holidayStatus = false;

    // check if the requested date is a holiday in any of the requested regions
    if (holidayList.length !== 0) {
        holidayList.forEach(item => {
            if (item.start === requestStartDate) {
                holidayStatus = true;
            }
        })
    }
    // response if the date is a holiday
    if (holidayStatus) {
        res.status(400).json({
            status: "Fail",
            message: 'Ooops! there seems to be an holiday for the selected day',
        });
        return;
    }

//     looping processed array of objects to get request time and break
//     them down into an array of hours e.g 1am => 4am amounts to[1: 00, 1: 30, 2: 00, 2: 30, 3: 00, 3: 30, 4: 00]for am
//    and another array for pm.
    recordedDates.forEach((item, index) => {
        const availableInAm = [];
        const availableInPm = [];
        let countryCode = item.cc;

        if (item.timeFrom.slice(-2) === 'am') {
            let spill = false;
            let start = parseInt(item.timeFrom.substring(0, 2), 10);
            let stop = 0;
            let trailing = false;
            if (item.timeTo.slice(-2) === 'am') {
                stop = parseInt(item.timeTo.substring(0, 2), 10);
                trailing = true;
            }
            if (item.timeTo.slice(-2) === 'pm') {
                stop = 11;
                spill = true;
            }
            if (item.timeFrom.substring(3, 5) != '00') {
                availableInAm.push(`${start}:${item.timeFrom.substring(3, 5)}`);
                start++;
             }
            for (let i = start; i <= stop; i += 1) {
                if (i != stop) {
                    availableInAm.push(i + ':00');
                    availableInAm.push(i + ':30');
                 }
                if (i == stop) {
                    availableInAm.push(i + ':00');
                    if (spill || trailing) {
                        if (item.timeFrom.slice(-2) == item.timeTo.slice(-2) && trailing) {
                            if (item.timeTo.substring(3, 5) != '00') availableInAm.push(`${i}:${item.timeTo.substring(3, 5)}`);
                        }
                        if (item.timeFrom.slice(-2) != item.timeTo.slice(-2) && spill) {
                            availableInAm.push(`${i}:30`);
                        }
                    }

                }
            }
            // updating an array of objects with the available hours in am for every region requested
            allAvailableHours[countryCode] = {
                avalableHoursAm: availableInAm,
            };
        }
        if (item.timeFrom.slice(-2) === 'am' && item.timeTo.slice(-2) === 'pm') {
            start = 1;
            availableInPm.push(12 + ':00');
            if (item.timeTo.substring(0, 2) == 12) {
                availableInPm.push(`${12}:${item.timeTo.substring(3, 5)}`);
            } else {
                availableInPm.push(12 + ':30');
            }

            stop = parseInt(item.timeTo.substring(0, 2), 10)
            if (stop != 12) {
                for (let i = start; i <= stop; i += 1) {
                    availableInPm.push(i + ':00');
                    if (i != stop) {
                        availableInPm.push(`${i}:30`);
                    } else {
                        if (item.timeFrom.substring(3, 5) != '00') availableInPm.push(`${i}:${item.timeTo.substring(3, 5)}`);
                    }

                };
            }
            // updating an array of objects with the available hours in pm for every region requested
            allAvailableHours[countryCode].avalableHoursPm = availableInPm;
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
                spill = true;
            }
            if (item.timeFrom.substring(3, 5) != '00') {
                availableInAm.push(`${start}:${item.timeFrom.substring(3, 5)}`);
                start++;
            }

            for (let i = start; i <= stop; i += 1) {
                if (i != stop) {
                    availableInPm.push(i + ':00');
                    availableInPm.push(i + ':30');
                }
                if (i == stop) {
                    availableInPm.push(i + ':00');
                    if (spill || trailing) {
                        if (item.timeFrom.slice(-2) == item.timeTo.slice(-2) && trailing) {
                            if (item.timeTo.substring(3, 5) != '00') availableInPm.push(`${i}:${item.timeTo.substring(3, 5)}`);
                        }
                        if (item.timeFrom.slice(-2) != item.timeTo.slice(-2) && spill) {
                            availableInPm.push(`${i}:30`);
                        }
                    }
                }
            }
            // updating an array of objects with the available hours in pm for every region requested
            if (allAvailableHours[countryCode].avalableHoursPm) {
                allAvailableHours[countryCode].avalableHoursPm = [...allAvailableHours[countryCode].avalableHoursPm, ...avalableHoursPm];
            } else {
                allAvailableHours[countryCode].avalableHoursPm = avalableHoursPm;
            }
        }
        if (item.timeFrom.slice(-2) === 'pm' && item.timeTo.slice(-2) === 'am') {
            start = 1;
            availableInAm.push(12 + ':00');
            if (item.timeTo.substring(0, 2) == 12) {
                availableInAm.push(`${12}:${item.timeTo.substring(3, 5)}`);
            } else {
                availableInAm.push(12 + ':30');
            }
            stop = parseInt(item.timeTo.substring(0, 2), 10);
            if (stop != 12) {
                for (let i = start; i <= stop; i += 1) {
                    availableInAm.push(i + ':00');
                    if (i != stop) {
                        availableInAm.push(`${i}:30`);
                    } else {
                        if (item.timeFrom.substring(3, 5) != '00') availableInAm.push(`${i}:${item.timeTo.substring(3, 5)}`);
                    }
                }
            }
            // updating an array of objects with the available hours in am for every region requested
            allAvailableHours[countryCode].availableInAm = availableInAm;
        }
    })

    let amMerger = [];
    let pmMerger = [];
    // number of dates in request(i.e number of users looking to collaborate)
    const numberOfTimestamps = Object.keys(allAvailableHours).length;
    
     // merging all available hours into one array and saving them into an array object
    Object.keys(allAvailableHours).forEach(function (key) {
        if (allAvailableHours[key].avalableHoursAm) amMerger = [...amMerger, ...allAvailableHours[key].avalableHoursAm]
        if (allAvailableHours[key].avalableHoursPm) pmMerger = [...pmMerger, ...allAvailableHours[key].avalableHoursPm]
    });
    
    let pmOverLap = [];
    let amOverLap = [];
    var amOverlapCount = 0;
    var pmOverlapCount = 0;
    
    // processing item in pm merged array to check if the number of times it occurs is equal to the number of dates in the request
    const pmOccurrenceCounter = async (el) => {
        for (let i = 0; i < pmMerger.length; i += 1) {
            if (pmMerger[i] == el) {
                pmOverlapCount++;
                if (pmOverlapCount === numberOfTimestamps) pmOverLap.push(pmMerger[i]);
            };
        }

    };
    // processing item in am merged array to check if the number of times it occurs is equal to the number of dates in the request
    const amOccurrenceCounter = async (el) => {
        for (let i = 0; i < amMerger.length; i += 1) {
            if (amMerger[i] == el) {
                amOverlapCount++;
                if (amOverlapCount === numberOfTimestamps) amOverLap.push(amMerger[i]);
            };
        }

    };

    // sending items in merged array for processing
    for (let i = 0; i < pmMerger.length; i += 1) {
        pmOverlapCount = 0;
        pmOccurrenceCounter(pmMerger[i]);
    }
    // sending items in merged array for processing
    for (let i = 0; i < amMerger.length; i += 1) {
        amOverlapCount = 0;
        amOccurrenceCounter(amMerger[i]);
    }

    // extracting unique values from results from processing merged arrays using a set
    let uniqueAm = [...new Set(amOverLap)];
    let uniquePm = [...new Set(pmOverLap)];

    // converting back into an array
    let arrayUniquePm = [...uniquePm];
    let arrayUniqueAm = [...uniqueAm];

    //sorting the array
    arrayUniquePm = arrayUniquePm.sort((a, b) => parseInt(a.substring(0, 2)) - parseInt(b.substring(0, 2)));
    arrayUniqueAm = arrayUniqueAm.sort((a, b) => parseInt(a.substring(0, 2)) - parseInt(b.substring(0, 2)));

    // formatting array items
    for (let i = 0; i < arrayUniqueAm.length; i++){
        if (arrayUniqueAm[i].split(":")[0].length == 1) {
            let left = arrayUniqueAm[i].split(":")[0];
            let right = arrayUniqueAm[i].split(":")[1];
            left = '0' + left;
            let fullString = left + ':' + right;
            arrayUniqueAm[i] = fullString;
        }
    }
    // formatting array items
    for (let i = 0; i < arrayUniquePm.length; i++) {
        if (arrayUniquePm[i].split(":")[0].length == 1) {
            let left = arrayUniquePm[i].split(":")[0];
            let right = arrayUniquePm[i].split(":")[1];
            left = '0' + left;
            let fullString = left + ':' + right;
            arrayUniquePm[i] = fullString;
        }
    }
    
    let overlapStartTime = '';
    let overlapEndTime = '';
    let overlapDate = requestStartDate;


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
            start_time: overlapStartTime.toISOString(),
            end_time: overlapEndTime.toISOString()
        }
    });
});
