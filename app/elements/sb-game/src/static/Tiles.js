function Tiles(which) {
  'use strict';

  var tiles = {
    floor: String.fromCharCode(65)
  };
  if(!tiles.hasOwnProperty(which)) {
    console.error('No valid tile');

    return false;
  } else {
    return tiles[which];
  }
}
