function Builder(manager, type, job, pos, options) {
  'use strict';

  pos = typeof pos !== 'undefined' ? pos : Builder.defaults.pos(manager.tgtMatrix);
  options = typeof options !== 'undefined' ? options : {};
  options.life = typeof options.life !== 'undefined' ? options.life : Builder.defaults.life(manager.tgtMatrix);
  options.steps = typeof options.steps !== 'undefined' ? options.steps : Builder.defaults.steps;
  options.width = typeof options.width !== 'undefined' ? options.width : Builder.defaults.width;
  options.paddings = typeof options.paddings !== 'undefined' ? options.paddings : Builder.defaults.paddings;
  options.chanceToTurn = typeof options.chanceToTurn !== 'undefined' ? options.chanceToTurn : Builder.defaults.chanceToTurn;
  options.chanceToSpawn = typeof options.chanceToSpawn !== 'undefined' ? options.chanceToSpawn : Builder.defaults.chanceToSpawn;
  options.jobCondition = typeof options.jobCondition !== 'undefined' ? options.jobCondition : Builder.defaults.jobCondition();
  
  this.manager = manager;
  this.tgtMatrix = manager.tgtMatrix;
  this.type = type;
  this.job = job;
  this.pos = pos;

  this.life = options.life;
  this.steps = options.steps;
  this.width = options.width;
  this.paddings = options.paddings;
  this.jobCondition = options.jobCondition;
  this.chanceToTurn = options.chanceToTurn;
  this.chanceToSpawn = options.chanceToSpawn;
  this.jobCondition = options.jobCondition;
  
  this.maxChildren = Builder.defaults.maxChildren;
  this.direction = Builder.defaults.direction(this);
  this.alive = true;
}

Builder.defaults = {
  pos: function(tgtMatrix) {
    return tgtMatrix.randPos([this.paddings, tgtMatrix.boundaries.x - this.paddings - 1], [this.paddings, tgtMatrix.boundaries.y - this.paddings - 1], [0, 0]);
  },
  direction: function(builder) {
    return Tool.randAttr(builder.possibleDirections());
  },
  life: function(tgtMatrix) {
    var boundaries = tgtMatrix.boundaries;
    var avrgDimension = (boundaries.x + boundaries.y) / 2;

    return Tool.randRange(avrgDimension / 2, avrgDimension);
  },
  steps: 1,
  maxChildren: 2,
  width: 1,
  paddings: 0,
  chanceToTurn: 3,
  chanceToSpawn: 3,
  jobCondition: function() { return true; }
};

Builder.prototype.work = function() {
  this.moveOrTurn();

  var builder = this;
  this.mayDo(this.chanceToSpawn, function() {
    builder.spawn();
  });

  this.age();
};

Builder.prototype.age = function() {
  if(this.alive) {
    this.life--;

    if(this.life <= 0) {
      // console.log('died of old age');
      this.die();
    }
  }
};

Builder.prototype.die = function() {
  this.alive = false;
};

Builder.prototype.possibleDirections = function(pos, excludeCurrentAndReverse) {
  pos = typeof pos !== 'undefined' ? pos : this.pos;
  excludeCurrentAndReverse = typeof excludeCurrentAndReverse !== 'undefined' ? excludeCurrentAndReverse : false;

  var directions = ['up', 'right', 'down', 'left'];
  var direction;
  var pDirections = [];
  var newPos;
  var neighbors;

  for(var d in directions) {
    direction = directions[d];
    newPos = pos[direction]();

    if(this.checkPos(newPos) && (!excludeCurrentAndReverse || (excludeCurrentAndReverse && direction !== this.reverseDirection() && direction !== this.direction))) {
      pDirections.push(direction);
    }
  } 

  return pDirections;
};

Builder.prototype.moveOrTurn = function() {
  var self = this;
  var validMove = this.checkMove();
  var validTurn = this.checkTurn();

  var move = function(builder, validMove) {
    for(var m in validMove) {
      builder.pos = validMove[m];
      builder.job(builder);
    }
  };

  var turn = function(builder, validTurn) {
    builder.direction = validTurn.direction;

    for(var t in validTurn.path) {
      builder.pos = validTurn.path[t];
      builder.job(builder);
    }
  };

  if(this.alive) {
    if(validMove !== false && validTurn !== false) {
      this.mayDo(this.chanceToTurn, function() {
        turn(self, validTurn);
      }, function() {
        move(self, validMove);
      });
    } else if(validMove !== false) {
      move(self, validMove);
    } else if(validTurn !== false) {
      turn(self, validTurn);
    } else {
      this.die();
    }
  }
};

Builder.prototype.reverseDirection = function() {
  switch(this.direction) {
    case 'up':
      return 'down';
    case 'right':
      return 'left';
    case 'down':
      return 'up';
    case 'left':
      return 'right';
  }
};

Builder.prototype.spawn = function(type, pos, options) {
  type = typeof type !== 'undefined' ? type : this.type;
  pos = typeof pos !== 'undefined' ? pos : this.pos;

  if(this.alive && this.maxChildren > 0) {
    this.manager.addBuilder(type, pos, options);
    this.maxChildren--;
    console.log('spawned');
  }
};

Builder.prototype.mayDo = function(chanceToDo, task, otherwise) {
  if(this.alive && Tool.randPercent() <= chanceToDo) {
    task();
  } else if(typeof otherwise === 'function') {
    otherwise();
  }
};

Builder.prototype.checkPos = function(pos) {
  pos = typeof pos !== 'undefined' ? pos : this.pos;

  if(this.tgtMatrix.contains(pos, true)) {
    var neighbors = pos.neighbors(this.paddings);

    for(var n in neighbors) {
      if(!this.tgtMatrix.contains(neighbors[n])) {
        return false;
      }
    }
  } else {
    return false;
  }

  return true;
};

Builder.prototype.checkMove = function(pos, direction, steps) {
  pos = typeof pos !== 'undefined' ? pos : this.pos;
  direction = typeof direction !== 'undefined' ? direction : this.direction;
  steps = typeof steps !== 'undefined' ? steps: this.steps;

  var _pos = pos;
  var _direction = direction;
  var _steps = steps;
  var path = [_pos];

  for(_steps; _steps > 0; _steps--) {
    _pos = _pos[_direction]();

    if(this.checkPos(_pos)) {
        path.push(_pos);
    } else {
      return false;
    }
  }

  return path;
};

Builder.prototype.checkTurn = function(pos) {
  pos = typeof pos !== 'undefined' ? pos : this.pos;

  var _pos = pos;
  var pos0 = _pos;
  var pDirections = this.possibleDirections(_pos, true);
  var direction;
  var pathes = [];
  var path;

  for(var pD in pDirections) {
    _pos = pos0;
    direction = pDirections[pD];

    path = this.checkMove(_pos, direction, this.width + this.paddings);

    if(path !== false) {
      pathes.push({direction: direction, path: path});
    }
  }

  if(pathes.length > 0) {
    return Tool.randAttr(pathes);
  } else {
    return false;
  }
};
