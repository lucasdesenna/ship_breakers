import Ship from '../../Entities/Ship';
import Wall from '../../Entities/Cells/Wall';
import Boundaries from '../Boundaries';
import Tool from '../Tool';
import Point from '../Point';

export default class ShipEngineer {
  constructor(targetMatrix: Matrix, buildOptions): void {
    this.targetMatrix = targetMatrix;
    this.buildOptions = buildOptions;

    this.buildersCount = 0;
    this.generation = 0;
    this.builders = {
      current: [],
      stash: [],
      dormants: []
    };
  }

  addBuilder(type: string, options): void {
    let builders = this.builders;
    let builder = new window[type](this, options);

    if(this.builders.current.length === 0) {
      builders.current.push(builder);
    } else {
      builders.stash.push(builder);
    }

    this.buildersCount++;
  }

  addDormant(type: string, options): void {
    let dormants = this.builders.dormants;
    let _final = new window[type](this, options);

    if(dormants.length === 0) dormants.push([]);

    dormants[dormants.length - 1].push(_final);
    this.buildersCount++;
  }

  addTunneler(options): void {
    options = typeof options !== 'undefined' ? options : {};
    options.paddings = typeof options.paddings !== 'undefined' ? options.paddings : this.tgtMatrix.paddings;

    this.addBuilder('Tunneler', options);
  };

  addRoomer(options): void {
    options = typeof options !== 'undefined' ? options : {};
    options.paddings = typeof options.paddings !== 'undefined' ? options.paddings : this.tgtMatrix.paddings;

    this.addBuilder('Roomer', options);
  };

  addCleaner(options): void {
    this.addDormant('Cleaner', options);
  };

  addConnector(options): void {
    options = typeof options !== 'undefined' ? options : {};
    options.connectorMaxLength = typeof options.connectorMaxLength !== 'undefined' ? options.connectorMaxLength : Ship.gen.params.connectorMaxLength;

    this.addBuilder('Connector', options);
  };

  recycle(): void {
    let current = this.builders.current;
    let stash = this.builders.stash;

    for(let b = current.length - 1; b >= 0; b--) {
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

  recycleDormants(): void {
    let dormants = this.builders.dormants;
    let currentDormants = dormants[dormants.length - 1];

    for(let cF = currentDormants.length - 1; cF >= 0; cF--) {
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

  build(): void {
    let builders = this.builders;

    // console.log('started building');

    while(builders.current.length > 0) {
      for(let b in builders.current) {
        builders.current[b].work();
      }
      this.recycle();
    }

    // console.log('stopped building');
  };

  wakeDormants(): void {
    let dormants = this.builders.dormants;

    // console.log('started finalizing');

    while(dormants.length > 0) {
      let currentDormants = dormants[dormants.length - 1];
      for(let f in currentDormants) {
        currentDormants[f].work();
      }
      this.recycleDormants();
    }

    // console.log('stopped finalizing');
  };

  placeRoom(room, point): void {
    let ship = this.ship;
    let srcMatrix = room.matrix;
    let destMatrix = ship.matrix;

    this.discartBlueprint();
    srcMatrix.transferTo(destMatrix, point);
    this.logRoom(room, point);
    // console.log('placed at ' + point.x + ' ' + point.y + ' ' + point.z);
  };

  logRoom(room, point): void {
    let ship = this.ship;

    let log = {
      id: room.id,
      pos: point,
      room: room
    };

    ship.rooms.push(log);
  };

  discartBlueprint(): void {
    this.blueprints.splice(0, 1);
  };

  seedShip(): void {
    let ship = this.ship;

    //let simmetry = Tool.randAttr(['noSimmetry', 'x', 'y', 'z', 'xy', 'xz', 'yz', 'xyz']); //make dynamic and relative to faction
    //let placement = 'clustered'; //make dynamic and relative to faction

    this.genBlueprints();

    ship.rooms = [];
    ship.matrix = this.genMatrix();
    this.addTunneler({startingPos: ship.matrix.center});
    this.build();
  };

  applySimmetry(simmetry): void {
    switch(simmetry) {

    }
  };

  seedConnectors(): void {
    let rooms = this.ship.rooms;
    let roomLog;
    // let id;
    let boundaries;
    let pos;
    let cPos = function(pos, boundaries) {
      return Tool.randPos(
        [pos.x, pos.x + boundaries.x - 1],
        [pos.y, pos.y + boundaries.y - 1],
        [pos.z, pos.z + boundaries.z - 1]
      );
    };
    let cCount;

    for(let r in rooms) {
      roomLog = rooms[r];
      boundaries = roomLog.room.matrix.boundaries;
      pos = roomLog.pos;

      cCount = Ship.gen.params.connectorsPerRoom();

      for(cCount; cCount > 0; cCount--) {
        this.addConnector({startingPos: cPos(pos, boundaries), originId: roomLog.id});
      }
    }

    this.build();
  };

  buildWalls(thickness): void {
    thickness = typeof thickness !== 'undefined' ? thickness : 2;

    let tgtMatrix = this.tgtMatrix;
    let clone = tgtMatrix.clone();

    clone.fill(function(m, x, y, z) {
      let pos = new Point(x, y, z);
      let cell = m.val(pos);
      if(cell.type !== 'void') {
        return new Wall();
      } else {
        return false;
      }
    });

    clone.expand(thickness);
    tgtMatrix.transferTo(clone, new Point(thickness, thickness));

    tgtMatrix.body = clone.body;
    tgtMatrix.update();
    this.updateRooms();
  }

  genMatrix(): void {
    let roomCount = this.blueprints.length;
    if(roomCount%2 === 0) roomCount++;

    let boundaries = new Boundaries(
      roomCount * Ship.gen.params.sizeFactor,
      roomCount * Ship.gen.params.sizeFactor,
      21
    );

    let matrix = new Matrix(boundaries, Ship.gen.params.roomPaddings);
    matrix.flatten(); //change to enable 3D placement

    this.tgtMatrix = matrix;

    return matrix;
  }

  genBlueprints(): void {
    let size = this.ship.size;
    let blueprints = [];
    let roomCount;
    let roomChance;

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
  }

  updateRooms(): void {
    let tgtMatrix = this.ship.matrix;
    let rooms = this.ship.rooms;
    let update = function(m, x, y, z, r) {
      let pos = new Point(x, y, z);
      let cell = m.val(pos);

      if(cell.id === rooms[r].id && cell.type === 'room') {
        rooms[r].pos = pos;
        return 'break';
      }
    };

    for(let r in rooms) {
      tgtMatrix.iterate(update,r);
    }
    // console.log(rooms);
    this.ship.rooms = rooms;
  }

  clean(): void {
    let tgtMatrix = this.ship.matrix;

    this.wakeDormants();
    tgtMatrix.flatten(); // change for 3D
    tgtMatrix.trim();

    this.updateRooms();
  }

  mirrorShip(axis: string = 'x', offset: number = 0): void {
    let tgtMatrix = this.ship.matrix;
    let rooms = this.ship.rooms;
    let idOffset = rooms[rooms.length - 1].id;
    let mirror;

    tgtMatrix.trim();

    if(offset > 0) {
      tgtMatrix.slice(axis, -offset, offset);
      this.updateRooms();
    }

    mirror = tgtMatrix.clone(false);

    let id;
    let room;
    let pos;

    for(let r in rooms) {
      id = rooms[r].id + idOffset;
      pos = rooms[r].pos;
      room = rooms[r].room.clone(id);
      this.logRoom(room, pos);

      room.matrix.transferTo(mirror, pos);
    }

    mirror.flip(axis);

    let transferPos;
    let boundaries = tgtMatrix.boundaries;

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

      default:
        console.error('invalid axis');
    }

    tgtMatrix.mirror(axis);
    mirror.transferTo(tgtMatrix, transferPos);

    this.updateRooms();
    // console.log('mirrored Ship');
  }

  paintTiles(): void {
    let matrix = this.ship.matrix;

    matrix.iterate(function(m, x, y, z, e) {
      let pos = new Point(x, y, z);
      let cell = m.val(pos);
      let type = cell.type;

      let orientation = cell.orientation(m, pos);
      let tile = type + '-' + orientation;

      cell.layers.tile = tile;
    });
  }
}
