function Hull(id, entities) {
  'use strict';
  
  entities = typeof entities !== 'undefined' ? entities : {};
  entities.tile = 'wall-c';

  Cell.call(this, id, 'hull', entities);
}

Hull.prototype = Object.create(Cell.prototype);
Hull.prototype.constructor = Hull;
