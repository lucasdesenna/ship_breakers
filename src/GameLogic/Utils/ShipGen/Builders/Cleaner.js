import Builder from '../Builder';
import Matrix from '../../Matrix';
import Boundaries from '../../Boundaries';

export default class Cleaner extends Builder {
  constructor(engineer: ShipEngineer, options): void {
    options = typeof options !== 'undefined' ? options : {};
    options.type = 'Cleaner';

    if(typeof options.tgtId === 'undefined') {
      console.error('Cleaner declared without tgtId');
    }

    if(typeof options.tgtList === 'undefined') {
      console.error('Cleaner declared without tgtList');
    }

    super(engineer, Cleaner.job, Cleaner.jobCondition, options);

    this.tgtId = this.options.tgtId;
    this.tgtList = this.options.tgtList;
  }

  work(): void {
    if(this.jobCondition(this)) {
      this.job(this);
      this.moveOrTurn();
    } else {
      this.die();
    }
  }

  moveOrTurn(): void {
    this.tgtList.splice(0, 1);

    let tgtList = this.tgtList;

    if(this.tgtList.length > 0) {
      this.pos = tgtList[0];
    } else {
      this.die();
    }
  }

  static job(cleaner): void {
    let tgtMatrix = cleaner.tgtMatrix;
    let pos = cleaner.pos;
    let width = cleaner.options.width;
    let cleanArea = new Matrix(new Boundaries(width, width, 1));

    cleanArea.transferTo(tgtMatrix, pos.toTopLeft(cleanArea), true);
    // console.log('cleaned');
  }

  static jobCondition(cleaner: Cleaner): boolean {
    if(cleaner.isAlive) {
      let tgtMatrix = cleaner.tgtMatrix;
      let tgtList = cleaner.tgtList;
      let tgtId = cleaner.tgtId;
      let width = cleaner.options.width;
      let radius = Math.ceil(width / 2);
      let pos = cleaner.pos;
      let connectionsSelf = 0;
      let connectionsOthers = 0;

      if(tgtList.length > 0) {
        let parallels;
        parallels = pos.parallels(radius, width);

        for(let p in parallels) {
          if(tgtMatrix.contains(parallels[p])) {
            let cell = tgtMatrix.val(parallels[p]);

            if(cell.type === 'corridor' && cell.id === tgtId) {
              connectionsSelf++;
            } else if(cell.type !== 'void') {
              connectionsOthers++;
            }
          }
        }
      } else {
        return false;
      }

      if(connectionsSelf >= width * 2 ||
         (tgtList.length > 1 && connectionsOthers >= 1) ||
         (tgtList.length === 1 && connectionsOthers >= 2)) return false; else return true;
    }
  };
}
