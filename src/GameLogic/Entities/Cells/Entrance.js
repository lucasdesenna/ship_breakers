import Cell from '../Cell';
import Door from '../Furnitures/Door';

export default class Entrance extends Cell {
  constructor(tag, layers): void {
    layers = typeof layers !== 'undefined' ? layers : {};
    layers.furniture = typeof layers.furniture !== 'undefined' ? layers.furniture : new Door();

    super('entrance', tag, layers);
  }

  clone() {
    super.clone(Entrance);
  }

  orientation(matrix: Matrix, pos: Point): string {
    let orientation;
    let up = matrix.val(pos.up());
    let connectedUp = false;

    if(typeof up !== 'undefined' && (up.type === 'room' || up.type === 'corridor')) {
      connectedUp = true;
    }

    let right = matrix.val(pos.right());
    let connectedRight = false;

    if(typeof right !== 'undefined' && (right.type === 'room' || right.type === 'corridor')) {
      connectedRight = true;
    }

    let down = matrix.val(pos.down());
    let connectedDown = false;

    if(typeof down !== 'undefined' && (down.type === 'room' || down.type === 'corridor')) {
      connectedDown = true;
    }

    let left = matrix.val(pos.left());
    let connectedLeft = false;

    if(typeof left !== 'undefined' && (left.type === 'room' || left.type === 'corridor')) {
      connectedLeft = true;
    }

    if(connectedUp && connectedDown) {
      orientation = 'ne-sw';
    } else if(connectedRight && connectedLeft) {
      orientation = 'nw-se';
    }

    return orientation;
  };
}
