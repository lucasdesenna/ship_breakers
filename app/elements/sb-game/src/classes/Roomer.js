function Roomer(tgtMatrix, pos) {
  Builder.call(this, tgtMatrix, function(roomer) {
    var cell = roomer.tgtMatrix.val(roomer.pos);

    if(typeof cell === 'object' && cell.isRoom === false) {
      roomer.tgtMatrix.val(roomer.pos, new Cell(false));
      roomer.mayDo(5, function() {
        roomer.spawn();
      });
      roomer.mayDo(5, function() {
        roomer.turn();
      });
      roomer.move();
      roomer.age();
    } else {
      roomer.die();
    }
  }, pos);
}

Roomer.prototype = Builder.prototype;
Roomer.prototype.constructor = Roomer;
