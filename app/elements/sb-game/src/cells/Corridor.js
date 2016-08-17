function Corridor(tag, layers) {
  'use strict';
  
  layers = typeof layers !== 'undefined' ? layers : {};
  layers.tile = typeof layers.tile !== 'undefined' ? layers.tile : 'Corridor-sc-sw';

  Cell.call(this, 'corridor', tag, layers);
}

Corridor.prototype = Object.create(Cell.prototype);
Corridor.prototype.constructor = Corridor;

Corridor.prototype.clone = (function(_super) {
  return function() {
    return _super.call(this, Corridor);
  };
})(Cell.prototype.clone);

Corridor.prototype.orientation = function(matrix, pos) {
  return 'center';
};
