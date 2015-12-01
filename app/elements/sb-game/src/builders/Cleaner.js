function Cleaner(engineer, options) {
  'use strict';

  options = typeof options !== 'undefined' ? options : {};
  options.type = 'Cleaner';
  
  if(typeof options.tgtId === 'undefined') {
    console.error('Cleaner declared without tgtId');
  }

  if(typeof options.tgtList === 'undefined') {
    console.error('Cleaner declared without tgtList');
  }

  Builder.call(this, engineer, Cleaner.job, Cleaner.jobCondition, options);

  this.tgtId = this.options.tgtId;
  this.tgtList = this.options.tgtList;
} 

Cleaner.prototype = Object.create(Builder.prototype);
Cleaner.prototype.constructor = Cleaner;

Cleaner.prototype.work = function() {
  if(this.jobCondition(this)) {
    this.job(this);
    this.moveOrTurn();
  } else {
    this.die();
  }
};

Cleaner.job = function(cleaner) {
  var tgtMatrix = cleaner.tgtMatrix;
  var pos = cleaner.pos;
  var width = cleaner.options.width;
  var cleanArea = new Matrix(new Boundaries(width, width, 1));

  cleanArea.transferTo(tgtMatrix, pos.toTopLeft(cleanArea), true);
  // console.log('cleaned');
};

Cleaner.jobCondition = function(cleaner) {
  if(cleaner.isAlive) {
    var tgtMatrix = cleaner.tgtMatrix;
    var tgtList = cleaner.tgtList;
    var tgtId = cleaner.tgtId;
    var width = cleaner.options.width;
    var radius = Math.ceil(width / 2);
    var pos = cleaner.pos;
    var connectionsSelf = 0;
    var connectionsOthers = 0;

    if(tgtList.length > 0) {
      var parallels;
      parallels = pos.parallels(radius, width);

      for(var p in parallels) {
        if(tgtMatrix.contains(parallels[p])) {
          var cell = tgtMatrix.val(parallels[p]);

          if(cell.type === 'corridor' && cell.id === tgtId) {
            connectionsSelf++;
          } else if(cell.type !== 'void') {
            connectionsOthers++;
          } 
        }
      }
    } else {
      return false;
    }

    if(connectionsSelf >= width * 2 || tgtList.length > 1 && connectionsOthers >= 1 || tgtList.length === 1 && connectionsOthers >= 2) return false; else return true;
  }
};

Cleaner.prototype.moveOrTurn = function() {
  this.tgtList.splice(0, 1);

  var tgtList = this.tgtList;

  if(this.tgtList.length > 0) {
    this.pos = tgtList[0];
  } else {
    this.die();
  }
};
