function ShipEngineer(ship) {
  'use strict';

  this.ship = ship;
  this.buildersCount = 0;
  this.generation = 0;
  this.builders = {
    current: [],
    stash: [],
    dormants: []
  };  
}

ShipEngineer.prototype.addBuilder = function(type, options) {
  var builders = this.builders;
  var builder = new window[type](this, options);

  if(this.builders.current.length === 0) {
    builders.current.push(builder);
  } else {
    builders.stash.push(builder);
  }
  
  this.buildersCount++;
};

ShipEngineer.prototype.addDormant = function(type, options) {
  var dormants = this.builders.dormants;

  var _final = new window[type](this, options);
  
  if(dormants.length === 0) dormants.push([]);

  dormants[dormants.length - 1].push(_final);

  this.buildersCount++;
};

ShipEngineer.prototype.addTunneler = function(options) {
  options = typeof options !== 'undefined' ? options : {};
  options.paddings = typeof options.paddings !== 'undefined' ? options.paddings : this.tgtMatrix.paddings;

  this.addBuilder('Tunneler', options);
};

ShipEngineer.prototype.addRoomer = function(options) {
  options = typeof options !== 'undefined' ? options : {};
  options.paddings = typeof options.paddings !== 'undefined' ? options.paddings : this.tgtMatrix.paddings;

  this.addBuilder('Roomer', options);
};

ShipEngineer.prototype.addCleaner = function(options) {
  this.addDormant('Cleaner', options);
};

ShipEngineer.prototype.addConnector = function(options) {
  options = typeof options !== 'undefined' ? options : {};
  options.connectorMaxLength = typeof options.connectorMaxLength !== 'undefined' ? options.connectorMaxLength : Ship.gen.params.connectorMaxLength;

  this.addBuilder('Connector', options);
};

ShipEngineer.prototype.recycle = function() {
  var current = this.builders.current;
  var stash = this.builders.stash;

  for(var b = current.length - 1; b >= 0; b--) {
    if(current[b].isAlive === false) {
      current.splice(b, 1);
    }
  }

  if(current.length === 0 && stash.length > 0) {
    this.builders.current = stash;
    this.builders.stash = [];

    this.builders.dormants.push([]);
    
    // console.log('end of generation');
    this.generation++;
  }
};

ShipEngineer.prototype.recycleDormants = function() {
  var dormants = this.builders.dormants;
  var currentDormants = dormants[dormants.length - 1];

  for(var cF = currentDormants.length - 1; cF >= 0; cF--) {
    if(currentDormants[cF].isAlive === false) {
      currentDormants.splice(cF, 1);
    }
  }

  dormants[dormants.length - 1] = currentDormants;

  if(currentDormants.length === 0) {
    dormants.splice(dormants.length - 1, 1);
  }

  this.builders.dormants = dormants;
};

ShipEngineer.prototype.build = function() {
  var builders = this.builders;

  // console.log('started building');

  while(builders.current.length > 0) {
    for(var b in builders.current) {
      builders.current[b].work();
    }
    this.recycle();
  }

  // console.log('stopped building');
};

ShipEngineer.prototype.wakeDormants = function() {
  var dormants = this.builders.dormants;

  // console.log('started finalizing');
  
  while(dormants.length > 0) {
    var currentDormants = dormants[dormants.length - 1];
    for(var f in currentDormants) {
      currentDormants[f].work();
    }
    this.recycleDormants();
  }

  // console.log('stopped finalizing');
};

ShipEngineer.prototype.placeRoom = function(room, point) {
  var ship = this.ship;
  var srcMatrix = room.matrix;
  var destMatrix = ship.matrix;

  this.discartBlueprint();
  srcMatrix.transferTo(destMatrix, point);
  this.logRoom(room);
  // console.log('placed at ' + point.x + ' ' + point.y + ' ' + point.z);
};

ShipEngineer.prototype.logRoom = function(room, point) {
  var ship = this.ship;

  var log = {
    id: room.id,
    pos: point,
    room: room
  };

  ship.rooms.push(log);
};

ShipEngineer.prototype.discartBlueprint = function() {
  this.blueprints.splice(0, 1);
};

ShipEngineer.prototype.seedShip = function() {
  var ship = this.ship;

  var simmetry = Tool.randAttr(['noSimmetry', 'x', 'y', 'z', 'xy', 'xz', 'yz', 'xyz']); //make dynamic and relative to faction
  var placement = 'clustered'; //make dynamic and relative to faction

  this.genBlueprints();

  ship.rooms = [];
  ship.matrix = this.genMatrix();
  this.addTunneler({startingPos: ship.matrix.center});
  this.build();
};

ShipEngineer.prototype.applySimmetry = function(simmetry) {
  switch(simmetry) {

  }
};

ShipEngineer.prototype.seedConnectors = function() {
  var rooms = this.ship.rooms;
  var roomLog;
  var id;
  var boundaries;
  var pos;
  var cPos;
  var cCount;

  for(var r in rooms) {
    roomLog = rooms[r];
    boundaries = roomLog.room.matrix.boundaries;
    pos = roomLog.pos;
    cPos = Tool.randPos(
      [pos.x, pos.x + boundaries.x - 1],
      [pos.y, pos.y + boundaries.y - 1],
      [pos.z, pos.z + boundaries.z - 1]
    );

    cCount = Ship.gen.params.connectorsPerRoom();

    for(cCount; cCount > 0; cCount--) {
      this.addConnector({startingPos: cPos, originId: roomLog.id});
    }
  }

  this.build();
};

ShipEngineer.prototype.assembleHull = function(thickness) {
  thickness = typeof thickness !== 'undefined' ? thickness : 2;

  var ship = this.ship;
  var tgtMatrix = this.tgtMatrix;
  var clone = tgtMatrix.clone();

  clone.fill(function(m, x, y, z) {
    var pos = new Point(x, y, z);
    var cell = m.val(pos);
    if(cell.type !== 'void') {
      return new Hull();
    } else {
      return false;
    }
  });

  clone.expand(thickness);
  tgtMatrix.transferTo(clone, new Point(thickness, thickness));

  tgtMatrix.body = clone.body;
  tgtMatrix.update();
  this.updateRooms();
};

ShipEngineer.prototype.genMatrix = function() {
  var ship = this.ship;
  var roomCount = this.blueprints.length;
  if(roomCount%2 === 0) roomCount++;

  var boundaries = new Boundaries(
    roomCount * Ship.gen.params.sizeFactor,
    roomCount * Ship.gen.params.sizeFactor,
    21
  );

  var matrix = new Matrix(boundaries, Ship.gen.params.roomPaddings);
  matrix.flatten(); //change to enable 3D placement

  this.tgtMatrix = matrix;

  return matrix;
};

ShipEngineer.prototype.genBlueprints = function() {
  var size = this.ship.size;
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

  this.blueprints = blueprints;
};

ShipEngineer.prototype.updateRooms = function() {
  var tgtMatrix = this.ship.matrix;
  var rooms = this.ship.rooms;
  var update = function(m, x, y, z, r) {
    var pos = new Point(x, y, z);
    var cell = m.val(pos);
    
    if(cell.id === rooms[r].id && cell.type === 'room') {
      rooms[r].pos = pos;
      return 'break';
    }
  };

  for(var r in rooms) {
    tgtMatrix.iterate(update,r);
  }
  // console.log(rooms);
  this.ship.rooms = rooms;
};

ShipEngineer.prototype.clean = function() {
  var tgtMatrix = this.ship.matrix;

  this.wakeDormants();
  tgtMatrix.flatten(); // change for 3D
  tgtMatrix.trim();

  this.updateRooms();
};

ShipEngineer.prototype.mirrorShip = function(axis, offset) {
  axis = typeof axis !== 'undefined' ? axis : 'x';
  offset = typeof offset !== 'undefined' ? offset : 0;

  var tgtMatrix = this.ship.matrix;
  var rooms = this.ship.rooms;
  var idOffset = rooms[rooms.length - 1].id;
  var mirror;

  tgtMatrix.trim();

  if(offset > 0) {
    tgtMatrix.slice(axis, -offset, offset);
    this.updateRooms();
  }

  mirror = tgtMatrix.clone(false);

  var id;
  var room;
  var pos;

  for(var r in rooms) {
    id = rooms[r].id + idOffset;
    pos = rooms[r].pos;
    room = rooms[r].room.clone(id);
    this.logRoom(room, pos);

    room.matrix.transferTo(mirror, pos);
  }

  mirror.flip(axis);

  var transferPos;
  var boundaries = tgtMatrix.boundaries;

  switch(axis) {
    case 'x':
      transferPos = new Point(boundaries.x, 0, 0);
      break;

    case 'y':
      transferPos = new Point(0, boundaries.y, 0);
      break;

    case 'z':
      transferPos = new Point(0, 0, boundaries.z);
      break;
  }

  tgtMatrix.mirror(axis);
  mirror.transferTo(tgtMatrix, transferPos);

  this.updateRooms();
  // console.log('mirrored Ship');
};
