function Connector(engineer, options) {
  'use strict';

  options = typeof options !== 'undefined' ? options : {};
  options.type = 'Connector';
  options.life = typeof options.life !== 'undefined' ? options.life : Connector.defaults.life;
  options.width = typeof options.width !== 'undefined' ? options.width : Connector.defaults.width;
  options.startingDir = typeof options.startingDir !== 'undefined' ? options.startingDir : Connector.defaults.startingDir();
  options.chanceToSpawn = 0;

  Builder.call(this, engineer, Connector.job, Connector.jobCondition, options);

  this.originId = options.originId;
  this.path = [];
  this.corridor = Tunneler.genCorridor(this);
  this.isConnected = false;
}

Connector.defaults = {
  width: 1,
  life: 10,
  startingDir: function() {
    return Tool.randDirection();
  }
};

Connector.prototype = Object.create(Builder.prototype);
Connector.prototype.constructor = Connector;

Connector.job = function(connector) {
  var tgtMatrix = connector.tgtMatrix;
  var pos = connector.pos;

  connector.path.push(pos);
};

Connector.jobCondition = function(connector, pos, direction) {
  if(this.isAlive) {
    pos = typeof pos !== 'undefined' ? pos : connector.pos;

    var tgtMatrix = connector.tgtMatrix;
    var cell;

    if(tgtMatrix.contains(pos)) {
      cell = tgtMatrix.val(pos);

      if(cell.type === 'void' || cell.type === 'room' && cell.id === this.originId) {
        return true;
      } else if(cell.type === 'room' && cell.id !== this.originId) {
        this.isConnected = true;
      }
    }
  }
  
  return false;
};

Connector.prototype.die = (function(_super) {
  return function() {
    var tgtMatrix = this.tgtMatrix;
    var path = this.path;
    var corridor = this.corridor;
    var pos;
    var cell;

    if(path.length > 0 && this.isConnected) {
      for(var p in path) {
        pos = path[p];
        cell = tgtMatrix.val(pos);

        if(cell.type === 'void') {
          corridor.transferTo(tgtMatrix, pos.toTopLeft(corridor));
        }
      }
    }
    _super.call(this);
  };
})(Connector.prototype.die);
