function Builder(manager, job, jobCondition, options) {
  'use strict';

  job = typeof job !== 'undefined' ? job : Builder.defaults.job;
  jobCondition = typeof jobCondition !== 'undefined' ? jobCondition : Builder.defaults.jobCondition;

  options = typeof options !== 'undefined' ? options : {};
  options.type = typeof options.type !== 'undefined' ? options.type : Builder.defaults.type;
  options.paddings = typeof options.paddings !== 'undefined' ? options.paddings : Builder.defaults.paddings;
  options.life = typeof options.life !== 'undefined' ? options.life : Builder.defaults.life(manager.tgtMatrix);
  options.speed = typeof options.speed !== 'undefined' ? options.speed : Builder.defaults.speed;
  options.width = typeof options.width !== 'undefined' ? options.width : Builder.defaults.width;
  options.dodgy = typeof options.dodgy !== 'undefined' ? options.dodgy : Builder.defaults.dodgy;
  options.chanceToTurn = typeof options.chanceToTurn !== 'undefined' ? options.chanceToTurn : Builder.defaults.chanceToTurn;
  options.chanceToSpawn = typeof options.chanceToSpawn !== 'undefined' ? options.chanceToSpawn : Builder.defaults.chanceToSpawn;
  
  this.manager = manager;
  this.id = manager.buildersCount;
  this.tgtMatrix = manager.tgtMatrix;
  this.job = job;
  this.jobCondition = jobCondition;
  this.alive = true;
  this.options = options;
  
  options.startingPos = typeof options.startingPos !== 'undefined' ? options.startingPos : Builder.defaults.startingPos(this);
  this.pos = options.startingPos;

  options.startingDir = typeof options.startingDir !== 'undefined' ? options.startingDir : Builder.defaults.startingDir(this);
  this.direction =  options.startingDir;

  this.primaryAxis = '';
  this.secondaryAxis = '';
  this.setAxis();
}

Builder.defaults = {
  type: 'builder',
  job: function(builder) { console.log(builder.pos); },
  jobCondition: function() { return true; },
  startingPos: function(builder) {
    var tgtMatrix = builder.tgtMatrix;
    var paddings = builder.options.paddings;

    return tgtMatrix.randPos([paddings, tgtMatrix.boundaries.x - paddings - 1], [paddings, tgtMatrix.boundaries.y - paddings - 1], [0, 0]);
  },
  startingDir: function(builder) {
    return Tool.randAttr(builder.possibleDirections());
  },
  life: function(tgtMatrix) {
    var boundaries = tgtMatrix.boundaries;
    var avrgDimension = (boundaries.x + boundaries.y) / 2;

    return Tool.randRange(avrgDimension * 0.2, avrgDimension * 0.4);
  },
  speed: 2,
  width: 1,
  dodgy: false,
  paddings: 1,
  chanceToTurn: 5,
  chanceToSpawn: 70,
};

Builder.prototype.setAxis = function() {
  var primaryAxis;
  var secondaryAxis;

  if(this.direction === 'up' || this.direction === 'down') {
    primaryAxis = 'y';
    secondaryAxis = 'x';
  } else {
    primaryAxis = 'x';
    secondaryAxis = 'y';
  }

  this.primaryAxis = primaryAxis;
  this.secondaryAxis = secondaryAxis;
};

Builder.prototype.work = function() {
  this.moveOrTurn();
  
  if(this.possibleDirections(this.pos, true).length > 0) {
    var builder = this;
    this.mayDo(this.options.chanceToSpawn, function() {
      builder.spawn();
    });
  }

  this.age();
};

Builder.prototype.age = function() {
  if(this.alive) {
    this.options.life--;

    if(this.options.life <= 0) {
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

    if(
      this.checkPos(newPos) && 
      (!excludeCurrentAndReverse ||
        (excludeCurrentAndReverse && 
          direction !== this.reverseDirection() && 
          direction !== this.direction)
        )
    ) {
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
    builder.setAxis();

    for(var t in validTurn.path) {
      builder.pos = validTurn.path[t];
      builder.job(builder);
    }
  };

  if(this.alive) {
    if(validMove !== false && validTurn !== false) {
      this.mayDo(this.options.chanceToTurn, function() {
        turn(self, validTurn);
      }, function() {
        move(self, validMove);
      });
    } else if(this.options.dodgy) {
      if(validMove !== false) {
        move(self, validMove);
      } else if(validTurn !== false) {
        turn(self, validTurn);
      } else {
        this.die();
      }
    } else {
      this.die();
    }
  }
};

Builder.prototype.reverseDirection = function(direction) {
  direction = typeof direction !== 'undefined' ? direction : this.direction;

  switch(direction) {
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

Builder.prototype.spawn = function(type, options) {
  type = typeof type !== 'undefined' ? type : this.type;
  options.startingPos = typeof options.startingPos !== 'undefined' ? options.startingPos : this.pos;

  if(this.alive) {
    this.manager.addBuilder(type, options);
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

Builder.prototype.checkMove = function(pos, direction, speed) {
  pos = typeof pos !== 'undefined' ? pos : this.pos;
  direction = typeof direction !== 'undefined' ? direction : this.direction;
  speed = typeof speed !== 'undefined' ? speed: this.options.speed;

  var _pos = pos;
  var _direction = direction;
  var _speed = speed;
  var path = [_pos];

  for(_speed; _speed > 0; _speed--) {
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

    path = this.checkMove(_pos, direction, this.options.width + this.options.paddings);

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

Builder.prototype.checkPos = function(pos) {
  pos = typeof pos !== 'undefined' ? pos : this.pos;

  if(
    this.tgtMatrix.contains(pos, true)
  ) {
    if(this.jobCondition(this, pos)) {
      var neighbors = pos.neighbors(this.options.paddings);

      for(var n in neighbors) {
        if(
          this.tgtMatrix.contains(neighbors[n]) &&
          this.jobCondition(this, neighbors[n])
        ) {
          return true;
        }
      }
    }
  }

  return false;
};
