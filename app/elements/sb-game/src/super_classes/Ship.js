function Ship(options) {
  'use strict';

  this.initDefaultOptions();
  this.applyOptions(options);
  this.buildShip();
}

Ship.prototype.initDefaultOptions = function() {
  this.name = null;
  this.size = 'medium';
  this.shipClass = 'transport';
  this.faction = null;
  this.age = null;
  this.integrity = null;
  this.matrix = null;
  this.buildOptions = {
    spawnChances: 20,
    sizeFactor: 5,
    roomPaddings: 1,
    simmetry: Tool.randAttr(['noSimmetry', 'x', 'y', 'z', 'xy', 'xz', 'yz', 'xyz']),
    roomPlacementLogic: 'clustered',
    corridorsVsRooms: [20, 80],
    connectorMaxLength: 10,
    connectorsPerRoom: function() {
      return Tool.randRange(3, 5);
    }
  };
};

Ship.prototype.applyOptions = function(options) {
  for(var o in options) {
    this[o] = options[o];
  }
};

Ship.prototype.generateShip = function() {
  var sEngineer = new ShipEngineer(this.matrix, this.buildOptions);

  do {
    sEngineer.seedShip();
  } while(sEngineer.blueprints.length > 0);

  sEngineer.clean();
  sEngineer.mirrorShip('x', 0);
  sEngineer.seedConnectors();
  sEngineer.buildWalls();
  sEngineer.paintTiles();
};
