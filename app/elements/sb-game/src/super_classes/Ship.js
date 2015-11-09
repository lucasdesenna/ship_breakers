function Ship(size, shipClass, faction) {
  'use strict';

  size = typeof size !== 'undefined' ? size : Ship.defaults.size;
  shipClass = typeof shipClass !== 'undefined' ? shipClass : Ship.defaults.shipClass;
  faction = typeof faction !== 'undefined' ? faction : Ship.defaults.faction;

  this.name = 'Forgotten Hull';
  this.size = size;
  this.shipClass = shipClass;
  this.faction = faction;
  this.age = null;
  this.integrity = null;
  this.blueprints = Ship.gen.blueprints(size);
  this.rooms = [];
  
  this.matrix = Ship.gen.matrix(this);
  this.builderManager = new BuilderManager(this);
  
  this.build();
}

Ship.defaults = {
  size: 'medium',
  shipClass: 'transport',
  faction: 'faction',
  spawnChances: 20
};

Ship.gen = {
  params: {
    sizeFactor: 5,
    roomPaddings: 1,
    corridorsVsRooms: [20, 80],
  },
  blueprints: function(size) {
    var blueprints = [];
    var roomCount;
    var roomChance;

    switch(size) {
      case 'tiny':
        roomCount = Tool.randRange(5, 8);
        roomChance = [75, 25, 0, 0];
        break;

      case 'small':
        roomCount = Tool.randRange(10, 15);
        roomChance = [65, 25, 10, 0];
        break;

      case 'medium':
        roomCount = Tool.randRange(20, 30);
        roomChance = [45, 25, 20, 10];
        break;

      case 'large':
        roomCount = Tool.randRange(35, 52);
        roomChance = [30, 30, 25, 15];
        break;

      case 'huge':
        roomCount = Tool.randRange(55, 82);
        roomChance = [15, 35, 30, 20];
        break;

      case 'colossal':
        roomCount = Tool.randRange(85, 127);
        roomChance = [15, 35, 30, 20];
        break;

      default:
        roomCount = Tool.randRange(5, 8);
        roomChance = [75, 25, 0, 0];
        break;
    }

    for(roomCount; roomCount > 0; roomCount--) {
      blueprints.push(Tool.weightedRandAttr(['small', 'medium', 'large', 'huge'], roomChance));
    }

    return blueprints;
  },
  matrix: function(ship, shipClass, faction) {
    var roomCount = ship.blueprints.length;
    var boundaries = new Boundaries(
      roomCount * Ship.gen.params.sizeFactor,
      roomCount * Ship.gen.params.sizeFactor,
      21
    );

    var matrix = new Matrix(boundaries, Ship.gen.params.roomPaddings);
    matrix.flatten(); //change to enable 3D placement
    
    return matrix;
  }
};

Ship.prototype.build = function() {
  var simmetry = 'noSimmetry'; //make dynamic and relative to faction
  var placement = 'clustered'; //make dynamic and relative to faction

  this.builderManager.addTunneler();
  this.builderManager.build();

  // new Tunneler(ship.matrix);
  // new Tunneler(ship.matrix);
  // new Tunneler(ship.matrix);
  // while(ship.roomCount > ship.rooms.length) {
  //   ShipGen.randRule('roomPlacement.patterns')(ship);
  //   // ShipGen.getRule('roomPlacement.patterns', 'cluster')(ship, rC);
  // }
  
  this.matrix.flatten();

  //matrix.trim(); fix trim
};
