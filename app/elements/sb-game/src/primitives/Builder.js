function Builder(manager, job, jobCondition, options) {
  'use strict';

  job = typeof job !== 'undefined' ? job : Builder.defaults.job;
  jobCondition = typeof jobCondition !== 'undefined' ? jobCondition : Builder.defaults.jobCondition;

  options = typeof options !== 'undefined' ? options : {};
  options.type = typeof options.type !== 'undefined' ? options.type : Builder.defaults.type;
  options.paddings = typeof options.paddings !== 'undefined' ? options.paddings : Builder.defaults.paddings;
  options.life = typeof options.life !== 'undefined' ? options.life : Builder.defaults.life(manager.tgtMatrix);
  options.width = typeof options.width !== 'undefined' ? options.width : Builder.defaults.width;
  options.dodgy = typeof options.dodgy !== 'undefined' ? options.dodgy : Builder.defaults.dodgy;
  options.chanceToTurn = typeof options.chanceToTurn !== 'undefined' ? options.chanceToTurn : Builder.defaults.chanceToTurn;
  options.chanceToSpawn = typeof options.chanceToSpawn !== 'undefined' ? options.chanceToSpawn : Builder.defaults.chanceToSpawn;
  
  this.manager = manager;
  this.id = manager.buildersCount;
  this.tgtMatrix = manager.tgtMatrix;
  this.alive = true;
  this.options = options;
  
  options.startingPos = typeof options.startingPos !== 'undefined' ? options.startingPos : Builder.defaults.startingPos(this);
  this.pos = options.startingPos;

  options.startingDir = typeof options.startingDir !== 'undefined' ? options.startingDir : Builder.defaults.startingDir(this);
  this.direction =  options.startingDir;

  this.primaryAxis = '';
  this.secondaryAxis = '';
  this.updateAxes();

  this.job = job;
  this.jobCondition = jobCondition;
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
    return Tool.randAttr(['up', 'right', 'down', 'left']);
  },
  life: function(tgtMatrix) {
    var boundaries = tgtMatrix.boundaries;
    var avrgDimension = (boundaries.x + boundaries.y) / 2;

    return Tool.randRange(avrgDimension * 0.2, avrgDimension * 0.4);
  },
  width: 1,
  dodgy: false,
  paddings: 1,
  chanceToTurn: 5,
  chanceToSpawn: 70,
};

Builder.prototype.updateAxes = function() {
  var pAxis = Tool.dirToAxis(this.direction);
  var sAxis = Tool.perpendicularAxis(pAxis);

  this.primaryAxis = pAxis;
  this.secondaryAxis = sAxis;
};

Builder.prototype.work = function() {
  if(this.checkPos()) {
    this.job(this);

    var builder = this;
    
    this.mayDo(this.options.chanceToSpawn, function() {
      builder.spawn();
    });

    this.moveOrTurn();

    this.age();
  } else {
    this.die();
  }
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
      this.tgtMatrix.contains(newPos) && 
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
  var validMove = this.validMove();
  var validDirections = this.validDirections();

  if(this.alive) {
    if(validMove !== false && validDirections !== false) {
      this.mayDo(this.options.chanceToTurn, function() {
        self.turn(validDirections);
      }, function() {
        self.move(validMove);
      });
    } else if(this.options.dodgy) {
      if(validMove !== false) {
        this.move(validMove);
      } else if(validDirections !== false) {
        this.turn(validDirections);
      } else {
        this.die();
      }
    } else if(validMove !== false) {
        this.move(validMove);
    } else {
      this.die();
    }
  }
};

Builder.prototype.move = function(validMove) {
  // console.log('moved');

  this.pos = validMove;
};

Builder.prototype.turn = function(validDirections) {
  // console.log('turned');

  var newDirection = Tool.randAttr(validDirections);
  this.direction = newDirection;
  this.updateAxes();

  this.pos = this.pos[newDirection]();
  this.job(this);
  this.pos = this.pos[newDirection]();
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
    // console.log('spawned');
  }
};

Builder.prototype.mayDo = function(chanceToDo, task, otherwise) {
  if(this.alive && Tool.randPercent() <= chanceToDo) {
    task();
  } else if(typeof otherwise === 'function') {
    otherwise();
  }
};

Builder.prototype.validMove = function(pos, direction) {
  pos = typeof pos !== 'undefined' ? pos : this.pos;
  direction = typeof direction !== 'undefined' ? direction : this.direction;
  var width = this.options.width;

  var distance = Math.ceil(width / 2);
  var newPos = pos[direction](distance);

  if(
    this.checkPos(newPos, direction)
  ) {
    return newPos;
  } else {
    return false;
  }
};

Builder.prototype.validDirections = function(pos) {
  pos = typeof pos !== 'undefined' ? pos : this.pos;

  var newPos = pos;
  var pos0 = newPos;
  var pDirections = this.possibleDirections(pos0, true);
  var direction;
  var vDirections = [];

  for(var pD in pDirections) {
    direction = pDirections[pD];

    if(
      this.validMove(pos0[direction](), direction) !== false &&
      this.validMove(pos0[direction](2), direction) !== false
    ) {
      vDirections.push(direction);
    }
  }

  if(vDirections.length > 0) {
    return vDirections;
  } else {
    return false;
  }
};

Builder.prototype.checkPos = function(pos, direction) {
  pos = typeof pos !== 'undefined' ? pos : this.pos;
  direction = typeof direction !== 'undefined' ? direction : this.direction;

  if(
    this.tgtMatrix.contains(pos, true) &&
    this.jobCondition(this, pos, direction)
  ) {
    return true;
  }

  return false;
};
