function Cell(id, type, entities) {
  'use strict';

  id = typeof id !== 'undefined' ? id : Cell.defaults.id;
  type = typeof type !== 'undefined' ? type : Cell.defaults.type;
  entities = typeof entities !== 'undefined' ? entities : {};
  entities.tile = typeof entities.tile !== 'undefined' ? entities.tile : Cell.defaults.tile;
  entities.itens = typeof entities.itens !== 'undefined' ? entities.itens : [];
  entities.furniture = typeof entities.furniture !== 'undefined' ? entities.furniture : [];
  entities.characters = typeof entities.characters !== 'undefined' ? entities.characters : [];

  this.id = id;
  this.type = type;
  this.tile = entities.tile;
  this.itens = entities.itens;
  this.furniture = entities.furniture;
  this.characters = entities.characters;
}

Cell.defaults = {
  id: 'void',
  type: 'void',
  tile: 'void'
};

Cell.prototype.clone = function() {
  var entities = {
    tile: this.tile,
    itens: this.itens,
    furniture: this.furniture,
    characters: this.characters
  };

  var clone = new Cell(this.id, this.type, entities);

  return clone;
};
