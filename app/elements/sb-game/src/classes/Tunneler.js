function Tunneler(manager, options) {
  'use strict';

  options = typeof options !== 'undefined' ? options : {};
  options.type = 'Tunneler';
  options.width = typeof options.width !== 'undefined' ? options.width : Tunneler.defaults.width();

  Builder.call(this, manager, Tunneler.job, Tunneler.jobCondition, options);
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
  var sA = tunneler.secondaryAxis;
  var width = tunneler.options.width;
  var boundaries;

  if(sA === 'x') {
    boundaries = new Boundaries(width, 1, 1);
  } else if(sA === 'y') {
    boundaries = new Boundaries(1, width, 1);
  }

  var corridor = new Matrix(boundaries);
  corridor.fill(function() {
    return new Corridor(id);
  });
  
  return corridor;
};

Tunneler.prototype.spawn = function() {
  if(this.alive) {
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

      console.log('spawned');
    }
  }
};


Tunneler.job = function(tunneler) {
  var corridor = tunneler.corridor;
  var pos = tunneler.pos.toTopLeft(corridor);
  var tgtMatrix = tunneler.tgtMatrix;

  corridor.transferTo(tgtMatrix, pos);
};

Tunneler.jobCondition = function(tunneler, pos) {
  if(tunneler.direction) {
    tunneler.corridor = Tunneler.genCorridor(tunneler);
    var tgtMatrix = tunneler.tgtMatrix;
    var direction = tunneler.direction;

    var _pos = pos[direction]();

    return tgtMatrix.checkPlacement(tunneler.corridor, _pos);
  } else {
    return true;
  }
};
