var express = require('express'),
  http = require('http'),
  path = require('path'),
  partials = require('express-partials');

var app = express();

app.configure(function () {
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'hjs');

  app.use(express.favicon());
  app.use(express.bodyParser());
  app.use(express.cookieParser('your secret here'));
  app.use(express.session());
  app.use(partials());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

require('./router')(app);

http.createServer(app).listen(app.get('port'), function () {
  console.log("Express server listening on port " + app.get('port'));
});
