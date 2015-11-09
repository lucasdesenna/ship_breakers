function BuilderManager(ship) {
  'use strict';

  this.ship = ship;
  this.tgtMatrix = ship.matrix;
  this.buildersCount = 0;
  this.generation = 0;
  this.builders = {
    current: [],
    stash: [],
    finals: [[]]
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

BuilderManager.prototype.addFinal = function(type, options) {
  var finals = this.builders.finals;

  var _final = new window[type](this, options);
  
  finals[finals.length - 1].push(_final);

  this.buildersCount++;
};

BuilderManager.prototype.recycle = function() {
  var current = this.builders.current;
  var stash = this.builders.stash;

  for(var b = current.length - 1; b >= 0; b--) {
    if(current[b].alive === false) {
      current.splice(b, 1);
    }
  }

  if(current.length === 0 && stash.length > 0) {
    this.builders.current = stash;
    this.builders.stash = [];

    this.builders.finals.push([]);
    
    console.log('end of generation');
    this.generation++;
  }


};

BuilderManager.prototype.recycleFinals = function() {
  var finals = this.builders.finals;
  var currentFinals = finals[finals.length - 1];

  for(var cF = currentFinals.length - 1; cF >= 0; cF--) {
    if(currentFinals[cF].alive === false) {
      currentFinals.splice(cF, 1);
    }
  }

  finals[finals.length - 1] = currentFinals;

  if(currentFinals.length === 0) {
    finals.splice(finals.length - 1, 1);
  }

  this.builders.finals = finals;
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

    if(builders.current.length > 0) {
      for(var b in builders.current) {
        builders.current[b].work();
      }
      self.recycle();
    } else {
      clearInterval(i);
      console.log('stopped building');
      self.finalize();
    }
  }, 100);
  console.log('started building');
};

BuilderManager.prototype.finalize = function() {
  var self = this;
  var i = setInterval(function() {
    var finals = self.builders.finals;

    if(finals.length > 0) {
      var currentFinals = finals[finals.length - 1];
      for(var f in currentFinals) {
        currentFinals[f].work();
      }
      self.recycleFinals();
    } else {
      clearInterval(i);
      console.log('stopped finalizing');
    }
  }, 100);
  console.log('started finalizing');
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

BuilderManager.prototype.addCleaner = function(options) {
  this.addFinal('Cleaner', options);
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