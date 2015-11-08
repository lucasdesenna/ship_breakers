function Main() {
  'use strict';
}

Main.setup = function() {
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

  for(var a in renderTree) {
    renderData = [];
    tgtMatrix = renderTree[a].matrix;

    for (var x = 0; x < tgtMatrix.body.length; x++) {
      renderData.push([]);
      for (var y = 0; y < tgtMatrix.body[x].length; y++) {
        var cell = tgtMatrix.body[x][y][0];
          renderData[x].push(cell.tile);
      }
    }
  }

  return renderData;
};
