function Corridor(id, entities) {
  'use strict';
  
  entities = typeof entities !== 'undefined' ? entities : {};
  entities.tile = 'C';

  Cell.call(this, id, 'corridor', entities);
}

Corridor.prototype = Object.create(Cell.prototype);
Corridor.prototype.constructor = Corridor;

Corridor.prototype.clone = function() {
  var constructor = this.constructor;

  var entities = {
    tile: this.tile,
    itens: this.itens,
    furniture: this.furniture,
    characters: this.characters
  };

  var clone = new Corridor(this.id, entities);

  return clone;
};
