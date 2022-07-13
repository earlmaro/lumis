const AppError = require("../utilis/appError");

const handleValidation = (err) => {
  const  errors = Object.values(err.errors).map(el.message)
  const message = `Invalid : input data. ${errors.join('.')}`;
  return new AppError(message, 400);
};
const handleErrorDB = () => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};
const handleJWTerror = () =>
  new AppError("Invalid token, please log in again", 401);
const handleTokenExpirederror = (res) => 
  new AppError("Your token has expired, please log in again", 401,res);

const handleDuplicateFieldsDB = (err) => {
  const value = err.keyValue.type;
  // const value = err.message.match(/(["'])(\\?.)*?\1/)[0]
  const message = `Duplicate field value: /${value}/ Please use another value!`;
  return new AppError(message, 400);
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {

  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.error("ERROR", err);
    res.status(500).json({
      status: "error",
      message: "oops! something went very wrong!",
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  }

  if (process.env.NODE_ENV === "production") {
    let error = { ...err };

    if (error.name === "CastError") {
      handleErrorDB(error);
    }
    if (error.code === 11000) {
      handleDuplicateFieldsDB(error);
    }
    if (error.name === "ValidationError") {
      handleValidation(error);
    }
    if (error.name === "JsonWebTokenError") {
      handleJWTerror();
    }
    if (error.name === "TokenExpiredError") {
      handleTokenExpirederror(error,res);
    }
    sendErrorProd(error, res);
  }


};
