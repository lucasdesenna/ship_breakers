function Connector(manager, options) {
  'use strict';

  options = typeof options !== 'undefined' ? options : {};
  options.type = 'Connector';

  Builder.call(this, manager, Connector.job, Connector.jobCondition, options);
} 

Connector.prototype = Object.create(Builder.prototype);
Connector.prototype.constructor = Connector;

Connector.prototype.work = function() {
  if(this.manager.ship.blueprints.length > 0) {
    this.room = Connector.genRoom(this);

    if(this.jobCondition(this)) {
      this.job(this);
    }
  }
  
  this.die();
};

Connector.genRoom = function(roomer) {
  var id = roomer.id;
  var size = roomer.manager.ship.blueprints[0];

  return new Room(id, size, 'rectangle'); //CHANGE SHAPE
};

Connector.job = function(roomer) {
  var room = roomer.room;
  var manager = roomer.manager;
  var pos = roomer.pos;
  var roomPos = roomer.roomPlacementPos();

  roomer.buildEntrance(pos);
  manager.placeRoom(room, roomPos);
};

Connector.jobCondition = function(roomer) {
  var _pos = roomer.roomPlacementPos();

  return roomer.tgtMatrix.checkPlacement(roomer.room.matrix, _pos);
};

Connector.prototype.roomPlacementPos = function() {
  var room = this.room;
  var _pos = this.pos.toTopLeft(room.matrix);
  var direction = this.direction;
  var primaryAxis = this.primaryAxis;

  _pos = _pos[direction](room.matrix.center[primaryAxis] + 1);

  return _pos;
};

Connector.prototype.buildEntrance = function(pos) {
  var secondaryAxis = this.secondaryAxis;
  var sAxisLength = this.room.matrix.boundaries[secondaryAxis];
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

Connector.prototype.entrancePlacementPos = function(pos) {
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
