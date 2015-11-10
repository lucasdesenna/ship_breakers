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

Matrix.prototype.mirror = function(axis, offset) {
  axis = typeof axis !== 'undefined' ? axis : 'x';
  offset = typeof offset !== 'undefined' ? offset : 0;

  var clone;
  var x;
  var y;
  var z;

  if(offset > 0) {
    this.slice(axis, -offset, offset);
  }
  
  clone = this.clone();

  switch(axis) {
    case 'x':
      clone.body.reverse();
      this.body = this.body.concat(clone.body);
      break;

    case 'y':
      for(x in clone.body) {
        clone.body[x].reverse();
        this.body[x] = this.body[x].concat(clone.body[x]);
      }
      break;

    case 'z':
      for(x in clone.body) {
        for(y in clone.body[x]) {
          clone.body[x][y].reverse();
          this.body[x][y] = this.body[x][y].concat(clone.body[x][y]);
        }
      }
      break;
  }

  this.update();
  console.log('mirrored');
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