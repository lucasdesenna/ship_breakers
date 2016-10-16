import Seed from '../Utils/Seed';
import Point from '../Utils/Point';
import Ship from '../Entities/Ship';
import Debug from './Debug';

export default class Main {
  static seed;
  static activeShip;
  static renderTree = [];

  static setup = function() {
    if(Debug.isActive) {
      Main.seed = Debug.testSeed;
    } else {
      Main.seed = new Seed();
    }

    Main.activeShip = new Ship({
      size: 'small',
      shipClass:'transport',
      faction: 'aaa'
    });

    Debug.ship = Main.activeShip;

    Main.add(Main.activeShip);
  };

  static add(agent) {
    Main.renderTree.push(agent);
  };

  static render() {
    let renderTree = Main.renderTree;
    let tgtMatrix;
    let renderData;

    for(let agent in renderTree) {
      if ({}.hasOwnProperty.call(renderTree, agent)) {
        renderData = [];
        tgtMatrix = renderTree[agent].matrix.clone();
        tgtMatrix.toIsometric();

        for (let y = 0; y < tgtMatrix.boundaries.y; y++) {
          renderData[y] = [];

          for (let x = 0; x < tgtMatrix.boundaries.x; x++) {
            let pos = new Point(x, y);
            let tgtCell = tgtMatrix.val(pos);
            let cell = {
              gfx: tgtCell.gfx
            };

            let isoCoord = x + ':' + y + ':' + 0;
            let coord = tgtMatrix.originalCoords[isoCoord];
            if(typeof coord !== 'undefined') {
              cell.coord = coord;
            }

            renderData[y].push(cell);
          }
        }
      }
    }

    return renderData;
  };
}
