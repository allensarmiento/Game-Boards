var canvas = document.getElementById("ctx");
var ctx = canvas.getContext("2d");
ctx.font = '30px Arial';

var socket = io();

/////////////////////////////////////
/* Variables */
var canvas_width = 1300,
    canvas_height = 750;
var icon_width = 200,
    icon_height = 180,
    spacing = 65;

/* Images */
var team_1_img_path = '/client/images/clock.png';
var team_2_img_path = '/client/images/music-note.png';
var team_3_img_path = '/client/images/penguin.png';

var team_img_paths = [];
team_img_paths.push(team_1_img_path);
team_img_paths.push(team_2_img_path);
team_img_paths.push(team_3_img_path);

var team_1_boss_path = '/client/images/clock.png';
var team_2_boss_path = '/client/images/music-note.png';
var team_3_boss_path = '/client/images/penguin.png';

var boss_img_paths = [];
boss_img_paths.push(team_1_boss_path);
boss_img_paths.push(team_2_boss_path);
boss_img_paths.push(team_3_boss_path);
/////////////////////////////////////

/////////////////////////////////////
class Team {
  constructor(id) {
    this.id = id;
    this.health = icon_width;
    this.x_team_pos = 25;
    this.y_icon_pos = 25 + (icon_height*this.id) + (spacing*this.id);
    this.x_boss_pos = 1075;

    this.image = new Image();
    this.image.src = team_img_paths[this.id];

    this.boss = new Image();
    this.boss.src = boss_img_paths[this.id];
  }

  drawImage() {
    ctx.drawImage(this.image,
                  0, 0, this.image.width, this.image.height,
                  this.x_team_pos, this.y_icon_pos, icon_width, icon_height);
  }

  drawBoss() {
    ctx.drawImage(this.boss,
                  0, 0, this.boss.width, this.boss.height,
                  this.x_boss_pos, this.y_icon_pos,
                  icon_width, icon_height);
    ctx.strokeStyle = "black";
    ctx.strokeRect(this.x_boss_pos, this.y_icon_pos + icon_height + 10, icon_width, 25);
    ctx.fillStyle = "red";
    ctx.fillRect(this.x_boss_pos, this.y_icon_pos + icon_height + 10, this.health, 25);
  }
}

/* Initialize the teams */
let teams = [];
for (let i = 0; i < 3; i++) {
  teams.push(new Team(i));
}
/////////////////////////////////////

window.onload = function() {
  for (let i = 0; i < teams.length; i++) {
    teams[i].drawImage();
    teams[i].drawBoss();
  }
};

function redrawBoard() {
  ctx.clearRect(0, 0, canvas_width, canvas_height);
  for (let i = 0; i < teams.length; i++) {
    teams[i].drawImage();
    teams[i].drawBoss();
  }
}

function Attack(id) {
  //teams[id].health -= 5;
  let bullet_id = id;
  var pack = {
    teams: teams,
    bullet_id: bullet_id,
  };
  socket.emit('attack', pack);
}

function Reset() {
  socket.emit('reset', 'resetting board');
}

socket.on('updates', function(pack) {
  for (let i = 0; i < teams.length; i++) {
    teams[i].health = pack.teams[i].health;
    teams[i].x_team_pos = pack.teams[i].x_team_pos;
    teams[i].y_icon_pos = pack.teams[i].y_icon_pos;
    teams[i].x_boss_pos = pack.teams[i].x_boss_pos;
  }

  redrawBoard();

  for (let i = 0; i < pack.bullets.length; i++) {
    if (pack.bullets[i].x_pos < canvas_width - icon_width - 25) {
      ctx.fillStyle = "blue";
      ctx.fillRect(pack.bullets[i].x_pos-5, pack.bullets[i].y_pos-5, 10, 10);
    }
  }
});
