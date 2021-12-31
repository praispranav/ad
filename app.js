var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var category = require('./routes/category')
var cors = require('cors')
var routes = require('./routes/index');
var users = require('./routes/users');
var admin = require('./routes/admin')
const order = require('./routes/order')

const mongoose = require('mongoose')

var app = express();

var url =
  "mongodb+srv://pranavkumarshop:pranavkumar@cluster0.rk2ol.mongodb.net/hris-service?retryWrites=true&w=majority";

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
const con = mongoose.connection
con.on('open', () => {
  console.log('Server COnnected')
})

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

var corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

// app.use(express.limit(1000000000000));
// app.use(express.limit('2mb'));

app.use(logger('dev'));
app.use(bodyParser.json({ limit: "5mb" }));
app.use(bodyParser.urlencoded({ limit: '5mb', extended: true }));
app.use(cookieParser());
// app.use(cors())
// app.options('*', cors(corsOptions));

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// let logginApi = []

// let demoLogger = (req, res, next) => {
//   if(req.url !== "/logger"){
//     logginApi.push({
//       req: {
//         url: req.url, method: req.method, query: req.query, params: req.params,
//         startTime: req._startTime,
//       }
//     })
//   }
//   console.log(res)
//   next();
// };

// app.get('/logger', (req, res, next)=>{
//   res.status(200).json(logginApi)
//   if(logginApi.length === 100) {
//     logginApi = []
//   }
//   next()
// })

// app.use(demoLogger);

app.use('/', routes);
app.use('/category', category);
app.use('/user', users);
app.use('/admin', admin);
app.use('/order', order)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
