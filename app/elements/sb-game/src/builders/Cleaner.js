function Cleaner(manager, options) {
  'use strict';

  options = typeof options !== 'undefined' ? options : {};
  options.type = 'Cleaner';
  
  if(typeof options.tgtId === 'undefined') {
    console.error('Cleaner declared without tgtId');
  }

  Builder.call(this, manager, Cleaner.job, Cleaner.jobCondition, options);
} 

Cleaner.prototype = Object.create(Builder.prototype);
Cleaner.prototype.constructor = Cleaner;

Cleaner.prototype.work = function() {
  if(this.jobCondition(this)) {
    this.job(this);
  } else {
    this.die();
  }
};

Cleaner.job = function(cleaner) {
  var tgtMatrix = cleaner.tgtMatrix;
  var tgtList = cleaner.options.tgtList;
  var tgtPos = tgtList[tgtList.length - 1];

  tgtMatrix.val(tgtPos, new Cell());
  tgtList.splice(-1, 1);
  // console.log('cleaned');
};

Cleaner.jobCondition = function(cleaner) {
  var tgtMatrix = cleaner.tgtMatrix;
  var tgtList = cleaner.options.tgtList;
  var tgtId = cleaner.options.tgtId;
  var radius = Math.ceil(cleaner.options.width / 2);

  if(tgtList.length > 0) {
    var tgtPos = tgtList[tgtList.length - 1];
    var nInAxis;
    
    if(tgtList.length === 1) {
      var direction = cleaner.direction;
      var sAxis = cleaner.secondaryAxis;

      nInAxis = tgtPos.neighborsInAxis(sAxis, radius);
      nInAxis.push(tgtPos[direction]());
    } else {
      nInAxis = tgtPos.neighborsBothAxes(radius);
    }

    for(var nIA in nInAxis) {
      var cell = tgtMatrix.val(nInAxis[nIA]);

      if(cell.id !== tgtId && cell.type !== 'void') {
        return false;
      }
    }
  } else {
    return false;
  }

  return true;
};
