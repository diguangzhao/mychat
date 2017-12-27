var app = require('express')();
var fs = require('fs')

var http = require('http').Server(app);
// var https = require('https').Server({
//      key: fs.readFileSync('/home/ubuntu/nodepro/server.key'),
//      cert: fs.readFileSync('/home/ubuntu/nodepro/server.crt')
// },app);

var redis = require('redis')
  ,REDIS_DNS = '172.17.42.1'
  ,REDIS_PORT = '6379'
  ,REDIS_OPT = {}
  ,client = redis.createClient(REDIS_PORT, REDIS_DNS, REDIS_OPT);

client.on('ready', function(res){
  console.log('redis ready')
})

var io = require('socket.io')(http);
var querystring = require('querystring')

const log = function (msg) {
	console.log(msg)
}

var __public = __dirname + '/public'
var __bower = __dirname + '/bower_components'

app.get('/', function(req, res){
	res.sendFile(__public + '/index.html');
});
app.get('/video*', function(req, res){
	res.sendFile(__public + '/video.html');
});
app.get('/c*', function(req, res){
  res.sendFile(__public + '/client.html');
});

app.get('/__bower/*', function(req, res){
	var staticPath = req.originalUrl.substr(8);
	res.sendFile(__bower + staticPath);
});

app.get('/__public/*', function(req, res){
	var staticPath = req.originalUrl.substr(9);
	res.sendFile(__public + staticPath);
});

io.on('connection', function (socket) {
    socket.on('user init', function(data){

      //从redis获取已有用户集合
      client.smembers('users', function(err, users){
          io.emit('user init',users)
      })


    })
  	
  	socket.on('new user', function (data) {
  		socket.username = data.username

      client.sismember('users', socket.username, function(err, res){
        if (res) {
          io.emit('has user', data)
        } else {
          client.sadd('users', socket.username, function(err, res){
            if (res) {
              io.emit('add user', data);
            }
          })

        }
        
      })
  	});

  	socket.on('send message', function (data) {
  		log(data);
    	io.emit('new message', data);
  	});
  	socket.on('disconnect', function (data) {
  		client.srem('users', socket.username, function(err, res){
        console.log(err)
      })
    	io.emit('user left', data);
  	});
});

//指定port
var PORT = process.env.PORT || 3000
var SSLPORT = process.env.SSLPORT || 3001

http.listen(PORT, function(){
	console.log('listening on *:' + PORT);
});
// https.listen(SSLPORT, function(){
// 	console.log('listening on *:' + SSLPORT);
// });