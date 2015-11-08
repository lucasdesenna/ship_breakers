function BuilderManager(ship) {
  'use strict';

  this.ship = ship;
  this.tgtMatrix = ship.matrix;
  this.buildersCount = 0;
  this.generation = 0;
  this.builders = {
    current: [],
    stash: []
  };  
}

BuilderManager.prototype.addBuilder = function(type, options) {
  var builders = this.builders;
  var builder = new window[type](this, options);

  if(this.builders.current.length === 0) {
    builders.current.push(builder);
  } else {
    builders.stash.push(builder);
  }

  this.buildersCount++;
};

BuilderManager.prototype.recycle = function() {
  var builders = this.builders;

  for(var b = builders.current.length - 1; b >= 0; b--) {
    if(builders.current[b].alive === false) {
      builders.current.splice(b, 1);
    }
  }

  if(builders.current.length === 0) {
    builders.current = builders.stash;
    builders.stash = [];
    this.generation++;
    console.log('end of generation');
  }
};

BuilderManager.prototype.build = function() {
  // var builders = this.builders;

  // while(builders.current.length > 0) {
  //   for(var b in builders.current) {
  //     builders.current[b].work();
  //   }
  //   this.recycle();
  // }

  var self = this;
  var i = setInterval(function() {
    var builders = self.builders;

    if(builders.current.length > 0 && self.ship.blueprints.length > 0) {
      for(var b in builders.current) {
        builders.current[b].work();
      }
      self.recycle();
    } else {
      clearInterval(i);
      console.log('stopped building');
    }
  }, 100);
  console.log('started building');
};

BuilderManager.prototype.addTunneler = function(options) {
  options = typeof options !== 'undefined' ? options : {};
  options.paddings = typeof options.paddings !== 'undefined' ? options.paddings : this.tgtMatrix.paddings;

  this.addBuilder('Tunneler', options);
};

BuilderManager.prototype.addRoomer = function(options) {
  options = typeof options !== 'undefined' ? options : {};
  options.paddings = typeof options.paddings !== 'undefined' ? options.paddings : this.tgtMatrix.paddings;

  this.addBuilder('Roomer', options);
};

BuilderManager.prototype.placeRoom = function(room, point) {
  var ship = this.ship;
  var srcMatrix = room.matrix;
  var destMatrix = ship.matrix;

  srcMatrix.transferTo(destMatrix, point);
  this.discartBlueprint();
  this.logRoom(room, point);
  // console.log('placed at ' + point.x + ' ' + point.y + ' ' + point.z);
};

BuilderManager.prototype.logRoom = function(room, point) {
  var ship = this.ship;

  var log = {
    room: room,
    at: point
  };

  ship.rooms.push(log);
};

BuilderManager.prototype.discartBlueprint = function() {
  this.ship.blueprints.splice(0, 1);
};
