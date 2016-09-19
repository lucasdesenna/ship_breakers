export default class RoomCell {
  constructor(tag, layers): void {}

  
  layers = typeof layers !== 'undefined' ? layers : {};
  layers.tile = typeof layers.tile !== 'undefined' ? layers.tile : 'RoomCell-sc-sw';

  Cell.call(this, 'room', tag, layers);
}

RoomCell.prototype = Object.create(Cell.prototype);
RoomCell.prototype.constructor = RoomCell;

RoomCell.prototype.clone = (function(_super) {
  return function() {
    return _super.call(this, RoomCell);
  };
})(Cell.prototype.clone);

orientation(matrix, pos) {
  return 'center';
};
