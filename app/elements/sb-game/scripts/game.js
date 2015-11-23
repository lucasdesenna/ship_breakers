function Tool() {
  'use strict';
}

Tool.debugMode = false;

Tool.clone = function(object) {
  var clone = {};

  for(var o in object) {
    clone[o] = object[o];
  }

  return clone;
};

Tool.dirToAxis = function(direction) {
  var axis;

  if(direction === 'up' || direction === 'down') {
    axis = 'y';
  } else if(direction === 'right' || direction === 'left') {
    axis = 'x';
  }

  return axis;
};

Tool.perpendicularAxis = function(axis) {
  var pAxis;

  if(axis === 'x') {
    pAxis = 'y';
  } else if(axis === 'y') {
    pAxis = 'x';
  }

  return pAxis;
};

Tool.randRange = function(min, max) {
  var seed = Main.seed;

  return Math.round(seed.pick() * (max - min) + min);
};

Tool.randPercent= function() {
  return Tool.randRange(1, 100);
};

Tool.oneIn = function(universe) {
  return Tool.randRange(1, universe) === universe;
};

Tool.randPos = function(xRange, yRange, zRange) {
  xRange = typeof xRange !== 'undefined' ? xRange : [0, this.boundaries.x - 1];
  yRange = typeof yRange !== 'undefined' ? yRange : [0, this.boundaries.y - 1];
  zRange = typeof zRange !== 'undefined' ? zRange : [0, this.boundaries.z - 1];

  return new Point(
    Tool.randRange(xRange[0], xRange[1]),
    Tool.randRange(yRange[0], yRange[1]),
    Tool.randRange(zRange[0], zRange[1])
  );
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

function Seed(val) {
  'use strict';
  
  val = typeof val !== 'undefined' ? val : Seed.genVal();

  this.val = val;
  this.length = val.length;
}

Seed.genVal = function(length) {
  length = typeof length !== 'undefined' ? length : 100;
  var val = [];

  for(var s = length; s > 0; s--) {
    val.push(Math.random());
  }

  return val;
};

Seed.prototype.pick = function() {
  var pick = this.val.splice(0, 1)[0];
  this.val.push(pick);

  return pick;
}

Seed.prototype.reset = function() {
  this.val = Seed.genVal(this.length);
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
  excludeSelf = typeof excludeSelf !== 'undefined' ? excludeSelf: false;

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


Point.prototype.inAxis = function(axis, radius) {
  radius = typeof radius !== 'undefined' ? radius: 1;

  var inAxis = [];

  for(var i = this[axis] - radius; i <= this[axis] + radius; i++) {
    var n; 
    if(axis === 'x') {
      n = new Point(i, this.y, this.z);
    } else if(axis === 'y') {
      n = new Point(this.x, i, this.z);
    } else if(axis === 'z') {
      n = new Point(this.x, this.y, i);
    }

    inAxis.push(n);
  }

  return inAxis;
};

Point.prototype.parallelsInAxis = function(axis, distance, length) {
  distance = typeof distance !== 'undefined' ? distance: 1;
  length = typeof length !== 'undefined' ? length: 1;

  var splitLength = Math.floor((length - 1) / 2);

  var parallels = [];

  for(var i = this[axis] - splitLength; i <= this[axis] + splitLength; i++) {
    var p;
    if(axis === 'x') {
      p = new Point(i, this.y, this.z);
      parallels.push(p.up(distance));
      parallels.push(p.down(distance));
    } else if(axis === 'y') {
      p = new Point(this.x, i, this.z);
      parallels.push(p.right(distance));
      parallels.push(p.left(distance));
    }// else if(axis === 'z') { change to make 3D work
    //   p = new Point(this.x, this.y, i);
    // }
  }

  return parallels;
};

Point.prototype.parallels = function(distance, length) {
  distance = typeof distance !== 'undefined' ? distance: 1;
  length = typeof length !== 'undefined' ? length: 1;

  var splitLength = Math.floor((length - 1) / 2);

  var parallels = [];

  parallels = parallels.concat(this.parallelsInAxis('x', distance, length));
  parallels = parallels.concat(this.parallelsInAxis('y', distance, length));

  return parallels;
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

    if(
      !(n.x === this.x &&
      n.y === this.y &&
      n.z === this.z)
    ) {
      neighbors.push(n);
    }
  }

  return neighbors;
};

Point.prototype.neighbors = function(radius) {
  radius = typeof radius !== 'undefined' ? radius: 1;

  var neighborsX = this.neighborsInAxis('x', radius);
  var neighborsY = this.neighborsInAxis('y', radius);

  var neighbors = neighborsX.concat(neighborsY);

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

Point.prototype.dirTo = function(tgtPoint) {
  var xDelta = Math.abs(this.x - tgtPoint.x);
  var yDelta = Math.abs(this.y - tgtPoint.y);
  // var zDelta = Math.abs(this.z - tgtPoint.z);
  
  if(xDelta > yDelta) {
    if(this.x < tgtPoint.x) return 'right';
    if(this.x > tgtPoint.x) return 'left';
  } else if(xDelta < yDelta) {
    if(this.y > tgtPoint.y) return 'up';
    if(this.y < tgtPoint.y) return 'down';
  } else {
    console.error('diagonal alert!');
    console.log(this);
    debugger;
  }

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
  tile: ' '
};

Cell.prototype.clone = function() {
  var entities = {
    tile: this.tile,
    itens: this.itens,
    furniture: this.furniture,
    characters: this.characters
  };

  var clone = new Cell(this.id, this.type, entities);

  return clone;
};

function Corridor(id, entities) {
  'use strict';
  
  entities = typeof entities !== 'undefined' ? entities : {};
  // entities.tile = 'C'; //debug
  entities.tile = '.';

  Cell.call(this, id, 'corridor', entities);
}

Corridor.prototype = Object.create(Cell.prototype);
Corridor.prototype.constructor = Corridor;

function Entrance(id, entities) {
  'use strict';
  
  entities = typeof entities !== 'undefined' ? entities : {};
  // entities.tile = 'E'; //debug
  entities.tile = '.';

  Cell.call(this, id, 'entrance', entities);
}

Entrance.prototype = Object.create(Cell.prototype);
Entrance.prototype.constructor = Entrance;

function Hull(id, entities) {
  'use strict';
  
  entities = typeof entities !== 'undefined' ? entities : {};
  entities.tile = '#';

  Cell.call(this, id, 'hull', entities);
}

Hull.prototype = Object.create(Cell.prototype);
Hull.prototype.constructor = Hull;

function RoomCell(id, entities) {
  'use strict';

  entities = typeof entities !== 'undefined' ? entities : {};
  // entities.tile = 'R'; //debug
  entities.tile = '.';

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
  };

  var clone = new RoomCell(this.id, entities);

  return clone;
};

function Matrix(boundaries, paddings) {
  'use strict';
  
  boundaries = typeof boundaries !== 'undefined' ? boundaries : new Boundaries();
  paddings = typeof paddings !== 'undefined' ? paddings : Matrix.defaults.paddings;

  this.boundaries = boundaries;
  this.body = Matrix.genBody(boundaries);
  this.center = this.getCenter();
  this.volume = this.getVolume();
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
        var rtrn = operation(this, x, y, z, extra);
        if(rtrn === 'continue') continue;
        if(rtrn === 'break') return 'break';
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
    var r = rule(matrix, x, y, z);
    if(r !== false) {
      matrix.body[x][y][z] = r;
    }
  });
};

Matrix.prototype.flatten = function() {
  var flatBoundaries = new Boundaries(
    this.boundaries.x,
    this.boundaries.y
  );
  var flatMatrix = new Matrix(flatBoundaries);

  this.iterate(function(m, x, y, z) {
    var pos = new Point(x, y, z);
    var cell = m.val(pos);

    if(m.contains(pos) && cell.type !== 'void') {
      var _pos = new Point(x, y, 0);

      flatMatrix.val(_pos, cell);
    }
  });

  this.body = flatMatrix.body;

  this.update();
};

Matrix.prototype.trim = function() {
  var emptyX = [],
      emptyY = [],
      emptyZ = [];
  var cell;

  this.iterate(function(m, x, y, z) {
    cell = m.body[x][y][z];

    if(cell.type !== 'void') {
      emptyX[x] = false;
      emptyY[y] = false;
      emptyZ[z] = false;
    } else {
      if(emptyX[x] !== false) emptyX[x] = true;
      if(emptyY[y] !== false) emptyY[y] = true;
      if(emptyZ[z] !== false) emptyZ[z] = true;
    }
  });

  var clone = this.clone();

  for(var x = emptyX.length - 1; x >= 0; x--) {
    if(emptyX[x] === true) {
      clone.body.splice(x, 1);
    } else {
      for(var y = emptyY.length - 1; y >= 0; y--) {
        if(emptyY[y] === true) {
          clone.body[x].splice(y, 1);
        } else {
          for(var z = emptyZ.length - 1; z >= 0; z--) {
            if(emptyZ[z] === true) {
              clone.body[x][y].splice(z, 1);
            }
          }
        }
      }
    }
  }

  this.body = clone.body;
  this.update();
};

Matrix.prototype.flip = function(axis) {
  var x;
  var y;

  switch(axis) {
    case 'x':
      this.body.reverse();
      break;

    case 'y':
      for(x in clone.body) {
        this.body[x].reverse();
      }
      break;

    case 'z':
      for(x in clone.body) {
        for(y in clone.body[x]) {
          this.body[x][y].reverse();
        }
      }
      break;
  }
};

Matrix.prototype.mirror = function(axis, offset) {
  axis = typeof axis !== 'undefined' ? axis : 'x';
  offset = typeof offset !== 'undefined' ? offset : 0;

  var clone;

  if(offset > 0) {
    this.slice(axis, -offset, offset);
  }
  
  clone = this.clone();
  clone.flip(axis);

  this.extend(axis, clone);
  this.update();
  // console.log('mirrored');
};

Matrix.prototype.slice = function(axis, start, howMany) {
  axis = typeof axis !== 'undefined' ? axis : 'x';
  howMany = typeof howMany !== 'undefined' ? howMany : 1;
  start = typeof start !== 'undefined' ? start : -howMany;

  var clone = this.clone();
  var x;
  var y;
  var z;

  switch(axis) {
    case 'x':
      this.body.splice(start, howMany);
      break;

    case 'y':
      for(x in clone.body) {
        this.body[x].splice(start, howMany);
      }
      break;

    case 'z':
      for(x in clone.body) {
        for(y in clone.body[x]) {
          this.body[x][y].splice(start, howMany);
        }
      }
      break;
  }

  this.update();
  // console.log('sliced');
};

Matrix.prototype.extend = function(axis, extension) {
  var x;
  var y;

  switch(axis) {
    case 'x':
      this.body = this.body.concat(extension.body);
      break;

    case 'y':
      for(x in clone.body) {
        this.body[x] = this.body[x].concat(extension.body[x]);
      }
      break;

    case 'z':
      for(x in clone.body) {
        for(y in clone.body[x]) {
          this.body[x][y] = this.body[x][y].concat(extension.body[x][y]);
        }
      }
      break;
  }
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

Matrix.prototype.transferTo = function(destMatrix, point, force) {
  point = typeof point !== 'undefined' ? point : new Point();
  force = typeof force !== 'undefined' ? force : false;

  var matrix = this;
  var boundaries = matrix.boundaries;

  matrix.iterate(function(m, x, y, z, p) {
    var _x = p.x + x;
    var _y = p.y + y;
    var _z = p.z + z;
    var _p = new Point(_x, _y, _z);

    if(destMatrix.contains(_p)) {
      var srcPoint = new Point(x, y, z);
      var cell = m.val(srcPoint);

      if(
        force === true ||
        (force === false && cell.type !== 'void')
      ) {
        var clone = cell.clone();
        destMatrix.val(_p, clone);
      }
    }
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

Matrix.prototype.clone = function(deep) {
  deep = typeof deep !== 'undefined' ? deep : true;

  this.update();

  var clone = new Matrix( new Boundaries(
    this.boundaries.x,
    this.boundaries.y,
    this.boundaries.z
  ));

  if(deep) this.transferTo(clone);

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

  var boundaries = Room.gen.boundaries(size);
  this.matrix = Room.gen.matrix(id, boundaries, shape);
}

Room.gen = {
  matrix: function(id, boundaries, shape) {
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

Room.prototype.clone = function(id) {
  var clone = new Room(id, this.size, this.shape);

  clone.matrix = Room.gen.matrix(id, this.matrix.boundaries, this.shape);

  return clone;
};
function Builder(engineer, job, jobCondition, options) {
  'use strict';

  job = typeof job !== 'undefined' ? job : Builder.defaults.job;
  jobCondition = typeof jobCondition !== 'undefined' ? jobCondition : Builder.defaults.jobCondition;

  options = typeof options !== 'undefined' ? options : {};
  options.type = typeof options.type !== 'undefined' ? options.type : Builder.defaults.type;
  options.paddings = typeof options.paddings !== 'undefined' ? options.paddings : Builder.defaults.paddings;
  options.life = typeof options.life !== 'undefined' ? options.life : Builder.defaults.life(engineer.tgtMatrix);
  options.width = typeof options.width !== 'undefined' ? options.width : Builder.defaults.width;
  options.dodgy = typeof options.dodgy !== 'undefined' ? options.dodgy : Builder.defaults.dodgy;
  options.chanceToTurn = typeof options.chanceToTurn !== 'undefined' ? options.chanceToTurn : Builder.defaults.chanceToTurn;
  options.chanceToSpawn = typeof options.chanceToSpawn !== 'undefined' ? options.chanceToSpawn : Builder.defaults.chanceToSpawn;
  
  this.engineer = engineer;
  this.id = engineer.buildersCount;
  this.tgtMatrix = engineer.tgtMatrix;
  this.isAlive = true;
  this.options = options;

  options.startingPos = typeof options.startingPos !== 'undefined' ? options.startingPos : Builder.defaults.startingPos(this);
  this.options.startingPos = options.startingPos;
  this.pos = options.startingPos;

  options.startingDir = typeof options.startingDir !== 'undefined' ? options.startingDir : Builder.defaults.startingDir(this);
  this.options.startingDir = options.startingDir;
  this.direction = options.startingDir;

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

    return Tool.randPos([paddings, tgtMatrix.boundaries.x - paddings - 1], [paddings, tgtMatrix.boundaries.y - paddings - 1], [0, 0]);
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
  if(this.isAlive) {
    this.options.life--;

    if(this.options.life <= 0) {
      // console.log('died of old age');
      this.die();
    }
  }
};

Builder.prototype.die = function() {
  this.isAlive = false;
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

  if(this.isAlive) {
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

  this.pos = this.pos[newDirection](this.options.width);
  this.job(this);
  this.pos = this.pos[newDirection](this.options.width);
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

  if(this.isAlive) {
    this.engineer.addBuilder(type, options);
    // console.log('spawned');
  }
};

Builder.prototype.mayDo = function(chanceToDo, task, otherwise) {
  if(this.isAlive && Tool.randPercent() <= chanceToDo) {
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

function Cleaner(engineer, options) {
  'use strict';

  options = typeof options !== 'undefined' ? options : {};
  options.type = 'Cleaner';
  
  if(typeof options.tgtId === 'undefined') {
    console.error('Cleaner declared without tgtId');
  }

  if(typeof options.tgtList === 'undefined') {
    console.error('Cleaner declared without tgtList');
  }

  Builder.call(this, engineer, Cleaner.job, Cleaner.jobCondition, options);

  this.tgtId = this.options.tgtId;
  this.tgtList = this.options.tgtList;
} 

Cleaner.prototype = Object.create(Builder.prototype);
Cleaner.prototype.constructor = Cleaner;

Cleaner.prototype.work = function() {
  if(this.jobCondition(this)) {
    this.job(this);
    this.moveOrTurn();
  } else {
    this.die();
  }
};

Cleaner.job = function(cleaner) {
  var tgtMatrix = cleaner.tgtMatrix;
  var pos = cleaner.pos;
  var width = cleaner.options.width;
  var cleanArea = new Matrix(new Boundaries(width, width, 1));

  cleanArea.transferTo(tgtMatrix, pos.toTopLeft(cleanArea), true);
  // console.log('cleaned');
};

Cleaner.jobCondition = function(cleaner) {
  if(cleaner.isAlive) {
    var tgtMatrix = cleaner.tgtMatrix;
    var tgtList = cleaner.tgtList;
    var tgtId = cleaner.tgtId;
    var width = cleaner.options.width;
    var radius = Math.ceil(width / 2);
    var pos = cleaner.pos;
    var connectionsSelf = 0;
    var connectionsOthers = 0;

    if(tgtList.length > 0) {
      var parallels;
      parallels = pos.parallels(radius, width);

      for(var p in parallels) {
        if(tgtMatrix.contains(parallels[p])) {
          var cell = tgtMatrix.val(parallels[p]);

          if(cell.type === 'corridor' && cell.id === tgtId) {
            connectionsSelf++;
          } else if(cell.type !== 'void') {
            connectionsOthers++;
          } 
        }
      }
    } else {
      return false;
    }

    if(connectionsSelf >= width * 2 || tgtList.length > 1 && connectionsOthers >= 1 || tgtList.length === 1 && connectionsOthers >= 2) return false; else return true;
  }
};

Cleaner.prototype.moveOrTurn = function() {
  this.tgtList.splice(0, 1);

  var tgtList = this.tgtList;

  if(this.tgtList.length > 0) {
    this.pos = tgtList[0];
  } else {
    this.die();
  }
}

function Connector(engineer, options) {
  'use strict';

  options = typeof options !== 'undefined' ? options : {};
  options.type = 'Connector';
  options.life = typeof options.life !== 'undefined' ? options.life : Connector.defaults.life;
  options.width = typeof options.width !== 'undefined' ? options.width : Connector.defaults.width;
  options.startingDir = typeof options.startingDir !== 'undefined' ? options.startingDir : Connector.defaults.startingDir();
  options.chanceToSpawn = 0;

  Builder.call(this, engineer, Connector.job, Connector.jobCondition, options);

  this.originId = options.originId;
  this.path = [];
  this.corridor = Tunneler.genCorridor(this);
  this.isConnected = false;
}

Connector.defaults = {
  width: 1,
  life: 10,
  startingDir: function() {
    return Tool.randDirection();
  }
};

Connector.prototype = Object.create(Builder.prototype);
Connector.prototype.constructor = Connector;

Connector.job = function(connector) {
  var tgtMatrix = connector.tgtMatrix;
  var pos = connector.pos;

  connector.path.push(pos);
};

Connector.jobCondition = function(connector, pos, direction) {
  if(this.isAlive) {
    var tgtMatrix = connector.tgtMatrix;
    var pos = connector.pos;
    var cell;

    if(tgtMatrix.contains(pos)) {
      cell = tgtMatrix.val(pos);

      if(cell.type === 'void' || cell.type === 'room' && cell.id === this.originId) {
        return true;
      } else if(cell.type === 'room' && cell.id !== this.originId) {
        this.isConnected = true;
      }
    }
  }
  
  return false;
};

Connector.prototype.die = (function(_super) {
  return function() {
    var tgtMatrix = this.tgtMatrix;
    var path = this.path;
    var corridor = this.corridor;
    var pos;
    var cell;

    if(path.length > 0 && this.isConnected) {
      for(var p in path) {
        pos = path[p];
        cell = tgtMatrix.val(pos);

        if(cell.type === 'void') {
          corridor.transferTo(tgtMatrix, pos.toTopLeft(corridor));
        }
      }
    }
    _super.call(this);
  };
})(Connector.prototype.die);

function Roomer(engineer, options) {
  'use strict';

  options = typeof options !== 'undefined' ? options : {};
  options.type = 'Roomer';

  Builder.call(this, engineer, Roomer.job, Roomer.jobCondition, options);
} 

Roomer.prototype = Object.create(Builder.prototype);
Roomer.prototype.constructor = Roomer;

Roomer.prototype.work = function() {
  if(this.engineer.blueprints.length > 0) {
    this.room = Roomer.genRoom(this);

    if(this.jobCondition(this)) {
      this.job(this);
    }
  }
  
  this.die();
};

Roomer.genRoom = function(roomer) {
  var id = roomer.id;
  var size = roomer.engineer.blueprints[0];

  return new Room(id, size, 'rectangle'); //CHANGE SHAPE
};

Roomer.job = function(roomer) {
  var room = roomer.room;
  var engineer = roomer.engineer;
  var pos = roomer.pos;
  var roomPos = roomer.roomPlacementPos();

  roomer.buildEntrance(pos);
  engineer.placeRoom(room, roomPos);
};

Roomer.jobCondition = function(roomer) {
  var _pos = roomer.roomPlacementPos();

  return roomer.tgtMatrix.checkPlacement(roomer.room.matrix, _pos);
};

Roomer.prototype.roomPlacementPos = function() {
  var room = this.room;
  var _pos = this.pos.toTopLeft(room.matrix);
  var direction = this.direction;
  var pAxis = this.primaryAxis;

  _pos = _pos[direction](room.matrix.center[pAxis] + 1);

  return _pos;
};

Roomer.prototype.buildEntrance = function(pos) {
  var sAxis = this.secondaryAxis;
  var sAxisLength = this.room.matrix.boundaries[sAxis];
  var maxEntrances = (sAxisLength  - 1) / 2;
  var entranceCount = Tool.randRange(1, maxEntrances);

  var entrancePos = this.entrancePlacementPos(pos);

  while(entranceCount > 0 && entrancePos.length > 0) {
    var selectedPos = Tool.randAttr(entrancePos);
    var index = entrancePos.indexOf(selectedPos);

    this.tgtMatrix.val(selectedPos, new Entrance(this.id, {
      furniture: ['Door']//change to object
    }));

    var _index = index;
    var exclude = 1;

    if(typeof entrancePos[index - 1] !== 'undefined') {
      _index--;
      exclude++;
    }

    if(typeof entrancePos[index + 1] !== 'undefined') {
      exclude++;
    }
    
    entrancePos.splice(_index, exclude);
    entranceCount--;
  }
};

Roomer.prototype.entrancePlacementPos = function(pos) {
  var tgtMatrix = this.tgtMatrix;
  var reverseDir = this.reverseDirection();
  var secondaryAxis = this.secondaryAxis;
  var sAxisLength = this.room.matrix.boundaries[secondaryAxis];
  var radius = Math.floor(sAxisLength / 2);

  var entrancePos = pos.inAxis(secondaryAxis, radius);

  var cell;
  for(var e = entrancePos.length - 1; e >= 0; e--) {
    cell = tgtMatrix.val(entrancePos[e][reverseDir]());

    if(cell.type !== 'corridor') {
      entrancePos.splice(e, 1);
    }
  }

  return entrancePos;
};

function Tunneler(engineer, options) {
  'use strict';

  options = typeof options !== 'undefined' ? options : {};
  options.type = 'Tunneler';
  options.width = typeof options.width !== 'undefined' ? options.width : Tunneler.defaults.width();
  
  Builder.call(this, engineer, Tunneler.job, Tunneler.jobCondition, options);

  this.history = [];
  this.corridor = Tunneler.genCorridor(this);
  this.blockedDirections = [];
}

Tunneler.defaults = {
  width: function() {
    return Tool.weightedRandAttr([1, 3], [70, 30]);
  }
};

Tunneler.prototype = Object.create(Builder.prototype);
Tunneler.prototype.constructor = Tunneler;

Tunneler.prototype.possibleDirections = (function(_super) {
  return function(pos, excludeCurrentAndReverse) {
    var pDirections = _super.call(this, pos, excludeCurrentAndReverse);
    var bDirections = this.blockedDirections;
    var index;

    for(var bDir in bDirections) {
      index = pDirections.indexOf(bDirections[bDir]);

      if(index !== -1) {
        pDirections.splice(index, 1);
      }
    }

    return pDirections;
  } 
})(Tunneler.prototype.possibleDirections);

Tunneler.prototype.moveOrTurn = (function(_super) {
  return function() {
    _super.call(this);
    this.blockedDirections = [];
  }
})(Tunneler.prototype.moveOrTurn);

Tunneler.genCorridor = function(tunneler) {
  var id = tunneler.id;
  var width = tunneler.options.width;
  var boundaries = new Boundaries(width, width, 1);
  var corridor = new Matrix(boundaries);

  corridor.fill(function() {
    return new Corridor(id);
  });
  
  return corridor;
};

Tunneler.prototype.spawn = function() {
  if(this.isAlive && this.engineer.blueprints.length > 0) {
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
          this.engineer.addTunneler({startingPos: this.pos[direction](offset), startingDir: direction});
          break;

        case 'Roomer':
          this.engineer.addRoomer({startingPos: this.pos[direction](offset), startingDir: direction});
          break;
      }
      this.blockedDirections.push(direction);
      // console.log('spawned');
    }
  }
};


Tunneler.job = function(tunneler) {
  var corridor = tunneler.corridor;
  var pos = tunneler.pos;
  var tgtMatrix = tunneler.tgtMatrix;

  // if(tunneler.history.length === 0) {//debug
  //   var m = new Matrix(new Boundaries());
  //   m.val(new Point(), new Cell(tunneler.id, 'corridor', {tile: 'S'}));
  //   m.transferTo(tgtMatrix, pos);
  // } else {
    corridor.transferTo(tgtMatrix, pos.toTopLeft(corridor));
  // }
  tunneler.history.push(pos);
};

Tunneler.jobCondition = function(tunneler, pos, direction) {
  var tgtMatrix = tunneler.tgtMatrix;
  var width = Math.ceil(tunneler.options.width / 2);
  
  var sAxis = Tool.dirToAxis(direction);
  var poses = pos.parallelsInAxis(sAxis, width, tunneler.options.width);

  var cell;
  for(var p in poses) {
    if(tunneler.tgtMatrix.contains(poses[p])) {
      cell = tgtMatrix.val(poses[p]);

      if(cell.type !== 'void') {
        // console.log('sides invalid');
        return false;
      }
    } else {
      // console.log('not contained in matrix');
      return false;
    }
  }

  cell = tgtMatrix.val(pos[direction]());

  if(cell.type !== 'void' && cell.type !== 'corridor') {
    // console.log('front invalid');
    return false;
  }

  return true;
};

Tunneler.prototype.die = function() {
  this.isAlive = false;

  this.engineer.addCleaner({startingPos: this.history[0], startingDir: this.options.startingDir, width: this.options.width, tgtId: this.id, tgtList: this.history});

  if(this.history.length > 0) {
    var rHistory = this.history.slice(0);
    rHistory.reverse();

    this.engineer.addCleaner({startingPos: rHistory[0], startingDir: this.reverseDirection(), width: this.options.width, tgtId: this.id, tgtList: rHistory});
  }

};
function ShipEngineer(ship) {
  'use strict';

  this.ship = ship;
  this.buildersCount = 0;
  this.generation = 0;
  this.builders = {
    current: [],
    stash: [],
    dormants: []
  };  
}

ShipEngineer.prototype.addBuilder = function(type, options) {
  var builders = this.builders;
  var builder = new window[type](this, options);

  if(this.builders.current.length === 0) {
    builders.current.push(builder);
  } else {
    builders.stash.push(builder);
  }
  
  this.buildersCount++;
};

ShipEngineer.prototype.addDormant = function(type, options) {
  var dormants = this.builders.dormants;

  var _final = new window[type](this, options);
  
  if(dormants.length === 0) dormants.push([]);

  dormants[dormants.length - 1].push(_final);

  this.buildersCount++;
};

ShipEngineer.prototype.addTunneler = function(options) {
  options = typeof options !== 'undefined' ? options : {};
  options.paddings = typeof options.paddings !== 'undefined' ? options.paddings : this.tgtMatrix.paddings;

  this.addBuilder('Tunneler', options);
};

ShipEngineer.prototype.addRoomer = function(options) {
  options = typeof options !== 'undefined' ? options : {};
  options.paddings = typeof options.paddings !== 'undefined' ? options.paddings : this.tgtMatrix.paddings;

  this.addBuilder('Roomer', options);
};

ShipEngineer.prototype.addCleaner = function(options) {
  this.addDormant('Cleaner', options);
};

ShipEngineer.prototype.addConnector = function(options) {
  options = typeof options !== 'undefined' ? options : {};
  options.connectorMaxLength = typeof options.connectorMaxLength !== 'undefined' ? options.connectorMaxLength : Ship.gen.params.connectorMaxLength;

  this.addBuilder('Connector', options);
};

ShipEngineer.prototype.recycle = function() {
  var current = this.builders.current;
  var stash = this.builders.stash;

  for(var b = current.length - 1; b >= 0; b--) {
    if(current[b].isAlive === false) {
      current.splice(b, 1);
    }
  }

  if(current.length === 0 && stash.length > 0) {
    this.builders.current = stash;
    this.builders.stash = [];

    this.builders.dormants.push([]);
    
    // console.log('end of generation');
    this.generation++;
  }
};

ShipEngineer.prototype.recycleDormants = function() {
  var dormants = this.builders.dormants;
  var currentDormants = dormants[dormants.length - 1];

  for(var cF = currentDormants.length - 1; cF >= 0; cF--) {
    if(currentDormants[cF].isAlive === false) {
      currentDormants.splice(cF, 1);
    }
  }

  dormants[dormants.length - 1] = currentDormants;

  if(currentDormants.length === 0) {
    dormants.splice(dormants.length - 1, 1);
  }

  this.builders.dormants = dormants;
};

ShipEngineer.prototype.build = function() {
  var builders = this.builders;

  // console.log('started building');

  while(builders.current.length > 0) {
    for(var b in builders.current) {
      builders.current[b].work();
    }
    this.recycle();
  }

  // console.log('stopped building');
};

ShipEngineer.prototype.wakeDormants = function() {
  var dormants = this.builders.dormants;

  // console.log('started finalizing');
  
  while(dormants.length > 0) {
    var currentDormants = dormants[dormants.length - 1];
    for(var f in currentDormants) {
      currentDormants[f].work();
    }
    this.recycleDormants();
  }

  // console.log('stopped finalizing');
};

ShipEngineer.prototype.placeRoom = function(room, point) {
  var ship = this.ship;
  var srcMatrix = room.matrix;
  var destMatrix = ship.matrix;

  this.discartBlueprint();
  srcMatrix.transferTo(destMatrix, point);
  this.logRoom(room);
  // console.log('placed at ' + point.x + ' ' + point.y + ' ' + point.z);
};

ShipEngineer.prototype.logRoom = function(room, point) {
  var ship = this.ship;

  var log = {
    id: room.id,
    pos: point,
    room: room
  };

  ship.rooms.push(log);
};

ShipEngineer.prototype.discartBlueprint = function() {
  this.blueprints.splice(0, 1);
};

ShipEngineer.prototype.seedShip = function() {
  var ship = this.ship;

  var simmetry = Tool.randAttr(['noSimmetry', 'x', 'y', 'z', 'xy', 'xz', 'yz', 'xyz']); //make dynamic and relative to faction
  var placement = 'clustered'; //make dynamic and relative to faction

  this.genBlueprints();

  ship.rooms = [];
  ship.matrix = this.genMatrix();
  this.addTunneler({startingPos: ship.matrix.center});
  this.build();
};

ShipEngineer.prototype.applySimmetry = function(simmetry) {
  switch(simmetry) {

  }
};

ShipEngineer.prototype.seedConnectors = function() {
  var rooms = this.ship.rooms;
  var roomLog;
  var id;
  var boundaries;
  var pos;
  var cPos;
  var cCount;

  for(var r in rooms) {
    roomLog = rooms[r];
    boundaries = roomLog.room.matrix.boundaries;
    pos = roomLog.pos;
    cPos = Tool.randPos(
      [pos.x, pos.x + boundaries.x - 1],
      [pos.y, pos.y + boundaries.y - 1],
      [pos.z, pos.z + boundaries.z - 1]
    );

    cCount = Ship.gen.params.connectorsPerRoom();

    for(cCount; cCount > 0; cCount--) {
      this.addConnector({startingPos: cPos, originId: roomLog.id});
    }
  }

  this.build();
};

ShipEngineer.prototype.assembleHull = function(thickness) {
  thickness = typeof thickness !== 'undefined' ? thickness : 2;

  var ship = this.ship;
  var tgtMatrix = this.tgtMatrix;
  var clone = tgtMatrix.clone();

  clone.fill(function(m, x, y, z) {
    var pos = new Point(x, y, z);
    var cell = m.val(pos);
    if(cell.type !== 'void') {
      return new Hull();
    } else {
      return false;
    }
  });

  clone.expand(thickness);
  tgtMatrix.transferTo(clone, new Point(thickness, thickness));

  tgtMatrix.body = clone.body;
  tgtMatrix.update();
  this.updateRooms();
};

ShipEngineer.prototype.genMatrix = function() {
  var ship = this.ship;
  var roomCount = this.blueprints.length;
  if(roomCount%2 === 0) roomCount++;

  var boundaries = new Boundaries(
    roomCount * Ship.gen.params.sizeFactor,
    roomCount * Ship.gen.params.sizeFactor,
    21
  );

  var matrix = new Matrix(boundaries, Ship.gen.params.roomPaddings);
  matrix.flatten(); //change to enable 3D placement

  this.tgtMatrix = matrix;

  return matrix;
};

ShipEngineer.prototype.genBlueprints = function() {
  var size = this.ship.size;
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

  this.blueprints = blueprints;
};

ShipEngineer.prototype.updateRooms = function() {
  var tgtMatrix = this.ship.matrix;
  var rooms = this.ship.rooms;
  var update = function(m, x, y, z, r) {
    var pos = new Point(x, y, z);
    var cell = m.val(pos);
    
    if(cell.id === rooms[r].id && cell.type === 'room') {
      rooms[r].pos = pos;
      return 'break';
    }
  };

  for(var r in rooms) {
    tgtMatrix.iterate(update,r);
  }
  // console.log(rooms);
  this.ship.rooms = rooms;
};

ShipEngineer.prototype.clean = function() {
  var tgtMatrix = this.ship.matrix;

  this.wakeDormants();
  tgtMatrix.flatten(); // change for 3D
  tgtMatrix.trim();

  this.updateRooms();
};

ShipEngineer.prototype.mirrorShip = function(axis, offset) {
  axis = typeof axis !== 'undefined' ? axis : 'x';
  offset = typeof offset !== 'undefined' ? offset : 0;

  var tgtMatrix = this.ship.matrix;
  var rooms = this.ship.rooms;
  var idOffset = rooms[rooms.length - 1].id;
  var mirror;

  tgtMatrix.trim();

  if(offset > 0) {
    tgtMatrix.slice(axis, -offset, offset);
    this.updateRooms();
  }

  mirror = tgtMatrix.clone(false);

  var id;
  var room;
  var pos;

  for(var r in rooms) {
    id = rooms[r].id + idOffset;
    pos = rooms[r].pos;
    room = rooms[r].room.clone(id);
    this.logRoom(room, pos);

    room.matrix.transferTo(mirror, pos);
  }

  mirror.flip(axis);

  var transferPos;
  var boundaries = tgtMatrix.boundaries;

  switch(axis) {
    case 'x':
      transferPos = new Point(boundaries.x, 0, 0);
      break;

    case 'y':
      transferPos = new Point(0, boundaries.y, 0);
      break;

    case 'z':
      transferPos = new Point(0, 0, boundaries.z);
      break;
  }

  tgtMatrix.mirror(axis);
  mirror.transferTo(tgtMatrix, transferPos);

  this.updateRooms();
  // console.log('mirrored Ship');
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
    connectorMaxLength: 10,
    connectorsPerRoom: function() {
      return Tool.randRange(3, 5);
    }
  }
};

Ship.prototype.build = function() {
  window.ship = this; //DEBUG MODE
  var sEngineer = new ShipEngineer(this);
  window.sEngineer = sEngineer; //DEBUG MODE

  if(Tool.debugMode !== true) {
    do {
      Main.seed.reset();
      sEngineer.seedShip();
    } while(sEngineer.blueprints.length > 0);

    sEngineer.clean();
    sEngineer.mirrorShip('x', 0);

    sEngineer.seedConnectors();
    sEngineer.assembleHull();
  } else { //DEBUG MODE
    var simmetry = Tool.randAttr(['noSimmetry', 'x', 'y', 'z', 'xy', 'xz', 'yz', 'xyz']); //make dynamic and relative to faction
    var placement = 'clustered'; //make dynamic and relative to faction
    sEngineer.genBlueprints();

    sEngineer.ship.rooms = [];
    sEngineer.ship.matrix = sEngineer.genMatrix();

    sEngineer.addTunneler({startingPos: ship.matrix.center});

    var i = setInterval(function() {
      var builders = sEngineer.builders;

      if(builders.current.length > 0) {
        for(var b in builders.current) {
          builders.current[b].work();
        }
        sEngineer.recycle();
      } else {
        clearInterval(i);
        console.log('stopped building');

        var j = setInterval(function() {
          var dormants = sEngineer.builders.dormants;

          if(dormants.length > 0) {
            var currentDormants = dormants[dormants.length - 1];
            for(var f in currentDormants) {
              currentDormants[f].work();
            }
            sEngineer.recycleDormants();
          } else {
            clearInterval(j);
            console.log('stopped finalizing');
            // sEngineer.clean();
          }
        }, 200);
        console.log('started finalizing');
      }
    }, 200);
    console.log('started building');
  }
};

function Main() {
  'use strict';
}

Main.setup = function() {
  Main.seed = new Seed();
  // console.log(Main.seed.val);
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