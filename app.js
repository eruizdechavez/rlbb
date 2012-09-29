var express = require('express'),
  http = require('http'),
  path = require('path'),
  api = require('./controllers/api_controller');

var app = express();

app.configure(function () {
  app.set('port', process.env.PORT || 3000);
  app.use(express.favicon());
  app.use(express.bodyParser());
  app.use(api.request);
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

require('./router')(app);

http.createServer(app).listen(app.get('port'), function () {
  console.log("Express server listening on port " + app.get('port'));
});
