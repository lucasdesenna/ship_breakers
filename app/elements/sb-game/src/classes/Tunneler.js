function Tunneler(manager, pos, options) {
  options = typeof options !== 'undefined' ? options : {};

  options.jobCondition = function(pos) {
    return manager.tgtMatrix.val(pos).wall === true;
  };

  //options.width = Tool.randAttr([1, 3]);

  Builder.call(this, manager, 'Tunneler', function(tunneler) {
    var cell = tunneler.tgtMatrix.val(tunneler.pos);

    if(typeof cell === 'object' && cell.isRoom === false) {
      tunneler.tgtMatrix.val(tunneler.pos, new Cell(false));
    }
  }, pos, options);
}

Tunneler.prototype = Builder.prototype;
Tunneler.prototype.constructor = Tunneler;

Tunneler.prototype.spawn = (function(_super) {
  return function() {
    _super.call(this, this.type, this.pos, {paddings: this.tgtMatrix.paddings});
  };
})(Builder.prototype.spawn);
