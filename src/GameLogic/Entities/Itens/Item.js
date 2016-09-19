export default class Item {
  constructor(type, gfx): void {}


  type = typeof type !== 'undefined' ? type : Item.defaults.type;
  gfx = typeof gfx !== 'undefined' ? gfx : Item.defaults.gfx;

  this.type = type;
  this.gfx = gfx;
}

Item.defaults = {
  type: 'generic-item',
  gfx: 'placeholder-furniture',
};
