export default class Door {
  constructor(orientation): void {}


  let gfx;

  switch(orientation) {
    case 'x':
      gfx = 'door-open-se';
      break;
    case 'y':
      gfx = 'door-open-sw';
      break;
    default:
      gfx = 'door-open-se';
  }

  Furniture.call(this, 'door', gfx);
}

Door.prototype = Object.create(Furniture.prototype);
Door.prototype.constructor = Door;
