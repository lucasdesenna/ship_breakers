function Main() {
  'use strict';
}

Main.setup = function() {
  Main.seed = new Seed();
  // console.log(Main.seed.val);
  
  Main.add(new Ship('small', 'transport', 'aaa'));
};

Main.renderTree = [];

Main.add = function(agent) {
  Main.renderTree.push(agent);
};

Main.render = function() {
  var renderTree = Main.renderTree;
  var tgtMatrix;
  var renderData;

  for(var r in renderTree) {
    renderData = [];
    tgtMatrix = renderTree[r].matrix.clone();
    tgtMatrix.toIsometric();

    for (var y = 0; y < tgtMatrix.boundaries.y; y++) {
      renderData[y] = [];
      for (var x = 0; x < tgtMatrix.boundaries.x; x++) {
        var cell = tgtMatrix.body[x][y][0];
          renderData[y].push(cell.tile);
      }
    }
  }

  return renderData;
};
