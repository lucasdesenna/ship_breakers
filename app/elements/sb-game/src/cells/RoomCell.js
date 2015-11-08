function RoomCell(id, entities) {
  'use strict';

  entities = typeof entities !== 'undefined' ? entities : {};
  entities.tile = 'R';

  Cell.call(this, id, 'room', entities);
}

RoomCell.prototype = Object.create(Cell.prototype);
RoomCell.prototype.constructor = RoomCell;

RoomCell.prototype.clone = function() {
  var constructor = this.constructor;

  var entities = {
    tile: this.tile,
    itens: this.itens,
    furniture: this.furniture,
    characters: this.characters
  }

  var clone = new RoomCell(this.id, entities);

  return clone;
}