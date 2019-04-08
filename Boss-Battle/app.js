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

/////////////////////////////////////
var canvas_width = 1300,
    canvas_height = 750;
var icon_width = 200,
    icon_height = 180,
    spacing = 65;
/////////////////////////////////////

/////////////////////////////////////
class Team {
  constructor(id) {
    this.id = id;
    this.health = icon_width;

    this.x_team_pos = 25;
    this.y_icon_pos = 25 + (icon_height*id) + (spacing*id);
    this.x_boss_pos = 1075;
  }
}
let teams = [];
teams.push(new Team(0));
teams.push(new Team(1));
teams.push(new Team(2));
/////////////////////////////////////

/////////////////////////////////////
class Bullet {
  constructor(team_id) {
    this.team_id = team_id;
    this.num = 0;
    this.x_pos = 230;
    this.y_pos = 100 + (250*this.team_id);
  }
}

let bullets = [];
/////////////////////////////////////

var io = require('socket.io')(serv,{});
io.sockets.on('connection', function(socket) {
	socket.id = Math.random();
	SOCKET_LIST[socket.id] = socket;

  socket.on('attack', function(pack) {
    for (let i = 0; i < teams.length; i++) {
      teams[i].health = pack.teams[i].health;
      teams[i].x_team_pos = pack.teams[i].x_team_pos;
      teams[i].y_icon_pos = pack.teams[i].y_icon_pos;
      teams[i].x_boss_pos = pack.teams[i].x_boss_pos;
    }

    bullets.push(new Bullet(pack.bullet_id));

    console.log('In server, bullets is ' + bullets.length);
  });

	socket.on('disconnect',function(){
		delete SOCKET_LIST[socket.id];
	});
});

/* Check for updates */
setInterval(function() {
  if (bullets.length > 0) {
    for (var i = 0; i < bullets.length; i++) {
      bullets[i].x_pos += 5;
    }
  }

	var pack = {
    teams: teams,
    bullets: bullets,
	};

	for(var i in SOCKET_LIST) {
		var socket = SOCKET_LIST[i];
		socket.emit('updates', pack);
	}
},1000/25);
