export default class Entrance {
  constructor(tag, layers): void {}

  
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

orientation(matrix, pos) {
  let orientation;

  let up = matrix.val(pos.up());
  let connectedUp = false;
  if(typeof up !== 'undefined' && (up.type === 'room' || up.type === 'corridor')) {
    connectedUp = true;
  }

  let right = matrix.val(pos.right());
  let connectedRight = false;
  if(typeof right !== 'undefined' && (right.type === 'room' || right.type === 'corridor')) {
    connectedRight = true;
  }

  let down = matrix.val(pos.down());
  let connectedDown = false;
  if(typeof down !== 'undefined' && (down.type === 'room' || down.type === 'corridor')) {
    connectedDown = true;
  }

  let left = matrix.val(pos.left());
  let connectedLeft = false;
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
