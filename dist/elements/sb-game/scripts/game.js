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

Tool.weightedRandAttr = function(object, chances) {
  var _chances = chances.slice(0);

  for(var c = 1; c < _chances.length; c++) {
    _chances[c] += _chances[c - 1];
  }

  var roll = Tool.randRange(1, _chances[_chances.length - 1]);

  for(var o = 1; o < object.length; o++) {

    if(roll > _chances[o - 1] && roll <= _chances[o]) {
      return object[o]; 
    }
  }

  return  object[0];
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

Tool.clone = function(object) {
  return JSON.parse(JSON.stringify(object));
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

Point.prototype.up = function(steps) {
  steps = typeof steps !== 'undefined' ? steps : 1;

  return new Point(this.x, this.y - steps, this.z);
};

Point.prototype.right = function(steps) {
  steps = typeof steps !== 'undefined' ? steps : 1;

  return new Point(this.x + steps, this.y, this.z);
};

Point.prototype.down = function(steps) {
  steps = typeof steps !== 'undefined' ? steps : 1;

  return new Point(this.x, this.y + steps, this.z);
};

Point.prototype.left = function(steps) {
  steps = typeof steps !== 'undefined' ? steps : 1;

  return new Point(this.x - steps, this.y, this.z);
};

Point.prototype.neighbors = function(radius, flat) {
  radius = typeof radius !== 'undefined' ? radius: 1;
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

Point.prototype.neighborsInAxis = function(axis, radius) {
  radius = typeof radius !== 'undefined' ? radius: 1;

  var neighbors = [];

  for(var i = this[axis] - radius; i <= this[axis] + radius; i++) {
    var n; 
    if(axis === 'x') {
      n = new Point(i, this.y, this.z);
    } else if(axis === 'y') {
      n = new Point(this.x, i, this.z);
    } else if(axis === 'z') {
      n = new Point(this.x, this.y, i);
    }

    neighbors.push(n);
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

function Cell(id, type, entities) {
  'use strict';

  id = typeof id !== 'undefined' ? id : Cell.defaults.id;
  type = typeof type !== 'undefined' ? type : Cell.defaults.type;
  entities = typeof entities !== 'undefined' ? entities : {};
  entities.tile = typeof entities.tile !== 'undefined' ? entities.tile : Cell.defaults.tile;
  entities.itens = typeof entities.itens !== 'undefined' ? entities.itens : [];
  entities.furniture = typeof entities.furniture !== 'undefined' ? entities.furniture : [];
  entities.characters = typeof entities.characters !== 'undefined' ? entities.characters : [];

  this.id = id;
  this.type = type;
  this.tile = entities.tile;
  this.itens = entities.itens;
  this.furniture = entities.furniture;
  this.characters = entities.characters;
}

Cell.defaults = {
  id: 'void',
  type: 'void',
  tile: '|'
};

Cell.prototype.clone = function() {
  var entities = {
    tile: this.tile,
    itens: this.itens,
    furniture: this.furniture,
    characters: this.characters
  }

  var clone = new Cell(this.id, this.type, entities);

  return clone;
}

function Corridor(id, entities) {
  'use strict';
  
  entities = typeof entities !== 'undefined' ? entities : {};
  entities.tile = 'C';

  Cell.call(this, id, 'corridor', entities);
}

Corridor.prototype = Object.create(Cell.prototype);
Corridor.prototype.constructor = Corridor;

Corridor.prototype.clone = function() {
  var constructor = this.constructor;

  var entities = {
    tile: this.tile,
    itens: this.itens,
    furniture: this.furniture,
    characters: this.characters
  }

  var clone = new Corridor(this.id, entities);

  return clone;
}
function RoomCell(id, entities) {
  'use strict';

  entities = typeof entities !== 'undefined' ? entities : {};
  entities.tile = 'R';

  Cell.call(this, id, 'room', entities);
}

RoomCell.prototype = Object.create(Cell.prototype);
RoomCell.prototype.constructor = RoomCell;

RoomCell.prototype.clone = function() {
  var constructor = this.constructor;

  var entities = {
    tile: this.tile,
    itens: this.itens,
    furniture: this.furniture,
    characters: this.characters
  }

  var clone = new RoomCell(this.id, entities);

  return clone;
}
function Matrix(boundaries, paddings) {
  'use strict';
  
  boundaries = typeof boundaries !== 'undefined' ? boundaries : new Boundaries();
  paddings = typeof paddings !== 'undefined' ? paddings : Matrix.defaults.paddings;

  this.boundaries = boundaries;
  this.body = Matrix.genBody(boundaries);
  this.center = this.getCenter(this);
  this.volume = this.getVolume(this);
  this.paddings = paddings;
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
        body[x][y][z] = new Cell();
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
  var _srcMatrix = srcMatrix.clone();
  _srcMatrix.expand(paddings);

  var boundaries = _srcMatrix.boundaries;
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
              if(
                tgtMatrix.body[_x][_y][_z].type !== 'void' && 
                _srcMatrix.body[x][y][z].type !== 'void' &&
                _srcMatrix.body[x][y][z].id !== tgtMatrix.body[_x][_y][_z].id
              ) {
                if(_srcMatrix.body[x][y][z].type === tgtMatrix.body[_x][_y][_z].type) {
                  console.log(tgtMatrix.body[_x][_y][_z].type);
                }
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
  var a = this.body;
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
    var cell = m.body[x][y][z];

    if(cell.type !== 'void') {
      var clone = cell.clone();

      for(var _x = x - r; _x <= x + r; _x++) {
        for(var _y = y - r; _y <= y + r; _y++) {
          for(var _z = z - r; _z <= z + r; _z++) {
            expanded.body[_x][_y][_z] = clone;
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
    var cell = m.body[x][y][z];
    var clone = cell.clone();

    destMatrix.body[_x][_y][_z] = clone;
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
function Room(id, size, shape) {
  'use strict';
  this.id = id;
  this.size = size;
  this.shape = shape;
  this.matrix = Room.gen.matrix(id, size, shape);
}

Room.gen = {
  matrix: function(id, size, shape) {
    var boundaries = Room.gen.boundaries(size);

    var matrix = new Matrix(boundaries);
    Room.gen.shape(matrix, shape);

    matrix.iterate(function(m, x, y, z) {
      var cell = m.body[x][y][z];
      if(cell.type === 'room') {
        cell.id = id;
      }
    });

    return matrix;
  },

  boundaries: function(size) {
    var boundaries;
    if(size === 'random') {
      boundaries = Tool.randAttr(Room.gen.size)();
    } else {

      boundaries = Room.gen.size[size]();
    }

    return boundaries;
  },

  size: {
    small: function() {
      var boundaries = new Boundaries(
        Tool.randAttr([3, 5]),
        Tool.randAttr([3, 5]),
        Tool.randAttr([1, 3])
      );

      return boundaries;
    },

    medium: function() {
      var boundaries = new Boundaries(
        Tool.randAttr([5, 7]),
        Tool.randAttr([5, 7]),
        Tool.randAttr([1, 3, 5])
      );

      return boundaries;
    },

    large: function() {
      var boundaries = new Boundaries(
        Tool.randAttr([7, 9, 11]),
        Tool.randAttr([7, 9, 11]),
        Tool.randAttr([1, 3, 5, 7])
      );

      return boundaries;
    },

    huge: function() {
      var boundaries = new Boundaries(
        Tool.randAttr([11, 13, 15, 17, 19, 21]),
        Tool.randAttr([11, 13, 15, 17, 19, 21]),
        Tool.randAttr([3, 5, 7, 9])
      );

      return boundaries;
    }
  },

  shape: function(matrix, shape) {
    if(shape === 'random') {
      Tool.randAttr(Room.gen.shapes)(matrix);
    } else {
      Room.gen.shapes[shape](matrix);
    }
  },

  shapes: {
    rectangle: function(matrix) {
      matrix.flatten();
      matrix.fill(Room.gen.geometry.cuboid);
    },

    cuboid: function(matrix) {
      matrix.fill(Room.gen.geometry.cuboid);
    },

    ellipse: function(matrix) {
      matrix.flatten();
      matrix.fill(Room.gen.geometry.ellipticCylinder);
    },

    ellipticCylinder: function(matrix) {
      matrix.fill(Room.gen.geometry.ellipticCylinder);
    },

    semiCircle: function(matrix) {

      return matrix;
    },

    ellipsoid: function(matrix) {

      return matrix;
    },

    semiSphere: function(matrix) {

      return matrix;
    },

    torus: function(matrix) {

      return matrix;
    },

    T: function(matrix) {

      return matrix;
    },

    Y: function(matrix) {

      return matrix;
    },

    cross: function(matrix) {

      return matrix;
    }
  },

  geometry: {
    cuboid: function(matrix) {
      return new RoomCell();
    },

    ellipticCylinder: function(matrix, x, y) {
      if(Math.pow((x - 0.5 - matrix.boundaries.x / 2) / (matrix.boundaries.x / 2), 2) + Math.pow((y - 0.5 - matrix.boundaries.y / 2) / (matrix.boundaries.y / 2), 2) <= 1) {
        return new RoomCell();
      } else {
        return new Cell();
      }
      
    }
  }
};

Room.prototype.expand = function(radius) {
  return this.matrix.expand(radius);
};

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

function BuilderManager(ship) {
  'use strict';

  this.ship = ship;
  this.tgtMatrix = ship.matrix;
  this.buildersCount = 0;
  this.generation = 0;
  this.builders = {
    current: [],
    stash: []
  };  
}

BuilderManager.prototype.addBuilder = function(type, options) {
  var builders = this.builders;
  var builder = new window[type](this, options);

  if(this.builders.current.length === 0) {
    builders.current.push(builder);
  } else {
    builders.stash.push(builder);
  }

  this.buildersCount++;
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
    this.generation++;
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

    if(builders.current.length > 0 && self.ship.blueprints.length > 0) {
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

BuilderManager.prototype.addTunneler = function(options) {
  options = typeof options !== 'undefined' ? options : {};
  options.paddings = typeof options.paddings !== 'undefined' ? options.paddings : this.tgtMatrix.paddings;

  this.addBuilder('Tunneler', options);
};

BuilderManager.prototype.addRoomer = function(options) {
  options = typeof options !== 'undefined' ? options : {};
  options.paddings = typeof options.paddings !== 'undefined' ? options.paddings : this.tgtMatrix.paddings;

  this.addBuilder('Roomer', options);
};

BuilderManager.prototype.placeRoom = function(room, point) {
  var ship = this.ship;
  var srcMatrix = room.matrix;
  var destMatrix = ship.matrix;

  srcMatrix.transferTo(destMatrix, point);
  this.discartBlueprint();
  this.logRoom(room, point);
  // console.log('placed at ' + point.x + ' ' + point.y + ' ' + point.z);
};

BuilderManager.prototype.logRoom = function(room, point) {
  var ship = this.ship;

  var log = {
    room: room,
    at: point
  };

  ship.rooms.push(log);
};

BuilderManager.prototype.discartBlueprint = function() {
  this.ship.blueprints.splice(0, 1);
};

function Tunneler(manager, options) {
  'use strict';

  options = typeof options !== 'undefined' ? options : {};
  options.type = 'Tunneler';
  options.width = typeof options.width !== 'undefined' ? options.width : Tunneler.defaults.width();

  Builder.call(this, manager, Tunneler.job, Tunneler.jobCondition, options);
}

Tunneler.defaults = {
  width: function() {
    return Tool.randAttr([1, 3]);
  }
};

Tunneler.prototype = Object.create(Builder.prototype);
Tunneler.prototype.constructor = Tunneler;

Tunneler.genCorridor = function(tunneler) {
  var id = tunneler.id;
  var sA = tunneler.secondaryAxis;
  var width = tunneler.options.width;
  var boundaries;

  if(sA === 'x') {
    boundaries = new Boundaries(width, 1, 1);
  } else if(sA === 'y') {
    boundaries = new Boundaries(1, width, 1);
  }

  var corridor = new Matrix(boundaries);
  corridor.fill(function() {
    return new Corridor(id);
  });
  
  return corridor;
};

Tunneler.prototype.spawn = function() {
  if(this.alive) {
    var pDirections = this.possibleDirections(this.pos, true);
    var direction;
    var types = ['Tunneler', 'Roomer']; 
    var type;
    var i = Tool.randRange(0, pDirections.length - 1);

    var offset = Math.ceil(this.options.width / 2);

    for(i; i >= 0; i--) {
      direction = pDirections[i];
      type = Tool.weightedRandAttr(['Tunneler', 'Roomer'], Ship.gen.params.corridorsVsRooms);

      switch(type) {
        case 'Tunneler':
          this.manager.addTunneler({startingPos: this.pos[direction](offset), startingDir: direction});
          break;

        case 'Roomer':
          this.manager.addRoomer({startingPos: this.pos[direction](offset), startingDir: direction});
          break;
      }

      console.log('spawned');
    }
  }
};


Tunneler.job = function(tunneler) {
  var corridor = tunneler.corridor;
  var pos = tunneler.pos.toTopLeft(corridor);
  var tgtMatrix = tunneler.tgtMatrix;

  corridor.transferTo(tgtMatrix, pos);
};

Tunneler.jobCondition = function(tunneler, pos) {
  if(tunneler.direction) {
    tunneler.corridor = Tunneler.genCorridor(tunneler);
    var tgtMatrix = tunneler.tgtMatrix;
    var direction = tunneler.direction;

    var _pos = pos[direction]();

    return tgtMatrix.checkPlacement(tunneler.corridor, _pos);
  } else {
    return true;
  }
};

function Roomer(manager, options) {
  'use strict';

  options = typeof options !== 'undefined' ? options : {};
  options.type = 'Roomer';

  Builder.call(this, manager, Roomer.job, Roomer.jobCondition, options);
} 

Roomer.prototype = Object.create(Builder.prototype);
Roomer.prototype.constructor = Roomer;

Roomer.prototype.work = function() {
  if(this.manager.ship.blueprints.length > 0) {
    this.room = Roomer.genRoom(this);

    if(this.jobCondition(this)) {
      this.job(this);
    }
  }
  
  this.die();
};

Roomer.genRoom = function(roomer) {
  var id = roomer.id;
  var size = roomer.manager.ship.blueprints[0];

  return new Room(id, size, 'rectangle'); //CHANGE SHAPE
};

Roomer.job = function(roomer) {
  var room = roomer.room;
  var manager = roomer.manager;
  var pos = roomer.pos;
  var roomPos = roomer.roomPlacementPos();

  roomer.buildEntrance(pos);
  manager.placeRoom(room, roomPos);
};

Roomer.jobCondition = function(roomer) {
  var _pos = roomer.roomPlacementPos();

  return roomer.tgtMatrix.checkPlacement(roomer.room.matrix, _pos);
};

Roomer.prototype.roomPlacementPos = function() {
  var room = this.room;
  var _pos = this.pos.toTopLeft(room.matrix);
  var direction = this.direction;
  var primaryAxis = this.primaryAxis;

  _pos = _pos[direction](room.matrix.center[primaryAxis] + 1);

  return _pos;
};

Roomer.prototype.buildEntrance = function(pos) {
  var secondaryAxis = this.secondaryAxis;
  var sAxisLength = this.room.matrix.boundaries[secondaryAxis];
  var maxEntrances = (sAxisLength  - 1) / 2;
  var entranceCount = Tool.randRange(1, maxEntrances);
  var entrancePos = pos.neighborsInAxis(secondaryAxis, maxEntrances);

  while(entranceCount > 0 && entrancePos.length > 0) {
    var selectedPos = Tool.randAttr(entrancePos);
    var index = entrancePos.indexOf(selectedPos);

    this.tgtMatrix.val(selectedPos, new RoomCell({
      furniture: ['Door']//change to object
    }));

    var _index = index;
    var exclude = 1;

    if(typeof selectedPos[index - 1] !== 'undefined') {
      _index--;
      exclude++;
    }

    if(typeof selectedPos[index + 1] !== 'undefined') {
      exclude++;
    }
    
    entrancePos.splice(_index, exclude);
    entranceCount--;
  }
};

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
  this.shipClass = shipClass;
  this.faction = faction;
  this.age = null;
  this.integrity = null;
  this.blueprints = Ship.gen.blueprints(size);
  this.rooms = [];
  
  this.matrix = Ship.gen.matrix(this);
  this.builderManager = new BuilderManager(this);
  
  this.build();
}

Ship.defaults = {
  size: 'medium',
  shipClass: 'transport',
  faction: 'faction',
  spawnChances: 20
};

Ship.gen = {
  params: {
    sizeFactor: 5,
    roomPaddings: 1,
    corridorsVsRooms: [20, 80],
  },
  blueprints: function(size) {
    var blueprints = [];
    var roomCount;
    var roomChance;

    switch(size) {
      case 'tiny':
        roomCount = Tool.randRange(5, 8);
        roomChance = [75, 25, 0, 0];
        break;

      case 'small':
        roomCount = Tool.randRange(10, 15);
        roomChance = [65, 25, 10, 0];
        break;

      case 'medium':
        roomCount = Tool.randRange(20, 30);
        roomChance = [45, 25, 20, 10];
        break;

      case 'large':
        roomCount = Tool.randRange(35, 52);
        roomChance = [30, 30, 25, 15];
        break;

      case 'huge':
        roomCount = Tool.randRange(55, 82);
        roomChance = [15, 35, 30, 20];
        break;

      case 'colossal':
        roomCount = Tool.randRange(85, 127);
        roomChance = [15, 35, 30, 20];
        break;

      default:
        roomCount = Tool.randRange(5, 8);
        roomChance = [75, 25, 0, 0];
        break;
    }

    for(roomCount; roomCount > 0; roomCount--) {
      blueprints.push(Tool.weightedRandAttr(['small', 'medium', 'large', 'huge'], roomChance));
    }

    return blueprints;
  },
  matrix: function(ship, shipClass, faction) {
    var roomCount = ship.blueprints.length;
    var boundaries = new Boundaries(
      roomCount * Ship.gen.params.sizeFactor,
      roomCount * Ship.gen.params.sizeFactor,
      21
    );

    var matrix = new Matrix(boundaries, Ship.gen.params.roomPaddings);
    matrix.flatten(); //change to enable 3D placement
    
    return matrix;
  }
};

Ship.prototype.build = function() {
  var simmetry = 'noSimmetry'; //make dynamic and relative to faction
  var placement = 'clustered'; //make dynamic and relative to faction

  this.builderManager.addTunneler();
  this.builderManager.build();

  // new Tunneler(ship.matrix);
  // new Tunneler(ship.matrix);
  // new Tunneler(ship.matrix);
  // while(ship.roomCount > ship.rooms.length) {
  //   ShipGen.randRule('roomPlacement.patterns')(ship);
  //   // ShipGen.getRule('roomPlacement.patterns', 'cluster')(ship, rC);
  // }
  
  this.matrix.flatten();

  //matrix.trim(); fix trim
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
        var cell = tgtMatrix.body[x][y][0];
          renderData[x].push(cell.tile);
      }
    }
  }

  return renderData;
};

//debug
// var t = new Tunneler(new Matrix(new Boundaries()));
// console.log(t);
// t.log();