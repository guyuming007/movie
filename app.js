var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
const mongoose = require('mongoose');
const _ = require('underscore')

//var index = require('./routes/index');
//var users = require('./routes/users');
mongoose.connect('mongodb://localhost:27017/movie', {useMongoClient:true})
mongoose.Promise=global.Promise;

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// model
const movie = require('./model/movie')

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.png')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//app.use('/', index);
//app.use('/users', users);

// 首页
app.get('/', (req, res) => {
  movie.fetch((err, docArr) => {
    if(err){
      console.log(err);
      return
    }
    res.render('index', {'title':'电影', movies:docArr})
  })
})

// 电影详情页
app.get('/movie/:id', (req, res) => {
  let {id} = req.params;
  movie.findById(id, (err, docObj) => {
    if(err){console.log(err);return}
    res.render('./page/detail', {'title':'详情页', movie:docObj})
  })
})

// 录入页
app.get('/admin/movie/new', (erq, res) => {
  res.render('./page/admin', {'title':'录入页', movie: {
    movieName:null,
    doctor:null,
    language:null,
    country:null,
    summary:null,
    flash:null,
    poster:null,
    year:null
  }, 'active':'录入'})
})

// 修改页
app.get('/admin/update/:id', (req, res) => {
  let {id} = req.params;
  movie.findById(id, (err, docObj) => {
    if(err){console.log(err);return}
    res.render('./page/admin', {'title':'修改页', 'movie':docObj, 'active':'修改'})
  })
})

// 录入功能 or  修改功能
app.post('/admin/movie/new', (req, res) => {
  let {movieName, doctor, language, country, summary, flash, poster, year, id} = req.body;
  if(id != 'undefined' && id != '' && id != null) {
    // 修改
    movie.findById(id, (err, docObj) => {
      if(err){console.log(err);return}
      let _movie = _.extend(docObj, {movieName, doctor, language, country, summary, flash, poster, year, _id:id})
      _movie.save((err, doc) => {
        if(err){console.log(err);return}
        res.redirect('/movie/'+doc._id)
      })
    })
  }else {
    // 录入
    let _movie = new movie({movieName, doctor, language, country, summary, flash, poster, year})
    _movie.save((err, doc) => {
      if(err){console.log(err);return}
      res.redirect('/movie/'+doc._id)
    })
  }
  console.log(id);

})

// 列表页
app.get('/admin/movie/list', (req, res) => {
  movie.fetch((err, docArr) => {
    if(err){console.log(err);return}
    res.render('./page/list', {'movies':docArr})
  })
})

// 删除功能
app.delete('/admin/movie/list', (req, res) => {
  let {id} = req.query;
  movie.remove({_id:id}, (err, r) => {
    if(err) {
      console.log(err);
      res.json(-1)
      return
    }
    res.json(1)
  })
})

// 发表评论功能   or   回复功能

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
