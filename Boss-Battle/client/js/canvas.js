var canvas = document.getElementById("ctx");
var ctx = canvas.getContext("2d");
ctx.font = '30px Arial';

var socket = io();

/* Variables */
var canvas_width = 1300;
var canvas_height = 750;
var icon_width = 200;
var icon_height = 180;
var spacing = 65;

var x_team_pos = 25;
var y_icon_pos = 25;
var x_boss_pos = 1075;

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

/* Team class */
class Team {
  constructor(id) {
    this.id = id; // id starts at 0
    this.total_health = 300;
    this.current_health = 300;

    this.image = new Image();
    this.image.src = team_img_paths[id];

    this.boss = new Image();
    this.boss.src = boss_img_paths[id];
  }

  drawImage() {
    ctx.drawImage(this.image,
                  0, 0, this.image.width, this.image.height,
                  x_team_pos, y_icon_pos + (icon_height*this.id) + (spacing*this.id), icon_width, icon_height);
  }

  drawBoss() {
    ctx.drawImage(this.boss,
                  0, 0, this.boss.width, this.boss.height,
                  x_boss_pos, y_icon_pos + (icon_height*this.id) + (spacing*this.id),
                  icon_width, icon_height);
    ctx.fillStyle = "red";
    ctx.fillRect(x_boss_pos, y_icon_pos + (icon_height*(this.id+1)) + (spacing*this.id) + 10, icon_width, 25);
  }

  attack() {

  }
}

/* Initialize the teams */
let teams = [];
for (let i = 0; i < 3; i++) {
  teams.push(new Team(i));
}

window.onload = function() {
  //draw_game_screen();

  for (let i = 0; i < 3; i++) {
    teams[i].drawImage();
    teams[i].drawBoss();
  }
};

socket.on('newPositions', function(data) {
  ctx.clearRect(0 + x_team_pos + icon_width, 0,
                canvas_width - ((icon_width+x_team_pos) * 2), canvas_height);
  for (var i = 0; i < data.bullet.length; i++) {
    if (data.bullet[i].x < canvas_width - icon_width - x_team_pos)
      ctx.fillRect(data.bullet[i].x-5, data.bullet[i].y-5, 10, 10);
  }
});
