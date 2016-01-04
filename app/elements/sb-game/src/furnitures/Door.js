function Door(orientation) {  
  var gfx;

  switch(orientation) {
    case 'nEast-sWest':
      gfx = 'door-ne-sw';

    case 'nEast-sWest':
      gfx = 'door-nw-se';

    default:
      gfx = 'door-ne-sw';
  }

  Furniture.call(this, 'door', gfx);
}

Door.prototype = Object.create(Furniture.prototype);
Door.prototype.constructor = Door;
