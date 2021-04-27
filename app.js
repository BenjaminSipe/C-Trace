var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");
const cors = require("cors");
var twilio = require("twilio");
var helmet = require("helmet");

var messagingRouter = require("./routes/messaging");
var authRouter = require("./routes/auth");
var caseRouter = require("./routes/case");
var contactRouter = require("./routes/contact");

var app = express();
// app.use(cors());
// view engine setup

// app.set("views", path.join(__dirname, "views"));
// app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/api/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use((req, res, next) => {
  if (
    req.method == "POST" &&
    (req.path === "/api/case" || req.path === "/api/contact")
  ) {
    console.log(
      "Authentication not required for " + req.path + " under " + req.method
    );
  } else {
    console.log("Authenticating");
  }
  next();
});

app.use("/api", [authRouter, caseRouter, contactRouter, messagingRouter]);

app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(404).json({
    message: err.message,
    error: err,
  });
});

app.use(helmet());

module.exports = app;
