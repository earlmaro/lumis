const express = require("express");
const cors = require("cors");
const AppError = require("./utilis/appError");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
var moment = require('moment'); 
const compression = require('compression')


const globalErrorHandler = require("./controllers/errorController");
var path = require("path");
global.appRoot = path.resolve(__dirname);

const app = express();
// set security http headers
app.use(helmet());

// limit  request from same api
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour!",
});
// app.use('/api',limiter)

app.use(cors());
// body parser, reading data from the body into req.body
app.use(express.json({ limit: "10kb" }));

//data sanitization again nosql query injection
app.use(mongoSanitize());
app.use(compression())
//data sanitization again XSS
app.use(xss());

//prevent params pollution
app.use(
  hpp({
    whitelist: [""],
  })
);

const userRouter = require("./routes/timezoneRouter");

app.use(express.static("public/img/users"));

app.use("/api/v1/images", express.static("public/img/users"));


app.use("/api/v1/user", userRouter);










app.use("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});



app.use(globalErrorHandler);

module.exports = app;
