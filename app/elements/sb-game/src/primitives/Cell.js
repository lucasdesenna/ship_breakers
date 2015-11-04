function Cell(wall, floor, isRoom, furniture, itens) {
  'use strict';

  wall = typeof wall !== 'undefined' ? wall : Cell.defaults.wall;
  isRoom = typeof isRoom !== 'undefined' ? isRoom : Cell.defaults.isRoom;
  floor = typeof floor !== 'undefined' ? floor : Cell.defaults.floor;
  furniture = typeof furniture !== 'undefined' ? furniture : Cell.defaults.furniture;
  itens = typeof itens !== 'undefined' ? itens : Cell.defaults.itens;

  this.wall = wall;
  this.floor = floor;
  this.isRoom = isRoom;
  this.furniture = furniture;
  this.itens = itens;
}

Cell.defaults = {
  isRoom: false,
  wall: true,
  floor: true,
  furniture: null,
  itens: []
};
