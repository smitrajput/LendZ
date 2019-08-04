const express = require("express");
const app = express();
// this is used for dev logging in the terminal
const morgan = require("morgan");
// for parsing json data in the body. it parses the data and adds a body parameter in req object
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
// to use routes in different location
const kernelRoutes = require("./api/routes/kernel");
const positionRoutes = require("./api/routes/position");
const mongooseUrl = "mongodb://127.0.0.1:27017/loan";
// const mongooseUrl = "mongodb+srv://akash:" +
// process.env.ATLAS_PW +
// "@cluster0-eoubw.mongodb.net/test?retryWrites=true&w=majority";
// console.log(mongooseUrl);
mongoose.connect(mongooseUrl
  ,
  { useNewUrlParser: true }
);

// for logging
app.use(morgan("dev"));
// for body parsing
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// for resolving CORS error.
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");

  // here, if OPTIONS, we just need to send header. no need to pass it further to next
  // middlewares. that's why use return with res.json. although work without that as well.
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
    return res.status(200).json({});
  }
  // this next is used whenever u want to pass the req or the response to the next middleware.
  // not using next will block the request.
  next();
});

app.use("/kernel", kernelRoutes);
app.use("/position", positionRoutes);

// generate error if no urls are matched. pass it to next middleware with the error object.
app.use((req, res, next) => {
  const error = new Error("oops. not found.");
  error.status = 404;
  next(error);
});

// all the errors generated in the system are passed through this. This is for sending a
// nice looking json object back in case of error rather than an html page.
app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message
    }
  });
});

module.exports = app;
