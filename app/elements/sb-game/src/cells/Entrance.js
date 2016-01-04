function Entrance(id, layers) {
  'use strict';
  
  layers = typeof layers !== 'undefined' ? layers : {};
  layers.tile = 'floor-c';
  layers.furniture = new Door();

  Cell.call(this, id, 'entrance', layers);
}

Entrance.prototype = Object.create(Cell.prototype);
Entrance.prototype.constructor = Entrance;

Entrance.prototype.clone = (function(_super) {
  return function() {
    return _super.call(this, Entrance);
  };
})(Cell.prototype.clone);
