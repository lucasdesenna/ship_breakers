import Tool from '../Utils/Tool';
import ShipEngineer from '../Utils/ShipGen/ShipEngineer';

export default class Ship {
  constructor(options): void {
    this.initDefaultOptions();
    this.applyOptions(options);
    this.buildShip();
  }

  initDefaultOptions() {
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

  applyOptions(options): void {
    for(let o in options) {
      this[o] = options[o];
    }
  };

  generateShip(): void {
    let sEngineer = new ShipEngineer(this.matrix, this.buildOptions);

    do {
      sEngineer.seedShip();
    } while(sEngineer.blueprints.length > 0);

    sEngineer.clean();
    sEngineer.mirrorShip('x', 0);
    sEngineer.seedConnectors();
    sEngineer.buildWalls();
    sEngineer.paintTiles();
  };
}
