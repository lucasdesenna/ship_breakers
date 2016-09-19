export default class Wall {
  constructor(tag, layers): void {}

  
  layers = typeof layers !== 'undefined' ? layers : {};
  layers.tile = typeof layers.tile !== 'undefined' ? layers.tile : 'Wall-sc-sw';

  Cell.call(this, 'wall', tag, layers);
}

Wall.prototype = Object.create(Cell.prototype);
Wall.prototype.constructor = Wall;

Wall.prototype.clone = (function(_super) {
  return function() {
    return _super.call(this, Wall);
  };
})(Cell.prototype.clone);

orientation(matrix, pos) {
  let cell = matrix.val(pos);
  let orientation;

  let connections = {
    n: matrix.val(pos.up().left()),
    ne: matrix.val(pos.up()),
    e: matrix.val(pos.up().right()),
    se: matrix.val(pos.right()),
    s: matrix.val(pos.down().right()),
    sw: matrix.val(pos.down()),
    w: matrix.val(pos.down().left()),
    nw: matrix.val(pos.left())
  };

  for(let c in connections) {
    if(typeof connections[c] !== 'undefined' && connections[c].type === cell.type) {
      connections[c] = true;
    } else {
      connections[c] = false;
    }
  }

  if(
    // !connections.n &&
    !connections.ne &&
    // !connections.e &&
    connections.se &&
    connections.s &&
    connections.sw &&
    // !connections.w &&
    !connections.nw
  ) {
    orientation = 'n';
  } else if(
    // !connections.n &&
    !connections.ne &&
    // !connections.e &&
    connections.se &&
    connections.s &&
    connections.sw &&
    connections.w &&
    connections.nw
  ) {
    orientation = 'ne';
  } else if(
    // !connections.n &&
    !connections.ne &&
    // !connections.e &&
    !connections.se &&
    // connections.s &&
    connections.sw &&
    connections.w &&
    connections.nw
  ) {
    orientation = 'e';
  } else if(
    connections.n &&
    connections.ne &&
    // !connections.e &&
    !connections.se &&
    // !connections.s &&
    connections.sw &&
    connections.w &&
    connections.nw
  ) {
    orientation = 'se';
  } else if(
    connections.n &&
    connections.ne &&
    // !connections.e &&
    !connections.se &&
    // !connections.s &&
    !connections.sw &&
    // !connections.w &&
    connections.nw
  ) {
    orientation = 's';
  } else if(
    connections.n &&
    connections.ne &&
    connections.e &&
    connections.se &&
    // !connections.s &&
    !connections.sw &&
    // !connections.w &&
    connections.nw
  ) {
    orientation = 'sw';
  }  else if(
    // connections.n &&
    connections.ne &&
    connections.e &&
    connections.se &&
    // !connections.s &&
    !connections.sw &&
    // !connections.w &&
    !connections.nw
  ) {
    orientation = 'w';
  }  else if(
    // connections.n &&
    connections.ne &&
    connections.e &&
    connections.se &&
    connections.s &&
    connections.sw &&
    // !connections.w &&
    !connections.nw
  ) {
    orientation = 'nw';
  } else if(
    !connections.ne &&
    !connections.se &&
    !connections.sw &&
    !connections.nw
  ) {
    orientation = 'island';
  } else {
    orientation = 'island';
  }

  return orientation;
};
