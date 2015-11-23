function Entrance(id, entities) {
  'use strict';
  
  entities = typeof entities !== 'undefined' ? entities : {};
  // entities.tile = 'E'; //debug
  entities.tile = '.';

  Cell.call(this, id, 'entrance', entities);
}

Entrance.prototype = Object.create(Cell.prototype);
Entrance.prototype.constructor = Entrance;
