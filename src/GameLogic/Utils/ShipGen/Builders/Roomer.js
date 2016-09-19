import Builder from '../Builder';
import Entrance from '../../../Entities/Cells/Entrance';
import Room from '../../../Entities/Room';
import Tool from '../../Tool';

export default class Roomer extends Builder {
  constructor(engineer: ShipEngineer, options): void {
    options = typeof options !== 'undefined' ? options : {};
    options.type = 'Roomer';

    super(engineer, Roomer.job, Roomer.jobCondition, options);
  }

  work(): void {
    if(this.engineer.blueprints.length > 0) {
      this.room = Roomer.genRoom(this);

      if(this.jobCondition(this)) {
        this.job(this);
      }
    }

    this.die();
  }

  static genRoom(roomer: Roomer): Room {
    let id = roomer.id;
    let size = roomer.engineer.blueprints[0];

    return new Room(id, size, 'rectangle'); //CHANGE SHAPE
  }

  static job(roomer: Roomer): void {
    let room = roomer.room;
    let engineer = roomer.engineer;
    let pos = roomer.pos;
    let roomPos = roomer.roomPlacementPos();

    roomer.buildEntrance(pos);
    engineer.placeRoom(room, roomPos);
  }

  static jobCondition(roomer): boolean {
    let _pos = roomer.roomPlacementPos();

    return roomer.tgtMatrix.checkPlacement(roomer.room.matrix, _pos);
  }

  roomPlacementPos(): Point {
    let room = this.room;
    let _pos = this.pos.toTopLeft(room.matrix);
    let direction = this.direction;
    let pAxis = this.primaryAxis;

    _pos = _pos[direction](room.matrix.center[pAxis] + 1);

    return _pos;
  }

  buildEntrance(pos: Point): void {
    // let pAxis = this.primaryAxis;
    let sAxis = this.secondaryAxis;
    let sAxisLength = this.room.matrix.boundaries[sAxis];
    let maxEntrances = (sAxisLength  - 1) / 2;
    let entranceCount = Tool.randRange(1, maxEntrances);

    let entrancePos = this.entrancePlacementPos(pos);

    while(entranceCount > 0 && entrancePos.length > 0) {
      let selectedPos = Tool.randAttr(entrancePos);
      let index = entrancePos.indexOf(selectedPos);

      this.tgtMatrix.val(selectedPos, new Entrance(this.id));

      let _index = index;
      let exclude = 1;

      if(typeof entrancePos[index - 1] !== 'undefined') {
        _index--;
        exclude++;
      }

      if(typeof entrancePos[index + 1] !== 'undefined') {
        exclude++;
      }

      entrancePos.splice(_index, exclude);
      entranceCount--;
    }
  }

  entrancePlacementPos(pos: Point): Point {
    let tgtMatrix = this.tgtMatrix;
    let reverseDir = this.reverseDirection();
    let secondaryAxis = this.secondaryAxis;
    let sAxisLength = this.room.matrix.boundaries[secondaryAxis];
    let radius = Math.floor(sAxisLength / 2);

    let entrancePos = pos.inAxis(secondaryAxis, radius);

    let cell;
    for(let e = entrancePos.length - 1; e >= 0; e--) {
      cell = tgtMatrix.val(entrancePos[e][reverseDir]());

      if(cell.type !== 'corridor') {
        entrancePos.splice(e, 1);
      }
    }

    return entrancePos;
  }
}
