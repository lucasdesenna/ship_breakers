function Ship(size, shipClass, faction) {
  'use strict';

  size = typeof size !== 'undefined' ? size : Ship.defaults.size;
  shipClass = typeof shipClass !== 'undefined' ? shipClass : Ship.defaults.shipClass;
  faction = typeof faction !== 'undefined' ? faction : Ship.defaults.faction;

  this.name = 'Forgotten Hull';
  this.size = size;
  this.shipClass = shipClass;
  this.faction = faction;
  this.age = null;
  this.integrity = null;
  this.build();
}

Ship.defaults = {
  size: 'medium',
  shipClass: 'transport',
  faction: 'faction',
  spawnChances: 20
};

Ship.gen = {
  params: {
    sizeFactor: 5,
    roomPaddings: 1,
    corridorsVsRooms: [20, 80],
    connectorMaxLength: 10,
    connectorsPerRoom: function() {
      return Tool.randRange(3, 5);
    }
  }
};

Ship.prototype.build = function() {
  window.ship = this; //DEBUG MODE
  var sEngineer = new ShipEngineer(this);
  window.sEngineer = sEngineer; //DEBUG MODE

  if(Tool.debugMode !== true) {
    do {
      Main.seed.reset();
      sEngineer.seedShip();
    } while(sEngineer.blueprints.length > 0);

    sEngineer.clean();
    sEngineer.mirrorShip('x', 0);

    // sEngineer.seedConnectors();
    sEngineer.assembleHull();
  } else { //DEBUG MODE
    var simmetry = Tool.randAttr(['noSimmetry', 'x', 'y', 'z', 'xy', 'xz', 'yz', 'xyz']); //make dynamic and relative to faction
    var placement = 'clustered'; //make dynamic and relative to faction
    sEngineer.genBlueprints();

    sEngineer.ship.rooms = [];
    sEngineer.ship.matrix = sEngineer.genMatrix();

    sEngineer.addTunneler({startingPos: ship.matrix.center});

    var i = setInterval(function() {
      var builders = sEngineer.builders;

      if(builders.current.length > 0) {
        for(var b in builders.current) {
          builders.current[b].work();
        }
        sEngineer.recycle();
      } else {
        clearInterval(i);
        console.log('stopped building');

        var j = setInterval(function() {
          var dormants = sEngineer.builders.dormants;

          if(dormants.length > 0) {
            var currentDormants = dormants[dormants.length - 1];
            for(var f in currentDormants) {
              currentDormants[f].work();
            }
            sEngineer.recycleDormants();
          } else {
            clearInterval(j);
            console.log('stopped finalizing');
            // sEngineer.clean();
          }
        }, 200);
        console.log('started finalizing');
      }
    }, 200);
    console.log('started building');
  }
};
