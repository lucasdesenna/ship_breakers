function Cell(id, type, layers) {
  'use strict';

  id = typeof id !== 'undefined' ? id : Cell.defaults.id;
  type = typeof type !== 'undefined' ? type : Cell.defaults.type;
  layers = typeof layers !== 'undefined' ? layers : {};
  layers.tile = typeof layers.tile !== 'undefined' ? layers.tile : Cell.defaults.tile;
  layers.furniture = typeof layers.furniture !== 'undefined' ? layers.furniture : Cell.defaults.furniture;
  layers.itens = typeof layers.itens !== 'undefined' ? layers.itens : Cell.defaults.itens;

  this.id = id;
  this.type = type;
  this.layers = layers;
  
  this.gfx = [];
  this.updateGfx();
}

Cell.defaults = {
  id: 'void',
  type: 'void',
  tile: 'void',
  furniture: undefined,
  itens: []
};

Cell.prototype.updateGfx = function() {
  var layers = this.layers;
  var tile = layers.tile;
  var furniture = layers.furniture;
  var itens = layers.itens;

  var gfx = [];

  gfx.push(tile);

  if(typeof furniture !== 'undefined') gfx.push(furniture.gfx);

  if(itens.length > 0) {
    for(var i in itens) {
      gfx.push(itens[i].gfx);
    }
  }

  this.gfx = gfx;
};

Cell.prototype.clone = function(constructor) {
  constructor = typeof constructor !== 'undefined' ? constructor : Cell;

  var id = this.id;
  var type = this.type;
  var layers = {
    tile: this.layers.tile,
    furniture: this.layers.furniture,
    itens: this.layers.itens,
  };

  var clone;

  if(constructor !== Cell) {
    clone = new constructor(id, layers);
  } else {
    clone = new constructor(id, type, layers);
  }

  return clone;
};
