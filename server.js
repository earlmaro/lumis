const express = require("express");
const cors = require("cors");
// const AppError = require('./utilis/appError')
const globalErrorHandler = require("./controllers/errorController");
const mongoose = require("mongoose");
var moment = require("moment");

// const backup = require("mongodb-backup");
process.on("unhandledRejection", (err) => {
  console.log(err);

  console.log(err.name, err.messages);
  console.log("UNHANDLED REJECTION! Shutting down...");
  // server.close(()=>{
  //      process.exit(1)
  // })
});
const path = require("path");

// console.log("jj");

require("dotenv").config();
const app = require("./app");
// app.use(express.static(path.join(__dirname, "client/build")));

const port = process.env.PORT || 5000;

const uri = process.env.ATLAS_URI;

mongoose.connect(uri, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
});
const connection = mongoose.connection;
connection.once("open", () => {
  console.log("mongo db connected");
});

const server = app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});

// app.use(globalErrorHandler)
