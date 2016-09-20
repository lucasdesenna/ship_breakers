import Furniture from '../Furniture';

export default class Door extends Furniture {
  constructor(orientation: string): void {
    let gfx;

    switch(orientation) {
      case 'x':
        gfx = 'door-open-se';
        break;
      case 'y':
        gfx = 'door-open-sw';
        break;
      default:
        gfx = 'door-open-se';
    }

    super('door', gfx);
  }
}
