function RoomCell(id, layers) {
  'use strict';

  layers = typeof layers !== 'undefined' ? layers : {};
  // layers.tile = 'R'; //debug
  layers.tile = 'floor-c';

  Cell.call(this, id, 'room', layers);
}

RoomCell.prototype = Object.create(Cell.prototype);
RoomCell.prototype.constructor = RoomCell;

RoomCell.prototype.clone = (function(_super) {
  return function() {
    return _super.call(this, RoomCell);
  };
})(Cell.prototype.clone);
