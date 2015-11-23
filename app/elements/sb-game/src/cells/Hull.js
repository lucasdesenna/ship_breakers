function Hull(id, entities) {
  'use strict';
  
  entities = typeof entities !== 'undefined' ? entities : {};
  entities.tile = '#';

  Cell.call(this, id, 'hull', entities);
}

Hull.prototype = Object.create(Cell.prototype);
Hull.prototype.constructor = Hull;
