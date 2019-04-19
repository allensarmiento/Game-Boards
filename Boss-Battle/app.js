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
    this.health = icon_width + 100; // Max health: 300

    this.x_team_pos = 25;
    this.y_icon_pos = 25 + (icon_height*this.id) + (spacing*this.id);
    this.x_boss_pos = 1075;
  }

  reset() {
    this.health = icon_width + 100;

    this.x_team_pos = 25;
    this.y_icon_pos = 25 + (icon_height*this.id) + (spacing*this.id);
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

function adjustBulletPosition(team_bullets) {
  let team_1_bullet = 230,
      team_2_bullet = 230,
      team_3_bullet = 230;

  for (var i in team_bullets) {
    switch(bullets[i].team_id) {
      case 0:
        bullets[i].x_pos = team_1_bullet;
        team_1_bullet -= 15;
        break;
      case 1:
        bullets[i].x_pos = team_2_bullet;
        team_2_bullet -= 15;
        break;
      case 2:
        bullets[i].x_pos = team_3_bullet;
        team_3_bullet -= 15;
        break;
    }
  }

  return team_bullets;
}
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
    bullets = adjustBulletPosition(bullets);

    console.log('In server, bullets is ' + bullets.length);
  });

  socket.on('reset', function(msg) {
    console.log(msg);
    for (let i = 0; i < teams.length; i++) {
      teams[i].reset();
    }
  });

	socket.on('disconnect',function(){
		delete SOCKET_LIST[socket.id];
	});
});

/* Check for updates */
setInterval(function() {
  if (bullets.length > 0) {
    for (var i in bullets) {
      if (bullets[i].x_pos < canvas_width - icon_width) {
        bullets[i].x_pos += 25;
      } else {
        if (teams[bullets[i].team_id].health > 0)
          teams[bullets[i].team_id].health--;
        bullets.splice(i, 1);
        console.log('bullets: ' + bullets.length);
      }
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
