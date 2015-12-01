function Corridor(id, entities) {
  'use strict';
  
  entities = typeof entities !== 'undefined' ? entities : {};
  // entities.tile = 'C'; //debug
  entities.tile = 'floor-c';

  Cell.call(this, id, 'corridor', entities);
}

Corridor.prototype = Object.create(Cell.prototype);
Corridor.prototype.constructor = Corridor;
