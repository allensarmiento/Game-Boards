var express = require('express');
var app = express();
var serv = require('http').Server(app);

app.get('/',function(req, res) {
	res.sendFile(__dirname + '/client/index.html');
});
app.use('/client',express.static(__dirname + '/client'));

serv.listen(2000);
console.log("Server started.");

var SOCKET_LIST = {};

var bullet_x_pos = 230;
var bullet_y_team_1 = 100;
var bullet_y_team_2 = 350;
var bullet_y_team_3 = 600;

var Entity = function() {
  var self = {
    x: 230, y: 100,
    speedX: 10,
    id: "",
  };
  self.update = function() {
    self.updatePosition();
  };
  self.updatePosition = function() {
    self.x += self.speedX;
  };

  return self;
};

var Bullet = function(y) {
  var self = Entity();
  self.id = Math.random();
  self.y = y;

  self.timer = 0;
  self.toRemove = false;

  var super_update = self.update;
  self.update = function() {
    if (self.timer++ > 100) {
      self.toRemove = true;
    }
    super_update();
  };
  Bullet.list[self.id] = self;

  return self;
};
Bullet.list = {};

var Team = function() {
  Bullet.list = {};
};

Bullet.update = function() {
  if(Math.random() < 0.1){
		//Bullet(Math.random()*360);
    Bullet(bullet_y_team_1);
    Bullet(bullet_y_team_2);
    Bullet(bullet_y_team_3);
	}

  var pack = [];

  for (var i in Bullet.list) {
    var bullet = Bullet.list[i];
    bullet.update();
    pack.push({
      x: bullet.x,
      y: bullet.y,
    });
  }

  return pack;
};

var io = require('socket.io')(serv,{});
io.sockets.on('connection', function(socket){
	socket.id = Math.random();
	SOCKET_LIST[socket.id] = socket;

	socket.on('disconnect',function(){
		delete SOCKET_LIST[socket.id];
	});
});

setInterval(function(){
	var pack = {
    bullet: Bullet.update(),
	};

	for(var i in SOCKET_LIST){
		var socket = SOCKET_LIST[i];
		socket.emit('newPositions',pack);
	}
},1000/25);
