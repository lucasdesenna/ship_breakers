function Item(type, gfx) {
  'use strict';

  type = typeof type !== 'undefined' ? type : Item.defaults.type;
  gfx = typeof gfx !== 'undefined' ? gfx : Item.defaults.gfx;

  this.type = type;
  this.gfx = gfx;
}

Item.defaults = {
  type: 'generic-item',
  gfx: 'placeholder-furniture',
};
