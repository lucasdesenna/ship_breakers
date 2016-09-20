import Seed from '../Utils/Seed';
import Point from '../Utils/Point';

export default class Debug {
  static isActive = true;
  static testSeed = new Seed([0.0766652103047818, 0.30275367060676217, 0.596993870800361, 0.7203761290293187, 0.38902846770361066, 0.27975861774757504, 0.08317130524665117, 0.4589910348877311, 0.5111691541969776, 0.23604314564727247, 0.9095225303899497, 0.6272440790198743, 0.4422725737094879, 0.13375021889805794, 0.5131247511599213, 0.6365265878848732, 0.6037236745469272, 0.13834764808416367, 0.36745089502073824, 0.10566682880744338, 0.004052100237458944, 0.9348078134935349, 0.4305849205702543, 0.47952607506886125, 0.9128307139035314, 0.39439845364540815, 0.17352440604008734, 0.7272911814507097, 0.9000664129853249, 0.19049731688573956, 0.7953632536809891, 0.1970624017994851, 0.0664104341994971, 0.3589151706546545, 0.02092651673592627, 0.2827342425007373, 0.6295097207184881, 0.9869879384059459, 0.49925968958996236, 0.7908598408102989, 0.12279171496629715, 0.075769322225824, 0.9845602549612522, 0.60347198555246, 0.832235858310014, 0.265963303623721, 0.5002652022521943, 0.7501406089868397, 0.11367373401299119, 0.5452200109139085, 0.1998781415168196, 0.8940479126758873, 0.649708041222766, 0.40872108726762235, 0.15991716063581407, 0.3277851839084178, 0.810083458898589, 0.7217361943330616, 0.9329701534006745, 0.6141100523527712, 0.5738789825700223, 0.005348490085452795, 0.44847482815384865, 0.934847382362932, 0.3781907542143017, 0.006433484144508839, 0.9278857025783509, 0.528592947172001, 0.5474839098751545, 0.031197641510516405, 0.4876608639024198, 0.4397681476548314, 0.9763214450795203, 0.14099746895954013, 0.34013446466997266, 0.648816610686481, 0.02448343299329281, 0.46451316331513226, 0.08700197003781796, 0.5639283014461398, 0.4847217027563602, 0.4889513032976538, 0.6742827431298792, 0.23397055733948946, 0.5386293735355139, 0.3828783330973238, 0.35802917764522135, 0.15126433433033526, 0.3230858219321817, 0.07198468898423016, 0.8109060295391828, 0.5076154703274369, 0.505962171824649, 0.43487908272072673, 0.9442447666078806, 0.8458902046550065, 0.5885112625546753, 0.3366181794553995, 0.3018607727717608, 0.43666884605772793]);

  static ship;

  static getCoord = function(_event) {
    let target = _event.currentTarget;
    let coord = target.dataset.coord;

    return coord;
  };

  static coordToPos = function(coord) {
    coord = coord.split(':');
    let pos = new Point(coord[0], coord[1], coord[2]);

    return pos;
  };

  static getConnections = function(pos) {
    // let matrix = Debug.ship.matrix;
    // let cell = matrix.val(pos);

    let connections = {
      n: pos.up().left(),
      ne: pos.up(),
      e: pos.up().right(),
      se: pos.right(),
      s: pos.down().right(),
      sw: pos.down(),
      w: pos.down().left(),
      nw: pos.left()
    };

    return connections;
  };

  static printConnections = function(_event) {
    if(Debug.isActive) {
      let coord = Debug.getCoord(_event);
      let pos = Debug.coordToPos(coord);
      let connections = Debug.getConnections(pos);

      console.log(connections);
    }
  };

  static markConnections = function(_event) {
    if(Debug.isActive) {
      let coord = Debug.getCoord(_event);
      if(typeof coord === 'string') {
        let pos = Debug.coordToPos(coord);
        let connections = Debug.getConnections(pos);

        let matrix = Debug.ship.matrix;

        Debug.ship.matrix.mark(pos);

        for(let c in connections) {
          // Debug.ship.matrix.mark(connections[c]);
          let cell = matrix.val(connections[c]);
          console.log(c + ': ' + cell.type);
        }

      } else {
        console.log('nothing to mark at ' + coord);
      }
    }
  };

  static getOrientation = function(_event) {
    if(Debug.isActive) {
      let matrix = Debug.ship.matrix;
      let coord = Debug.getCoord(_event);
      let pos = Debug.coordToPos(coord);
      let cell = matrix.val(pos);
      let orientation;

      let connections = {
        n: matrix.val(pos.up().left()),
        ne: matrix.val(pos.up()),
        e: matrix.val(pos.up().right()),
        se: matrix.val(pos.right()),
        s: matrix.val(pos.down().right()),
        sw: matrix.val(pos.down()),
        w: matrix.val(pos.down().left()),
        nw: matrix.val(pos.left())
      };

      for(let c in connections) {
        console.log(c + ': ' + connections[c].type);
        if(typeof connections[c] !== 'undefined' && connections[c].type === cell.type) {
          connections[c] = true;
        } else {
          connections[c] = false;
        }
      }

      console.log(connections);

      if(
        // !connections.n &&
        !connections.ne &&
        // !connections.e &&
        connections.se &&
        connections.s &&
        connections.sw &&
        // !connections.w &&
        !connections.nw
      ) {
        orientation = 'n';
      } else if(
        // !connections.n &&
        !connections.ne &&
        // !connections.e &&
        connections.se &&
        connections.s &&
        connections.sw &&
        connections.w &&
        connections.nw
      ) {
        orientation = 'ne';
      } else if(
        // !connections.n &&
        !connections.ne &&
        // !connections.e &&
        !connections.se &&
        // connections.s &&
        connections.sw &&
        connections.w &&
        connections.nw
      ) {
        orientation = 'e';
      } else if(
        connections.n &&
        connections.ne &&
        // !connections.e &&
        !connections.se &&
        // !connections.s &&
        connections.sw &&
        connections.w &&
        connections.nw
      ) {
        orientation = 'se';
      } else if(
        connections.n &&
        connections.ne &&
        // !connections.e &&
        !connections.se &&
        // !connections.s &&
        !connections.sw &&
        // !connections.w &&
        connections.nw
      ) {
        orientation = 's';
      } else if(
        connections.n &&
        connections.ne &&
        connections.e &&
        connections.se &&
        // !connections.s &&
        !connections.sw &&
        // !connections.w &&
        connections.nw
      ) {
        orientation = 'sw';
      }  else if(
        // connections.n &&
        connections.ne &&
        connections.e &&
        connections.se &&
        // !connections.s &&
        !connections.sw &&
        // !connections.w &&
        !connections.nw
      ) {
        orientation = 'w';
      }  else if(
        // connections.n &&
        connections.ne &&
        connections.e &&
        connections.se &&
        connections.s &&
        connections.sw &&
        // !connections.w &&
        !connections.nw
      ) {
        orientation = 'nw';
      } else if(
        !connections.ne &&
        !connections.se &&
        !connections.sw &&
        !connections.nw
      ) {
        orientation = 'island';
      } else {
        orientation = 'island';
      }

      console.log(orientation);
      matrix.mark(pos);
    }
  }

  // else { //DEBUG MODE
  //     let simmetry = Tool.randAttr(['noSimmetry', 'x', 'y', 'z', 'xy', 'xz', 'yz', 'xyz']); //make dynamic and relative to faction
  //     let placement = 'clustered'; //make dynamic and relative to faction
  //     sEngineer.genBlueprints();

  //     sEngineer.ship.rooms = [];
  //     sEngineer.ship.matrix = sEngineer.genMatrix();

  //     sEngineer.addTunneler({startingPos: ship.matrix.center});

  //     let i = setInterval(function() {
  //       let builders = sEngineer.builders;

  //       if(builders.current.length > 0) {
  //         for(let b in builders.current) {
  //           builders.current[b].work();
  //         }
  //         sEngineer.recycle();
  //       } else {
  //         clearInterval(i);
  //         console.log('stopped building');

  //         let j = setInterval(function() {
  //           let dormants = sEngineer.builders.dormants;

  //           if(dormants.length > 0) {
  //             let currentDormants = dormants[dormants.length - 1];
  //             for(let f in currentDormants) {
  //               currentDormants[f].work();
  //             }
  //             sEngineer.recycleDormants();
  //           } else {
  //             clearInterval(j);
  //             console.log('stopped finalizing');
  //             // sEngineer.clean();
  //           }
  //         }, 200);
  //         console.log('started finalizing');
  //       }
  //     }, 200);
  //     console.log('started building');
  //   }
  // };
}
