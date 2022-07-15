## Introduction

The project is my solution to the test assessment, it solves the problem of figuring out overlapping times for meetings(different times) across different time zones.

this project contains code that takes multiple times and returns a range of times that overlaps and is available across their timezones.


## Installation
1. Run this command to create a docker image of the project - docker build -t lumis-test. 
2. Run this command to spin-off a container with the project -  docker run -it -p 9000:5000 lumis-test.

This project was built with the following:

- Node: A JavaScript runtime built on Chrome's V8 JavaScript engine.
- Fetch: A promised-based HTTP client for the browser and Node.js.
- Moment: A JavaScript library that helps in parsing, validating, manipulating, and displaying date/time.
- Docker: For shipping, and running the application.
- Google Calendar: For getting holidays across google supported regions.


## Implementation

My project implementation started with me breaking down the timestamps into arrays of hours (am and pm), merging them, thereby having compound arrays consisting of all the hours available to all users.

Then I run a check to get hours with a number of occurrences equal to the number of users(regions/timestamps). 

I then return this time range, starting from am to pm

Note: 

1. I make an API request to google's calendar to get a list of holidays in other to confirm that supplied dates are not holidays in their regions.
2. I have included My google API key in the code (as requested), which I believe is bad practice as it should be an environmental variable instead.

please find the link to a postman collection for further tests and observations below  
https://www.getpostman.com/collections/90a364488804241cbe0a