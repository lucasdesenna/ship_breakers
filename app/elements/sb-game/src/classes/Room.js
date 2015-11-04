function Room(size, shape) {
  'use strict';

  this.size = size;
  this.shape = shape;
  this.matrix = Room.genMatrix(size, shape);
}

Room.size = {
  medium: function() {
    var boundaries = new Boundaries(
      Tool.randRange(3, 5),
      Tool.randRange(3, 5),
      1
    );

    return boundaries;
  },

  large: function() {
    var boundaries = new Boundaries(
      Tool.randRange(5, 8),
      Tool.randRange(5, 8),
      Tool.randRange(1, 2)
    );

    return boundaries;
  },

  veryLarge: function() {
    var boundaries = new Boundaries(
      Tool.randRange(8, 13),
      Tool.randRange(8, 13),
      Tool.randRange(2, 3)
    );

    return boundaries;
  },

  huge: function() {
    var boundaries = new Boundaries(
      Tool.randRange(13, 21),
      Tool.randRange(13, 21),
      Tool.randRange(3, 5)
    );

    return boundaries;
  }
};

Room.shape = {
  rectangle: function(matrix) {
    matrix.flatten();
    matrix.fill(Room.geometry.cuboid());
  },

  cuboid: function(matrix) {
    matrix.fill(Room.geometry.cuboid());
  },

  ellipse: function(matrix) {
    matrix.flatten();
    matrix.fill(Room.geometry.ellipticCylinder());
  },

  ellipticCylinder: function(matrix) {
    matrix.fill(Room.geometry.ellipticCylinder());
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
};

Room.geometry = {
  cuboid: function() {
    return true;
  },

  ellipticCylinder: function(matrix, x, y) {
    return Math.pow((x + 0.5 - matrix.boundaries.x / 2) / (matrix.boundaries.x / 2), 2) + Math.pow((y + 0.5 - matrix.boundaries.y / 2) / (matrix.boundaries.y / 2), 2) <= 1;
  }
};

Room.prototype.expand = function(radius) {
  return this.matrix.expand(radius);
};

Room.genBoundaries = function(size) {
  var boundaries;
  if(size === 'random') {
    boundaries = Tool.randAttr(Room.size)();
  } else {
    boundaries = Room.size[size]();
  }

  return boundaries;
};

Room.genMatrix = function(size, shape) {
  var boundaries = Room.genBoundaries(size);

  var matrix = new Matrix(boundaries);
  Room.genShape(matrix, shape);

  return matrix;
};

Room.genShape = function(matrix, shape) {
  Room.getRule('shape', shape)(matrix);
};
