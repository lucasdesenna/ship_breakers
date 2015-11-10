function Tunneler(manager, options) {
  'use strict';

  options = typeof options !== 'undefined' ? options : {};
  options.type = 'Tunneler';
  // options.width = typeof options.width !== 'undefined' ? options.width : Tunneler.defaults.width();
  options.width = typeof options.width !== 'undefined' ? options.width : 1;
  
  Builder.call(this, manager, Tunneler.job, Tunneler.jobCondition, options);

  this.history = [];
  this.corridor = Tunneler.genCorridor(this);
}

Tunneler.defaults = {
  width: function() {
    return Tool.randAttr([1, 3]);
  }
};

Tunneler.prototype = Object.create(Builder.prototype);
Tunneler.prototype.constructor = Tunneler;

Tunneler.genCorridor = function(tunneler) {
  var id = tunneler.id;
  var width = tunneler.options.width;
  var boundaries = new Boundaries(width, width, 1);
  var corridor = new Matrix(boundaries);

  corridor.fill(function() {
    return new Corridor(id);
  });
  
  return corridor;
};

Tunneler.prototype.spawn = function() {
  if(this.alive && this.manager.ship.blueprints.length > 0) {
    var pDirections = this.possibleDirections(this.pos, true);
    var direction;
    var types = ['Tunneler', 'Roomer']; 
    var type;
    var i = Tool.randRange(0, pDirections.length - 1);

    var offset = Math.ceil(this.options.width / 2);

    for(i; i >= 0; i--) {
      direction = pDirections[i];
      type = Tool.weightedRandAttr(['Tunneler', 'Roomer'], Ship.gen.params.corridorsVsRooms);

      switch(type) {
        case 'Tunneler':
          this.manager.addTunneler({startingPos: this.pos[direction](offset), startingDir: direction});
          break;

        case 'Roomer':
          this.manager.addRoomer({startingPos: this.pos[direction](offset), startingDir: direction});
          break;
      }

      // console.log('spawned');
    }
  }
};


Tunneler.job = function(tunneler) {
  var corridor = tunneler.corridor;
  var pos = tunneler.pos.toTopLeft(corridor);
  var tgtMatrix = tunneler.tgtMatrix;

  tunneler.history.push(pos);
  corridor.transferTo(tgtMatrix, pos);
};

Tunneler.jobCondition = function(tunneler, pos, direction) {
  var tgtMatrix = tunneler.tgtMatrix;
  var width = Math.ceil(tunneler.options.width / 2);
  
  var sAxis = Tool.perpendicularAxis(Tool.dirToAxis(direction));
  var poses = pos.neighborsInAxis(sAxis, width);
  
  var cell;
  for(var p in poses) {
    cell = tgtMatrix.val(poses[p]);

    if(cell.type !== 'void') {
      return false;
    }
  }

  cell = tgtMatrix.val(pos[direction]());

  if(cell.type !== 'void' && cell.type !== 'corridor') {
    return false;
  }

  return true;
};

Tunneler.prototype.die = function() {
  this.alive = false;
  this.manager.addCleaner({startingPos: this.pos, startingDir: this.options.startingDir, width: this.options.width, tgtId: this.id, tgtList: this.history});
  
  if(this.id === 0) {
    var rHistory = this.history.slice(0);
    rHistory.reverse();
    
    this.manager.addCleaner({startingPos: this.options.startingPos, startingDir: this.options.startingDir, width: this.options.width, tgtId: this.id, tgtList: rHistory});
  }
};