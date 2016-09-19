import Room from '../../Entities/Room';
import Tool from '../Tool'

export default class ShipGen {
  static roomPlacement = {
    patterns: {
      random: function(ship) {
        // let matrix = ship.matrix;
        // let boundaries = matrix.boundaries;
        let room;
        let point;

        room = new Room('random', 'rectangle');

        for (let pC = ShipGen.roomPlacement.chances; pC > 0; pC--) {
          point = Tool.randPos(undefined, undefined, [0, 0]);

          if(ship.checkPlacement(room, point)) {
            ship.pushRoom(room, point);

            return true;
          }
        }
        return false;
      },

      cluster: function(ship) {
        let room;
        let prevRoom;
        let point0;
        let point;
        let radius;
        let clusterSize = Tool.randRange(ShipGen.roomClustering.minClusterSize, ShipGen.roomClustering.maxClusterSize);

        if(ShipGen.getRule('roomPlacement.patterns', 'random')(ship)) {
          clusterSize--;
          prevRoom = ship.rooms.slice(-1)[0].room;
          point0 = ship.rooms.slice(-1)[0].at;
          point = point0;

          for(let cS = clusterSize; cS > 0; cS--) {
            room = new Room(Tool.randAttr(ShipGen.roomClustering.allowedSizes), 'rectangle');

            for (let pC = ShipGen.roomPlacement.chances; pC > 0; pC--) {
              radius = Math.hypot(prevRoom.matrix.center.x, prevRoom.matrix.center.y) + Math.hypot(room.matrix.center.x, room.matrix.center.y) + ShipGen.roomPlacement.margins;
              point = point.randRadialPoint(
                point,
                radius,
                radius + ShipGen.roomClustering.maxDispersion,
                true //change to enable 3D
              ).toCenter(prevRoom.matrix).flatten().toGrid();

              if(ship.checkPlacement(room, point)) {
                ship.pushRoom(room, point);
                prevRoom = ship.rooms.slice(-1)[0].room;
                point = ship.rooms.slice(-1)[0].at;

                break;
              } else {
                point = point0;
              }
            }
          }
          return true;
        }
        return false;
      },

      block: function(ship) {
        let room;
        let prevRoom;
        let point0;
        let point;
        let radius;
        let blockSize = Tool.randRange(ShipGen.roomClustering.minClusterSize, ShipGen.roomClustering.maxClusterSize);

        if(ShipGen.getRule('roomPlacement.patterns', 'random')(ship)) {
          blockSize--;
          prevRoom = ship.rooms.slice(-1)[0].room;
          point0 = ship.rooms.slice(-1)[0].at;
          point = point0;

          for(let bS = blockSize; bS > 0; bS--) {
            room = new Room(Tool.randAttr(ShipGen.roomClustering.allowedSizes), 'rectangle');

            for (let pC = ShipGen.roomPlacement.chances; pC > 0; pC--) {
              radius = Math.hypot(prevRoom.matrix.center.x, prevRoom.matrix.center.y) + Math.hypot(room.matrix.center.x, room.matrix.center.y) + ShipGen.roomPlacement.margins;
              point = point.randRadialPoint(
                point,
                radius,
                radius + ShipGen.roomClustering.maxDispersion,
                true //change to enable 3D
              ).toCenter(prevRoom.matrix).flatten().toGrid();

              if(ship.checkPlacement(room, point)) {
                ship.pushRoom(room, point);
                prevRoom = ship.rooms.slice(-1)[0].room;
                point = ship.rooms.slice(-1)[0].at;

                break;
              } else {
                point = point0;
              }
            }
          }
          return true;
        }
        return false;
      }
    }
  };

  static roomClustering = {
    allowedSizes: ['medium'],
    minClusterSize: 2,
    maxClusterSize: 5,
    maxDispersion: 3
  };

  static layout = {
    rigid: function() {

    },

    organic: function() {

    },

    clean: function() {

    },

    tower: function() {

    }
  };

  static simmetry = {
    noSimmetry: function() {

    },

    // yAxis: function() {

    // },

    // xyAxes: function() {

    // },

    // xyzAxes: function() {

    // }
  };

  static shipFaction = ShipGen.simmetry;
}
