export default class Cell {
  constructor(type, tag, layers): void {}


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

updateGfx() {
  let layers = this.layers;
  let tile = layers.tile;
  let furniture = layers.furniture;
  let itens = layers.itens;

  let gfx = [];

  gfx.push(tile);

  if(typeof furniture !== 'undefined') gfx.push(furniture.gfx);

  if(itens.length > 0) {
    for(let i in itens) {
      gfx.push(itens[i].gfx);
    }
  }

  this.gfx = gfx;
};

clone(constructor) {
  constructor = typeof constructor !== 'undefined' ? constructor : Cell;

  let tag = this.tag;
  let type = this.type;
  let layers = {
    tile: this.layers.tile,
    furniture: this.layers.furniture,
    itens: this.layers.itens,
  };

  let clone;

  if(constructor !== Cell) {
    clone = new constructor(tag, layers);
  } else {
    clone = new Cell(type, tag, layers);
  }

  return clone;
};

orientation() {
  return 'center';
};
