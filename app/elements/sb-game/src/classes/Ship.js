function Ship(size, shipClass, faction) {
  'use strict';

  size = typeof size !== 'undefined' ? size : Ship.defaults.size;
  shipClass = typeof shipClass !== 'undefined' ? shipClass : Ship.defaults.shipClass;
  faction = typeof faction !== 'undefined' ? faction : Ship.defaults.faction;

  this.name = 'Forgotten Hull';
  this.size = size;
  this.roomCount = Ship.gen.roomCount[size]();
  this.shipClass = shipClass;
  this.faction = faction;
  this.age = null;
  this.integrity = null;
  this.matrix = Ship.genMatrix(this);
  this.rooms = [];

  Ship.populate(this);
}

Ship.defaults = {
  size: 'medium',
  shipClass: 'transport',
  faction: 'faction',
  spawnChances: 20
};

Ship.gen = {
  sizeFactor: 5,
  roomCount: {
    tiny: function() {
      return Tool.randRange(5, 8);
    },

    small: function() {
      return Tool.randRange(10, 15);
    },

    medium: function() {
      return Tool.randRange(20, 30);
    },

    large: function() {
      return Tool.randRange(35, 52);
    },

    veryLarge: function() {
      return Tool.randRange(55, 82);
    },

    huge: function() {
      return Tool.randRange(85, 127);
    }
  },
  roomPaddings: 1
};

Ship.genMatrix = function(ship, shipClass, faction) {
  var boundaries = new Boundaries(
    ship.roomCount * Ship.gen.sizeFactor,
    ship.roomCount * Ship.gen.sizeFactor,
    21
  );

  var matrix = new Matrix(boundaries, Ship.gen.roomPaddings);
  matrix.flatten(); //change to enable 3D placement
  matrix.fill(function() {
    return new Cell();
  });

  return matrix;
};

Ship.prototype.place = function(room, point) {
  var ship = this;
  var srcMatrix = room.matrix;
  var destMatrix = ship.matrix;

  srcMatrix.transferTo(destMatrix, point);
  // console.log('placed at ' + point.x + ' ' + point.y + ' ' + point.z);
};

Ship.prototype.pushRoom = function(room, point) {
  var ship = this;

  var log = {
    room: room,
    at: point
  };

  ship.rooms.push(log);
  ship.place(room, point);
};

Ship.populate = function(ship) {
  var simmetry = 'noSimmetry'; //make dynamic and relative to faction
  var placement = 'clustered'; //make dynamic and relative to faction

  ship.addBuilder('Tunneler');
  // ship.matrix.addBuilder(new Tunneler(ship.matrix));
  // ship.matrix.addBuilder(new Tunneler(ship.matrix));
  ship.build();

  // new Tunneler(ship.matrix);
  // new Tunneler(ship.matrix);
  // new Tunneler(ship.matrix);
  // while(ship.roomCount > ship.rooms.length) {
  //   ShipGen.randRule('roomPlacement.patterns')(ship);
  //   // ShipGen.getRule('roomPlacement.patterns', 'cluster')(ship, rC);
  // }
  
  ship.matrix.flatten();

  //matrix.trim(); fix trim
};

Ship.prototype.addBuilder = function(type) {
  switch(type) {
    case 'Tunneler':
    this.matrix.builderManager.addTunneler();  
  }
};

Ship.prototype.rmBuilder = function(builder) {
  this.matrix.builderManager.rmBuilder(builder);
};

Ship.prototype.build = function() {
  this.matrix.builderManager.build();
};
