function Tool() {
  'use strict';
}

Tool.clone = function(object) {
  var clone = {};

  for(var o in object) {
    clone[o] = object[o];
  }

  return clone;
};

Tool.randRange = function(min, max) {
  return Math.round(Math.random() * (max - min) + min);
};

Tool.randPercent= function() {
  return Tool.randRange(1, 100);
};

Tool.oneIn = function(universe) {
  return Tool.randRange(1, universe) === universe;
};

Tool.randAttr = function(object, filter) {
  var obj = Tool.clone(object);

  var attrs = [];

  if(typeof filter === 'object') {
    for(var f in filter) {
      if(obj.hasOwnProperty(filter[f])) {
        attrs.push(filter[f]);
      } else {
        console.log(filter[f] + ' is not present in ' + obj);
      }
    }
  } else {
    for(var a in obj) {
      attrs.push(a);
    }
  }

  var attr = attrs[Tool.randRange(0, attrs.length - 1)];

  return object[attr];
};

Tool.randDirection = function() {
  return Tool.randAttr(['up', 'right', 'down', 'left']); 
};

Tool.logCoord = function(x, y, z) {
  console.log(x + ' ' + y  + ' ' + z);
};

Tool.getRule = function(codici, ruleSet, rule) {
  var ruleString = ruleSet.split('.');
  var realRuleSet = codici;

  for(var rs in ruleString) {
    realRuleSet = realRuleSet[ruleString[rs]];
  }

  if(!realRuleSet.hasOwnProperty(rule)) {
    console.error('no valid ' + realRuleSet + ' declared');
    return false;
  } else {
    return realRuleSet[rule];
  }
};

Tool.randRule = function(codici, ruleSet, filter) {
  var ruleString = ruleSet.split('.');
  var realRuleSet = Tool.clone(codici);

  for(var rs = 0; rs < ruleString.length; rs++) {
    realRuleSet = realRuleSet[ruleString[rs]];
  }

  var rule = Tool.randAttr(realRuleSet, filter);
  
  return rule;
};

function Tiles(which) {
  'use strict';

  var tiles = {
    floor: String.fromCharCode(65)
  };
  if(!tiles.hasOwnProperty(which)) {
    console.error('No valid tile');

    return false;
  } else {
    return tiles[which];
  }
}

function Point(x, y, z) {
  'use strict';
  
  x = typeof x !== 'undefined' ? x : 0;
  y = typeof y !== 'undefined' ? y : 0;
  z = typeof z !== 'undefined' ? z : 0;

  this.x = x;
  this.y = y;
  this.z = z;
}

Point.prototype.distanceTo = function(point) {
  return Math.sqrt(Math.pow(Math.abs(point.x - this.x), 2) + Math.pow(Math.abs(point.y - this.y), 2) + Math.pow(Math.abs(point.z - this.z), 2));
};

Point.prototype.subtract = function(point) {
  return new Point(
    this.x - point.x,
    this.y - point.y,
    this.z - point.z
  );
};

Point.prototype.sum = function(point) {
  return new Point(
    this.x + point.x,
    this.y + point.y,
    this.z + point.z
  );
};

Point.prototype.toTopLeft = function(matrix) {
  var center = matrix.center;

  return new Point(
    this.x - center.x,
    this.y - center.y,
    this.z - center.z
  );
};

Point.prototype.toCenter = function(matrix) {
  var center = matrix.center;
  return this.sum(center);
};

Point.prototype.toGrid = function() {
  return new Point(
    Math.round(this.x),
    Math.round(this.y),
    Math.round(this.z)
  );
};

Point.prototype.flatten = function() {
  return new Point(
    this.x,
    this.y,
    0
  );
};

Point.prototype.up = function() {
  return new Point(this.x, this.y - 1, this.z);
};

Point.prototype.right = function() {
  return new Point(this.x + 1, this.y, this.z);
};

Point.prototype.down = function() {
  return new Point(this.x, this.y + 1, this.z);
};

Point.prototype.left = function() {
  return new Point(this.x - 1, this.y, this.z);
};

Point.prototype.neighbors = function(radius, flat) {
  flat = typeof flat !== 'undefined' ? flat : true;

  var neighbors = [];
  
  for(var _x = this.x - radius; _x <= this.x + radius; _x++) {
      for(var _y = this.y - radius; _y <= this.y + radius; _y++) {
        if(flat === false) {
          for(var _z = this.z - radius; _z <= this.y + radius; _z++) {
            if(this.x !== _x || this.y !== _y || this.z !== _z) {
              neighbors.push(new Point(_x, _y, _z));
            }
          }
        } else {
          if(this.x !== _x || this.y !== _y) {
            neighbors.push(new Point(_x, _y, this.z));
          }
        }
      }
    }

  return neighbors;
};

Point.prototype.randRelativePoint = function(xRange, yRange, zRange) {
  xRange = typeof xRange !== 'undefined' ? xRange : [0, 10];
  yRange = typeof yRange !== 'undefined' ? yRange : [0, 10];
  zRange = typeof zRange !== 'undefined' ? zRange : [0, 10];

  return new Point(
    this.x + Tool.randRange(xRange[0], xRange[1]),
    this.y + Tool.randRange(yRange[0], yRange[1]),
    this.z + Tool.randRange(zRange[0], zRange[1])
  );
};

Point.prototype.randRadialPoint = function(minRadius, maxRadius, flat) {
  flat = typeof flat !== 'undefined' ? flat : true;

  var radius = Tool.randRange(minRadius, maxRadius);
  var angle = Tool.randRange(0, 359) * Math.PI / 180;

  var zShift;
  
  if(flat === true) {
    zShift = 0;
  } else {
    zShift = Tool.randRange(-radius, radius);
  }

  return new Point(
    this.x + Math.cos(angle) * radius,
    this.y + Math.sin(angle) * radius,
    this.z + zShift
  );
};

function Boundaries(x, y, z) {
  'use strict';
  
  x = typeof x !== 'undefined' ? x : 1;
  y = typeof y !== 'undefined' ? y : 1;
  z = typeof z !== 'undefined' ? z : 1;

  this.x = x;
  this.y = y;
  this.z = z;
}

Boundaries.prototype.update = function(x, y, z) {
  x = typeof x !== 'undefined' ? x : this.x; 
  y = typeof y !== 'undefined' ? y : this.y; 
  z = typeof z !== 'undefined' ? z : this.z; 
  
  this.x = x;
  this.y = y;
  this.z = z;

  return this;
};

function Cell(wall, floor, isRoom, furniture, itens) {
  'use strict';

  wall = typeof wall !== 'undefined' ? wall : Cell.defaults.wall;
  isRoom = typeof isRoom !== 'undefined' ? isRoom : Cell.defaults.isRoom;
  floor = typeof floor !== 'undefined' ? floor : Cell.defaults.floor;
  furniture = typeof furniture !== 'undefined' ? furniture : Cell.defaults.furniture;
  itens = typeof itens !== 'undefined' ? itens : Cell.defaults.itens;

  this.wall = wall;
  this.floor = floor;
  this.isRoom = isRoom;
  this.furniture = furniture;
  this.itens = itens;
}

Cell.defaults = {
  isRoom: false,
  wall: true,
  floor: true,
  furniture: null,
  itens: []
};

function Matrix(boundaries, paddings) {
  'use strict';
  
  boundaries = typeof boundaries !== 'undefined' ? boundaries : new Boundaries();
  paddings = typeof paddings !== 'undefined' ? paddings : Matrix.defaults.paddings;

  this.boundaries = boundaries;
  this.body = Matrix.genBody(boundaries);
  this.center = this.getCenter(this);
  this.volume = this.getVolume(this);
  this.paddings = paddings;
  this.builderManager = new BuilderManager(this);
  this.builders = [];
}

Matrix.defaults = {
  paddings: 0
};

Matrix.genBody = function(boundaries) {
  boundaries = typeof boundaries !== 'undefined' ? boundaries: new Boundaries();

  var body = [];

  for (var x = 0; x < boundaries.x; x++) {
    body[x] = [];
    for (var y = 0; y < boundaries.y; y++) {
      body[x][y] = [];
      for (var z = 0; z < boundaries.z; z++) {
        body[x][y][z] = false;
      }
    }
  }

  return body;
};

Matrix.prototype.iterate = function(operation, extra) {
  var boundaries = this.boundaries;

  for (var x = 0; x < boundaries.x; x++) {
    for (var y = 0; y < boundaries.y; y++) {
      for (var z = 0; z < boundaries.z; z++) {
        operation(this, x, y, z, extra);
      }
    }
  }
};

Matrix.prototype.getCenter = function() {
  var boundaries = this.boundaries;

  var center = new Point(
    (boundaries.x - 1) / 2,
    (boundaries.y - 1) / 2,
    (boundaries.z - 1) / 2
  );

  return center;
};

Matrix.prototype.reCenter = function() {
  this.center = this.getCenter(this);
};

Matrix.prototype.fill = function(rule) {
  rule = typeof rule !== 'undefined' ? rule : function() { return false; };
  
  var matrix = this;

  matrix.iterate(function(matrix, x, y, z) {
    matrix.body[x][y][z] = rule(matrix, x, y, z);
  });
};

Matrix.prototype.flatten = function() {
  var matrix = this;

  var flatBoundaries = new Boundaries(
    this.boundaries.x,
    this.boundaries.y
  );
  var flatMatrix = new Matrix(flatBoundaries);

  matrix.iterate(function(matrix, x, y, z) {
    if(matrix.body[x][y][z]) {
      flatMatrix.body[x][y][0] = 1;
    }
  });

  this.update();
};

Matrix.prototype.trim = function() {
  var trimmed = this;
  var boundaries = this.boundaries;

  var emptyX = [];
  for(var i = 0; i < boundaries.y; i++) {
    emptyX[i] = true;
  }

  var emptyY;
  for (var x = 0; x < boundaries.x; x++) {
    emptyY = true;
    for (var y = 0; y < boundaries.y; y++) {
      for (var z = 0; z < boundaries.z; z++) {
        if(trimmed.body[x][y][z]) {
          emptyY = false;
          emptyX[y] = false;
          break;
        }
      }
    }
    if(emptyY) {
      trimmed.body[x].splice(x, 1);
    }
  }

  for(var eX = emptyX.length - 1; eX === 0; eX--) {
    if(emptyX[eX]) {
      for(var col = trimmed.body.length - 1; col === 0; col--) {
        trimmed.body[col].splice(eX, 1);
      }
    }
  }

  this.body = trimmed.body;
  this.update();
};

Matrix.prototype.checkPlacement = function(srcMatrix, pos) {
  var paddings = this.paddings;
  var tgtMatrix = this;
  srcMatrix = srcMatrix.clone();
  srcMatrix.expand(paddings);

  var boundaries = srcMatrix.boundaries;
  var _x;
  var _y;
  var _z;

  for(var x = 0; x < boundaries.x; x++) {
    _x = pos.x + x - paddings;
    if(typeof tgtMatrix.body[_x] !== 'undefined') {
      for(var y = 0; y < boundaries.y; y++) {
        _y = pos.y + y - paddings;
        if(typeof tgtMatrix.body[_x][_y] !== 'undefined') {
          for(var z = 0; z < boundaries.z; z++) {
            _z = pos.z + z - paddings;
            if(typeof tgtMatrix.body[_x][_y][_z] !== 'undefined') {
              if(tgtMatrix.body[_x][_y][_z] === true && srcMatrix.body[x][y][z] === true) {
                return false;
              }
            }
          }
        } else {
          return false;
        }
      }
    } else {
      return false;
    }
  }

  return true;
};

Matrix.prototype.expand = function(radius) {
  radius = typeof radius !== 'undefined' ? radius : 1;
  
  var boundaries = this.boundaries;
  var expanded = new Matrix( new Boundaries(
    boundaries.x + (radius * 2),
    boundaries.y + (radius * 2),
    boundaries.z + (radius * 2)
  ));

  var point = new Point( radius, radius, radius);
  this.transferTo(expanded, point);

  var temp = expanded.clone();


  temp.iterate(function(m, x, y, z ,r) {
    if(m.body[x][y][z] === true) {
      for(var _x = x - r; _x <= x + r; _x++) {
        for(var _y = y - r; _y <= y + r; _y++) {
          for(var _z = z - r; _z <= z + r; _z++) {
            expanded.body[_x][_y][_z] = true;
          }
        }
      }
    }
  }, radius);

  this.body = expanded.body;
  this.update();
};

Matrix.prototype.transferTo = function(destMatrix, point) {
  point = typeof point !== 'undefined' ? point : new Point();
  var matrix = this;
  var boundaries = matrix.boundaries;

  matrix.iterate(function(m, x, y, z, p) {
    var _x = p.x + x;
    var _y = p.y + y;
    var _z = p.z + z;

    destMatrix.body[_x][_y][_z] = matrix.body[x][y][z];
  }, point);

  destMatrix.update();
};

Matrix.prototype.val = function(pos, value) {
  if(this.contains(pos) === true) {
    if(typeof value !== 'undefined') {
      this.body[pos.x][pos.y][pos.z] = value;
    } else {
      return this.body[pos.x][pos.y][pos.z];
    }
  } else {
    return undefined;
  }
};

Matrix.prototype.update = function() {
  this.boundaries.update(
    this.body.length,
    this.body[0].length,
    this.body[0][0].length
  );
  this.reCenter();
};

Matrix.prototype.clone = function() {
  this.update();

  var clone = new Matrix( new Boundaries(
    this.boundaries.x,
    this.boundaries.y,
    this.boundaries.z
  ));

  this.transferTo(clone);

  return clone;
};

Matrix.prototype.getVolume = function() {
  var volume = 0;

  for (var x = 0; x < this.body.length; x++) {
    for (var y = 0; y < this.body[x].length; y++) {
      for (var z = 0; z < this.body[x][y].length; z++) {
        if(this.body[x][y][z]) {
          volume++;
        }
      }
    }
  }

  return volume;
};

Matrix.prototype.randPos = function(xRange, yRange, zRange) {
  xRange = typeof xRange !== 'undefined' ? xRange : [0, this.boundaries.x - 1];
  yRange = typeof yRange !== 'undefined' ? yRange : [0, this.boundaries.y - 1];
  zRange = typeof zRange !== 'undefined' ? zRange : [0, this.boundaries.z - 1];

  return new Point(
    Tool.randRange(xRange[0], xRange[1]),
    Tool.randRange(yRange[0], yRange[1]),
    Tool.randRange(zRange[0], zRange[1])
  );
};

Matrix.prototype.contains = function(pos, excludePaddings) {
  excludePaddings = typeof excludePaddings !== 'undefined' ? excludePaddings : false;

  if(
    typeof this.body[pos.x] !== 'undefined' &&
    typeof this.body[pos.x][pos.y] !== 'undefined' &&
    typeof this.body[pos.x][pos.y][pos.z] !== 'undefined'
  ) {
    if(excludePaddings) {
      var paddings = this.paddings;
      var boundaries = this.boundaries;

      if (
        pos.x < paddings ||
        pos.y < paddings ||
        // pos.z === paddings - 1 ||
        pos.x > boundaries.x - 1 - paddings ||
        pos.y > boundaries.y - 1 - paddings//||
        // pos.z === boundaries.z - 1 - padding
      ) {
        return false;
      }
    }

    return true;
  }

  return false;
};
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

function BuilderManager(tgtMatrix) {
  'use strict';

  this.tgtMatrix = tgtMatrix;
  this.builders = {
    current: [],
    stash: []
  };  
}

BuilderManager.prototype.addBuilder = function(type, pos, options) {
  var builders = this.builders;
  var builder = new window[type](this, pos, options);

  if(this.builders.current.length === 0) {
    builders.current.push(builder);
  } else {
    builders.stash.push(builder);
  }
};

BuilderManager.prototype.recycle = function() {
  var builders = this.builders;

  for(var b = builders.current.length - 1; b >= 0; b--) {
    if(builders.current[b].alive === false) {
      builders.current.splice(b, 1);
    }
  }

  if(builders.current.length === 0) {
    builders.current = builders.stash;
    builders.stash = [];
    console.log('end of generation');
  }
};

BuilderManager.prototype.build = function() {
  // var builders = this.builders;

  // while(builders.current.length > 0) {
  //   for(var b in builders.current) {
  //     builders.current[b].work();
  //   }
  //   this.recycle();
  // }

  var self = this;
  var i = setInterval(function() {
    var builders = self.builders;

    if(builders.current.length > 0) {
      for(var b in builders.current) {
        builders.current[b].work();
      }
      self.recycle();
    } else {
      clearInterval(i);
      console.log('stopped building');
    }
  }, 100);
  console.log('started building');
};

BuilderManager.prototype.addTunneler = function() {
  this.addBuilder('Tunneler', undefined, {paddings: this.tgtMatrix.paddings});
};
function Tunneler(manager, pos, options) {
  options = typeof options !== 'undefined' ? options : {};

  options.jobCondition = function(pos) {
    return manager.tgtMatrix.val(pos).wall === true;
  };

  //options.width = Tool.randAttr([1, 3]);

  Builder.call(this, manager, 'Tunneler', function(tunneler) {
    var cell = tunneler.tgtMatrix.val(tunneler.pos);

    if(typeof cell === 'object' && cell.isRoom === false) {
      tunneler.tgtMatrix.val(tunneler.pos, new Cell(false));
    }
  }, pos, options);
}

Tunneler.prototype = Builder.prototype;
Tunneler.prototype.constructor = Tunneler;

Tunneler.prototype.spawn = (function(_super) {
  return function() {
    _super.call(this, this.type, this.pos, {paddings: this.tgtMatrix.paddings});
  };
})(Builder.prototype.spawn);

function Roomer(tgtMatrix, pos) {
  Builder.call(this, tgtMatrix, function(roomer) {
    var cell = roomer.tgtMatrix.val(roomer.pos);

    if(typeof cell === 'object' && cell.isRoom === false) {
      roomer.tgtMatrix.val(roomer.pos, new Cell(false));
      roomer.mayDo(5, function() {
        roomer.spawn();
      });
      roomer.mayDo(5, function() {
        roomer.turn();
      });
      roomer.move();
      roomer.age();
    } else {
      roomer.die();
    }
  }, pos);
}

Roomer.prototype = Builder.prototype;
Roomer.prototype.constructor = Roomer;

function Module(type, size) {
  'use strict';
  
  this.size = size;
  this.blueprint = null;
  this.volume = null;
}

function Ship(size, shipClass, faction) {
  'use strict';

  size = typeof size !== 'undefined' ? size : Ship.defaults.size;
  shipClass = typeof shipClass !== 'undefined' ? shipClass : Ship.defaults.shipClass;
  faction = typeof faction !== 'undefined' ? faction : Ship.defaults.faction;

  this.name = 'Forgotten Hull';
  this.size = size;
  this.roomCount = Ship.gen.roomCount[size]();
  this.shipClass = shipClass;
  this.faction = faction;
  this.age = null;
  this.integrity = null;
  this.matrix = Ship.genMatrix(this);
  this.rooms = [];

  Ship.populate(this);
}

Ship.defaults = {
  size: 'medium',
  shipClass: 'transport',
  faction: 'faction',
  spawnChances: 20
};

Ship.gen = {
  sizeFactor: 5,
  roomCount: {
    tiny: function() {
      return Tool.randRange(5, 8);
    },

    small: function() {
      return Tool.randRange(10, 15);
    },

    medium: function() {
      return Tool.randRange(20, 30);
    },

    large: function() {
      return Tool.randRange(35, 52);
    },

    veryLarge: function() {
      return Tool.randRange(55, 82);
    },

    huge: function() {
      return Tool.randRange(85, 127);
    }
  },
  roomPaddings: 1
};

Ship.genMatrix = function(ship, shipClass, faction) {
  var boundaries = new Boundaries(
    ship.roomCount * Ship.gen.sizeFactor,
    ship.roomCount * Ship.gen.sizeFactor,
    21
  );

  var matrix = new Matrix(boundaries, Ship.gen.roomPaddings);
  matrix.flatten(); //change to enable 3D placement
  matrix.fill(function() {
    return new Cell();
  });

  return matrix;
};

Ship.prototype.place = function(room, point) {
  var ship = this;
  var srcMatrix = room.matrix;
  var destMatrix = ship.matrix;

  srcMatrix.transferTo(destMatrix, point);
  // console.log('placed at ' + point.x + ' ' + point.y + ' ' + point.z);
};

Ship.prototype.pushRoom = function(room, point) {
  var ship = this;

  var log = {
    room: room,
    at: point
  };

  ship.rooms.push(log);
  ship.place(room, point);
};

Ship.populate = function(ship) {
  var simmetry = 'noSimmetry'; //make dynamic and relative to faction
  var placement = 'clustered'; //make dynamic and relative to faction

  ship.addBuilder('Tunneler');
  // ship.matrix.addBuilder(new Tunneler(ship.matrix));
  // ship.matrix.addBuilder(new Tunneler(ship.matrix));
  ship.build();

  // new Tunneler(ship.matrix);
  // new Tunneler(ship.matrix);
  // new Tunneler(ship.matrix);
  // while(ship.roomCount > ship.rooms.length) {
  //   ShipGen.randRule('roomPlacement.patterns')(ship);
  //   // ShipGen.getRule('roomPlacement.patterns', 'cluster')(ship, rC);
  // }
  
  ship.matrix.flatten();

  //matrix.trim(); fix trim
};

Ship.prototype.addBuilder = function(type) {
  switch(type) {
    case 'Tunneler':
    this.matrix.builderManager.addTunneler();  
  }
};

Ship.prototype.rmBuilder = function(builder) {
  this.matrix.builderManager.rmBuilder(builder);
};

Ship.prototype.build = function() {
  this.matrix.builderManager.build();
};

function Main() {
  'use strict';
}

Main.setup = function() {
  Main.add(new Ship('small', 'transport', 'aaa'));
};

Main.renderTree = [];

Main.add = function(agent) {
  Main.renderTree.push(agent);
};

Main.render = function() {
  var renderTree = Main.renderTree;
  var tgtMatrix;
  var renderData;

  for(var a in renderTree) {
    renderData = [];
    tgtMatrix = renderTree[a].matrix;

    for (var x = 0; x < tgtMatrix.body.length; x++) {
      renderData.push([]);
      for (var y = 0; y < tgtMatrix.body[x].length; y++) {
        if(tgtMatrix.body[x][y][0].wall === false) {
          renderData[x].push('.');
        } else {
          renderData[x].push('|');
        }
      }
    }
  }

  return renderData;
};

//debug
// var t = new Tunneler(new Matrix(new Boundaries()));
// console.log(t);
// t.log();