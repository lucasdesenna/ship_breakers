function Roomer(manager, options) {
  'use strict';

  options = typeof options !== 'undefined' ? options : {};
  options.type = 'Roomer';

  Builder.call(this, manager, Roomer.job, Roomer.jobCondition, options);
} 

Roomer.prototype = Object.create(Builder.prototype);
Roomer.prototype.constructor = Roomer;

Roomer.prototype.work = function() {
  // this.tgtMatrix.val(this.pos, new RoomCell());
  if(this.manager.ship.blueprints.length > 0) {
    this.room = Roomer.genRoom(this);

    if(this.jobCondition(this)) {
      this.job(this);
    }
  }
  
  this.die();
};

Roomer.genRoom = function(roomer) {
  var id = roomer.id;
  var size = roomer.manager.ship.blueprints[0];

  return new Room(id, size, 'rectangle'); //CHANGE SHAPE
};

Roomer.job = function(roomer) {
  var room = roomer.room;
  var manager = roomer.manager;
  var pos = roomer.pos;
  var roomPos = roomer.roomPlacementPos();

  roomer.buildEntrance(pos);
  manager.placeRoom(room, roomPos);
};

Roomer.jobCondition = function(roomer) {
  var _pos = roomer.roomPlacementPos();

  return roomer.tgtMatrix.checkPlacement(roomer.room.matrix, _pos);
};

Roomer.prototype.roomPlacementPos = function() {
  var room = this.room;
  var _pos = this.pos.toTopLeft(room.matrix);
  var direction = this.direction;
  var pAxis = this.primaryAxis;

  _pos = _pos[direction](room.matrix.center[pAxis] + 1);

  return _pos;
};

Roomer.prototype.buildEntrance = function(pos) {
  var sAxis = this.secondaryAxis;
  var sAxisLength = this.room.matrix.boundaries[sAxis];
  var maxEntrances = (sAxisLength  - 1) / 2;
  var entranceCount = Tool.randRange(1, maxEntrances);

  var entrancePos = this.entrancePlacementPos(pos);

  while(entranceCount > 0 && entrancePos.length > 0) {
    var selectedPos = Tool.randAttr(entrancePos);
    var index = entrancePos.indexOf(selectedPos);

    this.tgtMatrix.val(selectedPos, new RoomCell({
      furniture: ['Door']//change to object
    }));

    var _index = index;
    var exclude = 1;

    if(typeof entrancePos[index - 1] !== 'undefined') {
      _index--;
      exclude++;
    }

    if(typeof entrancePos[index + 1] !== 'undefined') {
      exclude++;
    }
    
    entrancePos.splice(_index, exclude);
    entranceCount--;
  }
};

Roomer.prototype.entrancePlacementPos = function(pos) {
  var tgtMatrix = this.tgtMatrix;
  var reverseDir = this.reverseDirection();
  var secondaryAxis = this.secondaryAxis;
  var sAxisLength = this.room.matrix.boundaries[secondaryAxis];
  var radius = Math.floor(sAxisLength / 2);

  var entrancePos = pos.inAxis(secondaryAxis, radius);

  var cell;
  for(var e = entrancePos.length - 1; e >= 0; e--) {
    cell = tgtMatrix.val(entrancePos[e][reverseDir]());

    if(cell.type !== 'corridor') {
      entrancePos.splice(e, 1);
    }
  }

  return entrancePos;
};
