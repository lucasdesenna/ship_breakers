import Builder from '../Builder';
import Tunneler from './Tunneler';
import Tool from '../../Tool';

export default class Connector extends Builder {
  constructor(engineer: ShipEngineer, options): void {
    options = typeof options !== 'undefined' ? options : {};
    options.type = 'Connector';
    options.life = typeof options.life !== 'undefined' ? options.life : Connector.defaults.life;
    options.width = typeof options.width !== 'undefined' ? options.width : Connector.defaults.width;
    options.startingDir = typeof options.startingDir !== 'undefined' ? options.startingDir : Connector.defaults.startingDir();
    options.chanceToTurn = 0;
    options.chanceToSpawn = 0;

    super(engineer, Connector.job, Connector.jobCondition, options);

    this.originId = options.originId;
    this.path = [];
    this.corridor = Tunneler.genCorridor(this);
    this.isConnected = false;
  }

  static defaults = {
    width: 1,
    life: 10,
    startingDir: function() {
      return Tool.randDirection();
    }
  }

  static job(connector: Connector): void {
    let pos = connector.pos;

    connector.path.push(pos);

    let direction = connector.direction;
    let nextPos = pos[direction]();
    let tgtMatrix = connector.tgtMatrix;
    let cell = tgtMatrix.val(nextPos);

    if(cell.type === 'room' && cell.id !== connector.originId) {
      connector.isConnected = true;
      connector.die();
    }
  }

  static jobCondition(connector: Connector, pos: Point, direction: string): boolean {
    let tgtMatrix = connector.tgtMatrix;

    let sAxis = Tool.dirToAxis(direction);
    let poses = pos.parallelsInAxis(sAxis);
    poses.push(pos);

    let cell;

    for(let p in poses) {
      if ({}.hasOwnProperty.call(poses, p)) {
        if(tgtMatrix.contains(poses[p])) {
          cell = tgtMatrix.val(poses[p]);

          if(cell.type !== 'void' && cell.type !== 'room') {
            return false;
          }
        } else {
          return false;
        }
      }
    }

    return true;
  }

  die(): void {
    let tgtMatrix = this.tgtMatrix;
    let path = this.path;
    let corridor = this.corridor;
    let pos;
    let cell;

    if(path.length > 0 && this.isConnected) {
      for(let p in path) {
        if ({}.hasOwnProperty.call(path, p)) {
          pos = path[p];
          cell = tgtMatrix.val(pos);

          if(cell.type === 'void') {
            corridor.transferTo(tgtMatrix, pos);
          }
        }
      }
    }

    super.die();
  }
}
