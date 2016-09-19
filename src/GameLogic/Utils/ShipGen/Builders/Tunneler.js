import Builder from '../Builder';
import Corridor from '../../../Entities/Cells/Corridor';
import Ship from '../../../Ship';
import Matrix from '../../Matrix';
import Boundaries from '../../Boundaries';
import Tool from '../../Tool';

export default class Tunneler extends Builder {
  constructor(engineer: ShipEngineer, options): void {
    options = typeof options !== 'undefined' ? options : {};
    options.type = 'Tunneler';
    options.width = typeof options.width !== 'undefined' ? options.width : Tunneler.defaults.width();

    super(engineer, Tunneler.job, Tunneler.jobCondition, options);

    this.history = [];
    this.corridor = Tunneler.genCorridor(this);
    this.blockedDirections = [];
  }

  static defaults = {
    width: function() {
      return Tool.weightedRandAttr([1, 3], [70, 30]);
    }
  }

  possibleDirections(pos: Point, excludeCurrentAndReverse: boolean): [] {
    let pDirections = super.possibleDirections(pos, excludeCurrentAndReverse);
    let bDirections = this.blockedDirections;
    let index;

    for(let bDir in bDirections) {
      index = pDirections.indexOf(bDirections[bDir]);

      if(index !== -1) {
        pDirections.splice(index, 1);
      }
    }

    return pDirections;
  }

  moveOrTurn(): void {
    super.moveOrTurn();
    this.blockedDirections = [];
  }

  genCorridor(tunneler): void {
    let id = tunneler.id;
    let width = tunneler.options.width;
    let boundaries = new Boundaries(width, width, 1);
    let corridor = new Matrix(boundaries);

    corridor.fill(function() {
      return new Corridor(id);
    });

    return corridor;
  }

  spawn(): void {
    if(this.isAlive && this.engineer.blueprints.length > 0) {
      let pDirections = this.possibleDirections(this.pos, true);
      let direction;
      // let types = ['Tunneler', 'Roomer'];
      let type;
      let i = Tool.randRange(0, pDirections.length - 1);

      let offset = Math.ceil(this.options.width / 2);

      for(i; i >= 0; i--) {
        direction = pDirections[i];
        type = Tool.weightedRandAttr(['Tunneler', 'Roomer'], Ship.gen.params.corridorsVsRooms);

        switch(type) {
          case 'Tunneler':
            this.engineer.addTunneler({startingPos: this.pos[direction](offset), startingDir: direction});
            break;

          case 'Roomer':
            this.engineer.addRoomer({startingPos: this.pos[direction](offset), startingDir: direction});
            break;

          default:
            console.error('invalid type');
        }
        this.blockedDirections.push(direction);
        // console.log('spawned');
      }
    }
  }


  static job(tunneler: Tunneler): void {
    let corridor = tunneler.corridor;
    let pos = tunneler.pos;
    let tgtMatrix = tunneler.tgtMatrix;

    corridor.transferTo(tgtMatrix, pos.toTopLeft(corridor));

    tunneler.history.push(pos);
  };

  static jobCondition(tunneler: Tunneler, pos: Point, direction: string): boolean {
    let tgtMatrix = tunneler.tgtMatrix;
    let width = Math.ceil(tunneler.options.width / 2);

    let sAxis = Tool.dirToAxis(direction);
    let poses = pos.parallelsInAxis(sAxis, width, tunneler.options.width);

    let cell;
    for(let p in poses) {
      if(tunneler.tgtMatrix.contains(poses[p])) {
        cell = tgtMatrix.val(poses[p]);

        if(cell.type !== 'void') {
          // console.log('sides invalid');
          return false;
        }
      } else {
        // console.log('not contained in matrix');
        return false;
      }
    }

    if(tunneler.tgtMatrix.contains(pos[direction]())) {
      cell = tgtMatrix.val(pos[direction]());

      if(cell.type !== 'void' && cell.type !== 'corridor') {
        // console.log('front invalid');
        return false;
      }
    } else {
      return false;
    }

    return true;
  }

  die(): void {
    this.isAlive = false;

    this.engineer.addCleaner({startingPos: this.history[0], startingDir: this.options.startingDir, width: this.options.width, tgtId: this.id, tgtList: this.history});

    if(this.history.length > 0) {
      let rHistory = this.history.slice(0);
      rHistory.reverse();

      this.engineer.addCleaner({startingPos: rHistory[0], startingDir: this.reverseDirection(), width: this.options.width, tgtId: this.id, tgtList: rHistory});
    }
  }
}
