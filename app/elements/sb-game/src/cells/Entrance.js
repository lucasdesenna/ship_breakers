function Entrance(tag, layers) {
  'use strict';
  
  layers = typeof layers !== 'undefined' ? layers : {};
  layers.furniture = typeof layers.furniture !== 'undefined' ? layers.furniture : new Door();

  Cell.call(this, 'entrance', tag, layers);
}

Entrance.prototype = Object.create(Cell.prototype);
Entrance.prototype.constructor = Entrance;

Entrance.prototype.clone = (function(_super) {
  return function() {
    return _super.call(this, Entrance);
  };
})(Cell.prototype.clone);

Entrance.prototype.orientation = function(matrix, pos) {
  var orientation;

  var up = matrix.val(pos.up());
  var connectedUp = false;
  if(typeof up !== 'undefined' && (up.type === 'room' || up.type === 'corridor')) {
    connectedUp = true;
  }

  var right = matrix.val(pos.right());
  var connectedRight = false;
  if(typeof right !== 'undefined' && (right.type === 'room' || right.type === 'corridor')) {
    connectedRight = true;
  }

  var down = matrix.val(pos.down());
  var connectedDown = false;
  if(typeof down !== 'undefined' && (down.type === 'room' || down.type === 'corridor')) {
    connectedDown = true;
  }

  var left = matrix.val(pos.left());
  var connectedLeft = false;
  if(typeof left !== 'undefined' && (left.type === 'room' || left.type === 'corridor')) {
    connectedLeft = true;
  }

  if(connectedUp && connectedDown) {
    orientation = 'ne-sw';
  } else if(connectedRight && connectedLeft) {
    orientation = 'nw-se';
  }

  return orientation;
};
