function Tool() {
  'use strict';
}

Tool.clone = function(object) {
  var clone = {};

  for(var o in object) {
    clone[o] = object[o];
  }

  return clone;
};

Tool.dirToAxis = function(direction) {
  var axis;

  if(direction === 'up' || direction === 'down') {
    axis = 'y';
  } else if(direction === 'right' || direction === 'left') {
    axis = 'x';
  }

  return axis;
}

Tool.perpendicularAxis = function(axis) {
  var pAxis;

  if(axis === 'x') {
    pAxis = 'y';
  } else if(axis === 'y') {
    pAxis = 'x';
  }

  return pAxis;
};

Tool.randRange = function(min, max) {
  return Math.round(Math.random() * (max - min) + min);
};

Tool.randPercent= function() {
  return Tool.randRange(1, 100);
};

Tool.oneIn = function(universe) {
  return Tool.randRange(1, universe) === universe;
};

Tool.randAttr = function(object, filter) {
  var obj = Tool.clone(object);

  var attrs = [];

  if(typeof filter === 'object') {
    for(var f in filter) {
      if(obj.hasOwnProperty(filter[f])) {
        attrs.push(filter[f]);
      } else {
        console.log(filter[f] + ' is not present in ' + obj);
      }
    }
  } else {
    for(var a in obj) {
      attrs.push(a);
    }
  }

  var attr = attrs[Tool.randRange(0, attrs.length - 1)];

  return object[attr];
};

Tool.weightedRandAttr = function(object, chances) {
  var _chances = chances.slice(0);

  for(var c = 1; c < _chances.length; c++) {
    _chances[c] += _chances[c - 1];
  }

  var roll = Tool.randRange(1, _chances[_chances.length - 1]);

  for(var o = 1; o < object.length; o++) {

    if(roll > _chances[o - 1] && roll <= _chances[o]) {
      return object[o]; 
    }
  }

  return  object[0];
};

Tool.randDirection = function() {
  return Tool.randAttr(['up', 'right', 'down', 'left']); 
};

Tool.logCoord = function(x, y, z) {
  console.log(x + ' ' + y  + ' ' + z);
};

Tool.getRule = function(codici, ruleSet, rule) {
  var ruleString = ruleSet.split('.');
  var realRuleSet = codici;

  for(var rs in ruleString) {
    realRuleSet = realRuleSet[ruleString[rs]];
  }

  if(!realRuleSet.hasOwnProperty(rule)) {
    console.error('no valid ' + realRuleSet + ' declared');
    return false;
  } else {
    return realRuleSet[rule];
  }
};

Tool.randRule = function(codici, ruleSet, filter) {
  var ruleString = ruleSet.split('.');
  var realRuleSet = Tool.clone(codici);

  for(var rs = 0; rs < ruleString.length; rs++) {
    realRuleSet = realRuleSet[ruleString[rs]];
  }

  var rule = Tool.randAttr(realRuleSet, filter);
  
  return rule;
};

Tool.clone = function(object) {
  return JSON.parse(JSON.stringify(object));
};
