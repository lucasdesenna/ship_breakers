import Cell from '../Cell';

export default class RoomCell extends Cell {
  constructor(tag, layers): void {
    layers = typeof layers !== 'undefined' ? layers : {};
    layers.tile = typeof layers.tile !== 'undefined' ? layers.tile : 'RoomCell-sc-sw';

    super('room', tag, layers);
  }

  clone() {
    super.clone(RoomCell);
  }

  orientation(matrix: Matric, pos: Point): string {
    return 'center';
  };
}
