function Corridor(id, layers) {
  'use strict';
  
  layers = typeof layers !== 'undefined' ? layers : {};
  // layers.tile = 'C'; //debug
  layers.tile = 'floor-c';

  Cell.call(this, id, 'corridor', layers);
}

Corridor.prototype = Object.create(Cell.prototype);
Corridor.prototype.constructor = Corridor;

Corridor.prototype.clone = (function(_super) {
  return function() {
    return _super.call(this, Corridor);
  };
})(Cell.prototype.clone);
