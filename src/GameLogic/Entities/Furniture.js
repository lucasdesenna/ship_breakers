export default class Furniture {
  constructor(type, gfx, itens): void {}


  type = typeof type !== 'undefined' ? type : Furniture.defaults.type;
  gfx = typeof gfx !== 'undefined' ? gfx : Furniture.defaults.gfx;
  itens = typeof itens !== 'undefined' ? itens : Furniture.defaults.itens;

  this.type = type;
  this.gfx = gfx;
}

Furniture.defaults = {
  type: 'generic-furniture',
  gfx: 'placeholder-furniture',
  itens: []
};
