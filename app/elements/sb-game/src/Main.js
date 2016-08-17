function Main() {
  'use strict';
}

Main.seed;
Main.activeShip;
Main.renderTree = [];

Main.setup = function() {
  if(Debug.isActive) {
    Main.seed = Debug.testSeed;
  } else {
    Main.seed = new Seed();
  }

  Main.activeShip = new Ship({
    size: 'small',
    shipClass:'transport',
    faction: 'aaa'
  });

  Debug.ship = Main.activeShip;

  Main.add(Main.activeShip);
};


Main.add = function(agent) {
  Main.renderTree.push(agent);
};

Main.render = function() {
  var renderTree = Main.renderTree;
  var tgtMatrix;
  var renderData;

  for(var agent in renderTree) {
    renderData = [];
    tgtMatrix = renderTree[agent].matrix.clone();
    tgtMatrix.toIsometric();

    for (var y = 0; y < tgtMatrix.boundaries.y; y++) {
      renderData[y] = [];

      for (var x = 0; x < tgtMatrix.boundaries.x; x++) {
        var pos = new Point(x, y);
        var tgtCell = tgtMatrix.val(pos);
        var cell = {
          gfx: tgtCell.gfx
        };

        var isoCoord = x + ':' + y + ':' + 0;
        var coord = tgtMatrix.originalCoords[isoCoord];
        if(typeof coord !== 'undefined') {
          cell.coord = coord;
        }
        
        renderData[y].push(cell);
      }
    }
  }

  return renderData;
};
