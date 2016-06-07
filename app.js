var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

var routes = require('./routes/index');
var users = require('./routes/login');
var stat = require('./routes/stat');

var mongoose = require("./lib/mongoose");

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public/img', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: "weird sheep",
  resave: false,
  saveUninitialized: true,
  cookie: {user:"default",maxAge: 14*24*60*60*1000}
}));

app.get('/', routes.index(mongoose));
app.get('/add',routes.add(mongoose));
app.get('/remove',routes.remove(mongoose));
app.get('/update',routes.update(mongoose));
app.get('/select',routes.select(mongoose));
app.get('/copy',routes.copy(mongoose));
app.post('/login',users.login(mongoose));
app.post('/signup',users.signup(mongoose));
app.get('/logout',users.logout());
app.post('/forget',users.forget(mongoose));
app.get('/insertInfo',stat.insertInfo(mongoose));


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error_min', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error_min', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
