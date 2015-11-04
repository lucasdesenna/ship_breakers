function BuilderManager(tgtMatrix) {
  'use strict';

  this.tgtMatrix = tgtMatrix;
  this.builders = {
    current: [],
    stash: []
  };  
}

BuilderManager.prototype.addBuilder = function(type, pos, options) {
  var builders = this.builders;
  var builder = new window[type](this, pos, options);

  if(this.builders.current.length === 0) {
    builders.current.push(builder);
  } else {
    builders.stash.push(builder);
  }
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

    if(builders.current.length > 0) {
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

BuilderManager.prototype.addTunneler = function() {
  this.addBuilder('Tunneler', undefined, {paddings: this.tgtMatrix.paddings});
};