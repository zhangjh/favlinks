const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');

const routes = require('./routes/index');
const users = require('./routes/login');
const stat = require('./routes/stat');
const invest = require('./routes/invest');
const other = require('./routes/other');
const pinyin = require('./routes/pycode');

const mongoose = require("./lib/mongoose");
const compression = require('compression');

const app = express();
//开启gzip压缩
app.use(compression());

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
app.get('/export',routes.export(mongoose));
app.post('/login',users.login(mongoose));
app.post('/signup',users.signup(mongoose));
app.get('/logout',users.logout());
app.post('/forget',users.forget(mongoose));
app.get('/insertInfo',stat.insertInfo(mongoose));
app.get('/domdot',stat.domdot(mongoose));
app.get('/visit',stat.visit(mongoose));

// 第三方登录
app.get('/oauth/redirect',users.oauth(mongoose));
app.get('/oauth/wbRedirect',users.wbRedirect(mongoose));

// 指数定投工具
app.get('/trade',invest.trade());
app.get('/investStat',invest.stat(mongoose));
app.post('/investAdd',invest.add(mongoose));
app.get('/investSelect',invest.select(mongoose));
app.get('/investUpdate',invest.update(mongoose));
app.get('/getSumInfo',invest.getSumInfo(mongoose));
app.get('/getInput',invest.getInput(mongoose));

// 舔狗中介
app.get("/tiangou", other.getTiangou());
app.get("/getWuwuwu", other.getWuwuwu());

// pinyin
app.get("/py/generate", pinyin.generate(mongoose));
app.get("/py/select", pinyin.select(mongoose))

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers
app.use(function (err, req, res, next) {
  console.log(err);
  res.status(err.status || 500);
  res.render('error',{
    title: "favLinks--您的私人收藏夹 - 完全私人定制的网址收藏导航",
    type: "error"
  });
});

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
  console.log(err);
  res.status(err.status || 500);
  res.render('error_min', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
