var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var slowDown = require('express-slow-down');

var indexRouter = require('./routes/index.js');
var usersRouter = require('./routes/users.js');
var devicesRouter = require('./routes/devices.js');
var locationsRouter = require('./routes/locations.js');
var notificationsRouter = require('./routes/notifications.js');

var cors = require('cors');
var app = express();
var db = require('./config/database.js')
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

const speedLimiter = slowDown({
  windowMs: 60 * 1000,
  delayAfter: 10,
  delayMs: () => 500, // Fixed 500ms delay after threshold is reached
  maxDelayMs: 32000,
});

app.use(speedLimiter); // Apply the speed limiter globally

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/devices', devicesRouter);
app.use('/locations', locationsRouter);
app.use('/notifications', notificationsRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500).json({
    message: err.message,
    error: req.app.get('env') === 'development' ? err : {}
  });
});

module.exports = app;
