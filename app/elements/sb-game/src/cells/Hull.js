function Hull(id, layers) {
  'use strict';
  
  layers = typeof layers !== 'undefined' ? layers : {};
  layers.tile = 'wall-c';

  Cell.call(this, id, 'hull', layers);
}

Hull.prototype = Object.create(Cell.prototype);
Hull.prototype.constructor = Hull;

Hull.prototype.clone = (function(_super) {
  return function() {
    return _super.call(this, Hull);
  };
})(Cell.prototype.clone);
