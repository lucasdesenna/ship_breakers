function Cell(type, tag, layers) {
  'use strict';

  type = typeof type !== 'undefined' ? type : Cell.defaults.type;
  tag = typeof tag !== 'undefined' ? tag : Cell.defaults.tag;
  layers = typeof layers !== 'undefined' ? layers : {};
  layers.tile = typeof layers.tile !== 'undefined' ? layers.tile : Cell.defaults.tile;
  layers.furniture = typeof layers.furniture !== 'undefined' ? layers.furniture : Cell.defaults.furniture;
  layers.itens = typeof layers.itens !== 'undefined' ? layers.itens : Cell.defaults.itens;

  this.type = type;
  this.tag = tag;
  this.layers = layers;
  
  this.gfx = [];
  this.updateGfx();
}

Cell.defaults = {
  type: 'void',
  tag: 'void',
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

  var tag = this.tag;
  var type = this.type;
  var layers = {
    tile: this.layers.tile,
    furniture: this.layers.furniture,
    itens: this.layers.itens,
  };

  var clone;

  if(constructor !== Cell) {
    clone = new constructor(tag, layers);
  } else {
    clone = new Cell(type, tag, layers);
  }

  return clone;
};

Cell.prototype.orientation = function() {
  return 'center';
};
