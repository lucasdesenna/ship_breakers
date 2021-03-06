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
  }

};
