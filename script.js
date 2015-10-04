
window.onload = function () {
  var board = new Board();
  var agent = new Agent();
  board.clear();
  board.draw(agent);
  var learner = colorLearner();
  agent.addLearner('color', learner, learner.stateUpdate);
  learner = positionLearner();
  agent.addLearner('position', learner, learner.stateUpdate);
  learner = dimensionLearner();
  agent.addLearner('dimension', learner, learner.stateUpdate);
  setInterval(function(){
    agent.updateState('color');
    agent.updateState('position');
    agent.updateState('dimension');
    board.clear();
    board.draw(agent);
  }, 500);
};

function colorLearner(){
  var learner = new QLearner();
  learner.add('blue', 'green', 1);
  learner.add('green', 'red', 1);
  learner.add('red', 'yellow', 1);
  learner.add('yellow', 'black', 1);
  learner.add('black', 'blue', 1);
  var updater = function (state) {
    this.color.fillStyle = state;
    if (state == 'black') {
      this.color.strokeStyle = 'red';
    } else {
      this.color.strokeStyle = 'black';
    }
  };
  learner.stateUpdate = updater;
  learner.learn(1000);
  learner.setState('black');
  return learner;
}

function positionLearner(){
  var learner = new QLearner();
  learner.add('3,3', '4,4', 1);
  learner.add('4,4', '5,5', 1);
  learner.add('5,5', '4,5', 1);
  learner.add('4,5', '3,5', 1);
  learner.add('3,5', '3,4', 1);
  learner.add('3,4', '3,3', 1);
  var updater = function (state) {
    this.position.x = Number(state.split(',')[0]);
    this.position.y = Number(state.split(',')[1]);
  };
  learner.stateUpdate = updater;
  learner.learn(1000);
  learner.setState('black');
  return learner;
}

function dimensionLearner(){
  var learner = new QLearner();
  learner.add('30,3', '30,8', 1);
  learner.add('30,8', '40,1', 1);
  learner.add('40,1', '30,3', 1);
  var updater = function (state) {
    this.dimension.radius = Number(state.split(',')[0]);
    this.dimension.lineWidth = Number(state.split(',')[1]);
  };
  learner.stateUpdate = updater;
  learner.learn(1000);
  learner.setState('black');
  return learner;
}


function Agent() {
  this.learner = {};
  this.stateUpdate = {};
  this.setPosition(5, 5);
  this.setDimension(20, 4);
  this.setColor('red', 'black');
}

Agent.prototype.addLearner = function (name, learner, stateUpdate) {
  this.learner[name] = learner;
  this.stateUpdate[name] = stateUpdate;
};

Agent.prototype.getLearner = function (name) {
  return this.learner[name];
};

Agent.prototype.updateState = function (name) {
  this.learner[name].step();
  var state = this.learner[name].getState();
  this.stateUpdate[name].call(this, state);
};

Agent.prototype.setPosition = function (x, y) {
  this.position = {x: x, y: y};
};

Agent.prototype.setColor = function (fillStyle, strokeStyle) {
  this.color = {fillStyle: fillStyle, strokeStyle: strokeStyle};
};

Agent.prototype.setDimension = function (radius, lineWidth) {
  this.dimension = {radius: radius, lineWidth: lineWidth};
};

function Board() {
  this.canvasId = "canvas";
  this.canvasWidth = 300;
  this.canvasHeight = 300;
  this.width = 10; //cells
  this.height = 10; //cells
  this.init();
}

Board.prototype.init = function () {
  var canvas = document.getElementById(this.canvasId);
  this.canvasContext = canvas.getContext('2d');
};


Board.prototype.clear = function () {
  var context = this.canvasContext;
  context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
};

Board.prototype.draw = function (agent) {

  var dx = this.canvasWidth / this.width;
  var dy = this.canvasHeight / this.height;
  var radius = agent.dimension.radius;
  var pi2 = Math.PI * 2;
  var context = this.canvasContext;
  var column = agent.position.x;
  var line = agent.position.y;

  context.beginPath();
  context.arc(dx * (column + 0.5), dy * (line + 0.5), radius, 0, pi2, false);
  context.fillStyle = agent.color.fillStyle;
  context.fill();
  context.lineWidth = agent.dimension.lineWidth;
  context.strokeStyle = agent.color.strokeStyle;
  context.stroke();

};





