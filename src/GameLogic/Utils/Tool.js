import Point from './Point';
import Main from '../Core/Main';

export default class Tool {
  static hypotenuse(a: number, b: number): number {
    return Math.ceil(Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2)));
  };

  static clone(object): {} {
    let clone = {};

    for(let o in object) {
      if ({}.hasOwnProperty.call(o, object)) {
        clone[o] = object[o];
      }
    }

    return clone;
  };

  // static clone(object) {
  //   return JSON.parse(JSON.stringify(object));
  // };

  static dirToAxis(direction: string): string {
    let axis;

    if(direction === 'up' || direction === 'down') {
      axis = 'y';
    } else if(direction === 'right' || direction === 'left') {
      axis = 'x';
    }

    return axis;
  };

  static perpendicularAxis(axis: string): string {
    let pAxis;

    switch(axis) {
      case 'x':
        pAxis = 'y';
        break;

      case 'y':
        pAxis = 'x';
        break

      default:
        console.error('invalid axis');
    }

    return pAxis;
  };

  static randRange(min: number, max: number): number {
    let seed = Main.seed;

    return Math.round(seed.pick() * (max - min) + min);
  };

  static randPercent(): number {
    return Tool.randRange(1, 100);
  };

  static oneIn(universe): boolean {
    return Tool.randRange(1, universe) === universe;
  };

  static randPos(xRange?: [number, number] = [0, this.boundaries.x - 1],
                 yRange?: [number, number] = [0, this.boundaries.y - 1],
                 zRange?: [number, number] = [0, this.boundaries.z - 1]) {
    let position = new Point(
      Tool.randRange(xRange[0], xRange[1]),
      Tool.randRange(yRange[0], yRange[1]),
      Tool.randRange(zRange[0], zRange[1])
    );

    return position;
  };


  static randAttr(object, filter) {
    let obj = Tool.clone(object);
    let attrs = [];

    if(typeof filter === 'object') {
      for(let f in filter) {
        if(obj.hasOwnProperty(filter[f])) {
          attrs.push(filter[f]);
        } else {
          console.log(filter[f] + ' is not present in ' + obj);
        }
      }
    } else {
      for(let a in obj) {
        if ({}.hasOwnProperty.call(a, obj)) {
          attrs.push(a);
        }
      }
    }

    let attr = attrs[Tool.randRange(0, attrs.length - 1)];

    return object[attr];
  };

  static weightedRandAttr(object, chances) {
    let _chances = chances.slice(0);

    for(let c = 1; c < _chances.length; c++) {
      _chances[c] += _chances[c - 1];
    }

    let roll = Tool.randRange(1, _chances[_chances.length - 1]);

    for(let o = 1; o < object.length; o++) {

      if(roll > _chances[o - 1] && roll <= _chances[o]) {
        return object[o];
      }
    }

    return  object[0];
  };

  static randDirection() {
    return Tool.randAttr(['up', 'right', 'down', 'left']);
  };

  static logCoord(x, y, z) {
    console.log(x + ' ' + y  + ' ' + z);
  };

  static getRule(codici, ruleSet, rule) {
    let ruleString = ruleSet.split('.');
    let realRuleSet = codici;

    for(let rs in ruleString) {
      if ({}.hasOwnProperty.call(rs, ruleString)) {
        realRuleSet = realRuleSet[ruleString[rs]];
      }
    }

    if(!realRuleSet.hasOwnProperty(rule)) {
      console.error('no valid ' + realRuleSet + ' declared');
      return false;
    } else {
      return realRuleSet[rule];
    }
  };

  static randRule(codici, ruleSet, filter) {
    let ruleString = ruleSet.split('.');
    let realRuleSet = Tool.clone(codici);

    for(let rs = 0; rs < ruleString.length; rs++) {
      realRuleSet = realRuleSet[ruleString[rs]];
    }

    let rule = Tool.randAttr(realRuleSet, filter);

    return rule;
  };
}
