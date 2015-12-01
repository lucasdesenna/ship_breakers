function Seed(val) {
  'use strict';
  
  val = typeof val !== 'undefined' ? val : Seed.genVal();

  this.val = val;
  this.length = val.length;
}

Seed.genVal = function(length) {
  length = typeof length !== 'undefined' ? length : 100;
  var val = [];

  for(var s = length; s > 0; s--) {
    val.push(Math.random());
  }

  return val;
};

Seed.prototype.pick = function() {
  var pick = this.val.splice(0, 1)[0];
  this.val.push(pick);

  return pick;
};

Seed.prototype.reset = function() {
  this.val = Seed.genVal(this.length);
};