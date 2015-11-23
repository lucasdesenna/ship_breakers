function ShipGen() {
  'use strict';
}

ShipGen.roomPlacement = {
  patterns: {
    random: function(ship) {
      var matrix = ship.matrix;
      var boundaries = matrix.boundaries;
      var room;
      var point;

      room = new Room('random', 'rectangle');

      for (var pC = ShipGen.roomPlacement.chances; pC > 0; pC--) {
        point = Tool.randPos(undefined, undefined, [0, 0]);

        if(ship.checkPlacement(room, point)) {
          ship.pushRoom(room, point);

          return true;
        }
      }
      return false;
    },

    cluster: function(ship) {
      var room;
      var prevRoom;
      var point0;
      var point;
      var radius;
      var clusterSize = Tool.randRange(ShipGen.roomClustering.minClusterSize, ShipGen.roomClustering.maxClusterSize);

      if(ShipGen.getRule('roomPlacement.patterns', 'random')(ship)) {
        clusterSize--;
        prevRoom = ship.rooms.slice(-1)[0].room;
        point0 = ship.rooms.slice(-1)[0].at;
        point = point0;

        for(var cS = clusterSize; cS > 0; cS--) {
          room = new Room(Tool.randAttr(ShipGen.roomClustering.allowedSizes), 'rectangle');

          for (var pC = ShipGen.roomPlacement.chances; pC > 0; pC--) {
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
      var room;
      var prevRoom;
      var point0;
      var point;
      var radius;
      var blockSize = Tool.randRange(ShipGen.roomClustering.minClusterSize, ShipGen.roomClustering.maxClusterSize);

      if(ShipGen.getRule('roomPlacement.patterns', 'random')(ship)) {
        blockSize--;
        prevRoom = ship.rooms.slice(-1)[0].room;
        point0 = ship.rooms.slice(-1)[0].at;
        point = point0;

        for(var bS = blockSize; bS > 0; bS--) {
          room = new Room(Tool.randAttr(ShipGen.roomClustering.allowedSizes), 'rectangle');

          for (var pC = ShipGen.roomPlacement.chances; pC > 0; pC--) {
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

ShipGen.roomClustering = {
  allowedSizes: ['medium'],
  minClusterSize: 2,
  maxClusterSize: 5, 
  maxDispersion: 3
};

ShipGen.



ShipGen.layout = {
  rigid: function() {

  },

  organic: function() {

  },

  clean: function() {

  },

  tower: function() {

  }
};

ShipGen.simmetry = {
  noSimmetry: function() {

  },

  // yAxis: function() {

  // },

  // xyAxes: function() {

  // },

  // xyzAxes: function() {

  // }
};

ShipGen.shipFaction = ShipGen.simmetry;
