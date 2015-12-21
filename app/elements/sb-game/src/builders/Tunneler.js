function Tunneler(engineer, options) {
  'use strict';

  options = typeof options !== 'undefined' ? options : {};
  options.type = 'Tunneler';
  options.width = typeof options.width !== 'undefined' ? options.width : Tunneler.defaults.width();
  
  Builder.call(this, engineer, Tunneler.job, Tunneler.jobCondition, options);

  this.history = [];
  this.corridor = Tunneler.genCorridor(this);
  this.blockedDirections = [];
}

Tunneler.defaults = {
  width: function() {
    return Tool.weightedRandAttr([1, 3], [70, 30]);
  }
};

Tunneler.prototype = Object.create(Builder.prototype);
Tunneler.prototype.constructor = Tunneler;

Tunneler.prototype.possibleDirections = (function(_super) {
  return function(pos, excludeCurrentAndReverse) {
    var pDirections = _super.call(this, pos, excludeCurrentAndReverse);
    var bDirections = this.blockedDirections;
    var index;

    for(var bDir in bDirections) {
      index = pDirections.indexOf(bDirections[bDir]);

      if(index !== -1) {
        pDirections.splice(index, 1);
      }
    }

    return pDirections;
  };
})(Tunneler.prototype.possibleDirections);

Tunneler.prototype.moveOrTurn = (function(_super) {
  return function() {
    _super.call(this);
    this.blockedDirections = [];
  };
})(Tunneler.prototype.moveOrTurn);

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
  if(this.isAlive && this.engineer.blueprints.length > 0) {
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
          this.engineer.addTunneler({startingPos: this.pos[direction](offset), startingDir: direction});
          break;

        case 'Roomer':
          this.engineer.addRoomer({startingPos: this.pos[direction](offset), startingDir: direction});
          break;
      }
      this.blockedDirections.push(direction);
      // console.log('spawned');
    }
  }
};


Tunneler.job = function(tunneler) {
  var corridor = tunneler.corridor;
  var pos = tunneler.pos;
  var tgtMatrix = tunneler.tgtMatrix;

  // if(tunneler.history.length === 0) {//debug
  //   var m = new Matrix(new Boundaries());
  //   m.val(new Point(), new Cell(tunneler.id, 'corridor', {tile: 'S'}));
  //   m.transferTo(tgtMatrix, pos);
  // } else {
    corridor.transferTo(tgtMatrix, pos.toTopLeft(corridor));
  // }
  tunneler.history.push(pos);
};

Tunneler.jobCondition = function(tunneler, pos, direction) {
  var tgtMatrix = tunneler.tgtMatrix;
  var width = Math.ceil(tunneler.options.width / 2);
  
  var sAxis = Tool.dirToAxis(direction);
  var poses = pos.parallelsInAxis(sAxis, width, tunneler.options.width);

  var cell;
  for(var p in poses) {
    if(tunneler.tgtMatrix.contains(poses[p])) {
      cell = tgtMatrix.val(poses[p]);

      if(cell.type !== 'void') {
        // console.log('sides invalid');
        return false;
      }
    } else {
      // console.log('not contained in matrix');
      return false;
    }
  }

  if(tunneler.tgtMatrix.contains(pos[direction]())) {
    cell = tgtMatrix.val(pos[direction]());

    if(cell.type !== 'void' && cell.type !== 'corridor') {
      // console.log('front invalid');
      return false;
    }
  } else {
    return false;
  }

  return true;
};

Tunneler.prototype.die = function() {
  this.isAlive = false;

  this.engineer.addCleaner({startingPos: this.history[0], startingDir: this.options.startingDir, width: this.options.width, tgtId: this.id, tgtList: this.history});

  if(this.history.length > 0) {
    var rHistory = this.history.slice(0);
    rHistory.reverse();

    this.engineer.addCleaner({startingPos: rHistory[0], startingDir: this.reverseDirection(), width: this.options.width, tgtId: this.id, tgtList: rHistory});
  }

};