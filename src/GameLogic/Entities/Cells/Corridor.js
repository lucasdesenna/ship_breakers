import Cell from '../Cell';

export default class Corridor extends Cell {
  constructor(tag, layers: {} = {}): void {
    layers.tile = typeof layers.tile !== 'undefined' ? layers.tile : 'Corridor-sc-sw';

    super('corridor', tag, layers);
  }

  clone() {
    super.clone(Corridor);
  }

  orientation(matrix: Matrix, pos: Point) {
    return 'center';
  };
}
