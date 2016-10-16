import Boundaries from './Boundaries';
import Cell from '../Entities/Cell';
import Point from './Point';

export default class Matrix {
  constructor(boundaries: Boundaries = new Boundaries(),
              paddings: number = 0,
              placeCells: boolean = false) {
    this.boundaries = boundaries;
    this.body = Matrix.genBody(boundaries, placeCells);
    this.center = this.getCenter();
    this.volume = this.getVolume();
    this.paddings = paddings;
  }

  static genBody(boundaries: Boundaries = new Boundaries(),
                 placeCells: boolean = false): {} {
    let body = [];

    for (let x = 0; x < boundaries.x; x++) {
      body[x] = [];
      for (let y = 0; y < boundaries.y; y++) {
        body[x][y] = [];
        for (let z = 0; z < boundaries.z; z++) {
          if(placeCells) {
            body[x][y][z] = new Cell();
          } else {
            body[x][y][z] = null;
          }
        }
      }
    }

    return body;
  };

  iterate(operation, extra) {
    let boundaries = this.boundaries;

    for (let x = 0; x < boundaries.x; x++) {
      for (let y = 0; y < boundaries.y; y++) {
        for (let z = 0; z < boundaries.z; z++) {
          let rtrn = operation(this, x, y, z, extra);
          if(rtrn === 'continue') continue;
          if(rtrn === 'break') return 'break';
        }
      }
    }
  };

  getCenter(): Point {
    let boundaries = this.boundaries;

    let center = new Point(
      (boundaries.x - 1) / 2,
      (boundaries.y - 1) / 2,
      (boundaries.z - 1) / 2
    );

    return center;
  };

  reCenter(): void {
    this.center = this.getCenter(this);
  };

  fill(rule): void {
    rule = typeof rule !== 'undefined' ? rule : function() { return false; };

    let matrix = this;

    matrix.iterate(function(matrix, x, y, z) {
      let r = rule(matrix, x, y, z);
      if(r !== false) {
        matrix.body[x][y][z] = r;
      }
    });
  };

  flatten(): void {
    let flatBoundaries = new Boundaries(
      this.boundaries.x,
      this.boundaries.y
    );
    let flatMatrix = new Matrix(flatBoundaries);

    this.iterate(function(m, x, y, z) {
      let pos = new Point(x, y, z);
      let cell = m.val(pos);

      if(m.contains(pos) && cell.type !== 'void') {
        let _pos = new Point(x, y, 0);

        flatMatrix.val(_pos, cell);
      }
    });

    this.body = flatMatrix.body;

    this.update();
  };

  trim(isoTrim: boolean = false): void {
    let topTrim;
    let emptyX = [],
        emptyY = [],
        emptyZ = [];
    let cell;

    this.iterate(function(m, x, y, z) {
      cell = m.body[x][y][z];

      if(cell.type !== 'void') {
        emptyX[x] = false;
        emptyY[y] = false;
        emptyZ[z] = false;
      } else {
        if(emptyX[x] !== false) emptyX[x] = true;
        if(emptyY[y] !== false) emptyY[y] = true;
        if(emptyZ[z] !== false) emptyZ[z] = true;
      }
    });

    if(isoTrim === true) {
      topTrim = 0;

      for(let tT in emptyY) {
        if ({}.hasOwnProperty.call(emptyY, tT)) {
          if(emptyY[tT] === true && parseInt(tT, 10) === topTrim) {
            topTrim++;
          } else {
            break;
          }
        }
      }
    }

    let clone = this.clone();

    for(let x = emptyX.length - 1; x >= 0; x--) {
      if(emptyX[x] === true) {
        clone.body.splice(x, 1);
      } else {
        for(let y = emptyY.length - 1; y >= 0; y--) {
          if(
            emptyY[y] === true && (
              isoTrim === false ||
              (isoTrim === true && topTrim%2 === 0) ||
              (topTrim%2 === 1 && y !== topTrim - 1)
            )
          ) {
            clone.body[x].splice(y, 1);
          } else {
            for(let z = emptyZ.length - 1; z >= 0; z--) {
              if(emptyZ[z] === true) {
                clone.body[x][y].splice(z, 1);
              }
            }
          }
        }
      }
    }

    this.body = clone.body;
    this.update();
  };

  flip(axis): void {
    let x;
    let y;

    switch(axis) {
      case 'x':
        this.body.reverse();
        break;

      case 'y':
        for(x in this.body) {
          if ({}.hasOwnProperty.call(this.body, x)) {
            this.body[x].reverse();
          }
        }
        break;

      case 'z':
        for(x in this.body) {
          if ({}.hasOwnProperty.call(this.body, x)) {
            for(y in this.body[x]) {
              if ({}.hasOwnProperty.call(this.body[x], y)) {
                this.body[x][y].reverse();
              }
            }
          }
        }
        break;

      default:
        console.error('invalid axis');
    }
  };

  mirror(axis: string = 'x', offset: number = 0): void {
    let clone;

    if(offset > 0) this.slice(axis, -offset, offset);

    clone = this.clone();
    clone.flip(axis);

    this.extend(axis, clone);
    this.update();
    // console.log('mirrored');
  };

  slice(axis: string = 'x', start: number = 0, howMany: number = 1): void {
    let clone = this.clone();
    let x;
    let y;

    switch(axis) {
      case 'x':
        this.body.splice(start, howMany);
        break;

      case 'y':
        for(x in clone.body) {
          if ({}.hasOwnProperty.call(clone.body, x)) {
            this.body[x].splice(start, howMany);
          }
        }
        break;

      case 'z':
        for(x in clone.body) {
          if ({}.hasOwnProperty.call(clone.body, x)) {
            for(y in clone.body[x]) {
              if ({}.hasOwnProperty.call(clone.body[x], y)) {
                this.body[x][y].splice(start, howMany);
              }
            }
          }
        }
        break;

      default:
        console.error('invalid axis');
    }

    this.update();
    // console.log('sliced');
  };

  extend(axis, extension): void {
    let x;
    let y;

    if(typeof extension !== 'object') {
      extension = typeof extension !== 'undefined' ? extension : 1;

      let boundaries;

      switch(axis) {
        case 'x':
          boundaries = new Boundaries(extension, this.boundaries.y, this.boundaries.y);
          break;

        case 'y':
          boundaries = new Boundaries(this.boundaries.x, extension, this.boundaries.y);
          break;

        case 'z':
          boundaries = new Boundaries(this.boundaries.x, this.boundaries.y, extension);
          break;

        default:
          console.error('invalid axis');
      }
      extension = new Matrix(boundaries);
    }

    switch(axis) {
      case 'x':
        this.body = this.body.concat(extension.body);
        break;

      case 'y':
        for(x in extension.body) {
          if ({}.hasOwnProperty.call(extension.body, x)) {
            this.body[x] = this.body[x].concat(extension.body[x]);
          }
        }
        break;

      case 'z':
        for(x in extension.body) {
          if ({}.hasOwnProperty.call(extension.body, x)) {
            for(y in extension.body[x]) {
              if ({}.hasOwnProperty.call(extension.body[x], y)) {
                this.body[x][y] = this.body[x][y].concat(extension.body[x][y]);
              }
            }
          }
        }
        break;

      default:
        console.error('invalid axis');
    }

    this.update();
  };

  toIsometric(): void {
    //NOT 3D

    let body = this.body;
    let boundaries = this.boundaries;
    let _boundaries = new Boundaries(
      Math.floor((boundaries.x - 1) / 2) + Math.floor(boundaries.y / 2) + 1,
      boundaries.x + boundaries.y - 1,
      boundaries.z
    );

    let clone = new Matrix(_boundaries);
    let originalCoords = {};

    let xCenter = Math.floor(boundaries.y / 2);
    let xOffset = 0;
    let yOffset = 0;
    let _x;
    let _y;
    let pos;
    let _pos;
    let cell;


    for(let x in body) {
      if ({}.hasOwnProperty.call(body, x)) {
        _x = xCenter + xOffset;

        for(let y in body[x]) {
          if ({}.hasOwnProperty.call(body[x], y)) {
            pos = new Point(x, y, 0);
            cell = this.val(pos);

            _y = parseInt(y, 10) + yOffset;

            if(_y%2 === 0) _x--;

            _pos = new Point(_x, _y, 0);
            clone.val(_pos, cell);

            let coord = x + ':' + y + ':' + 0;
            let isoCoord = _x + ':' + _y + ':' + 0;
            originalCoords[isoCoord] = coord;
          }
        }
        
        if(parseInt(x, 10)%2 === 1) xOffset++;
        yOffset++;
      }
    }

    // clone.trim(true);

    this.body = clone.body;
    this.update();
    this.originalCoords = originalCoords;
  };

  checkPlacement(srcMatrix: Matrix, pos: Point): boolean {
    let paddings = this.paddings;
    let tgtMatrix = this;
    let _srcMatrix = srcMatrix.clone();
    _srcMatrix.expand(paddings);

    let boundaries = _srcMatrix.boundaries;
    let _x;
    let _y;
    let _z;

    for(let x = 0; x < boundaries.x; x++) {
      _x = pos.x + x - paddings;
      if(typeof tgtMatrix.body[_x] !== 'undefined') {
        for(let y = 0; y < boundaries.y; y++) {
          _y = pos.y + y - paddings;
          if(typeof tgtMatrix.body[_x][_y] !== 'undefined') {
            for(let z = 0; z < boundaries.z; z++) {
              _z = pos.z + z - paddings;
              if(typeof tgtMatrix.body[_x][_y][_z] !== 'undefined') {
                if(
                  tgtMatrix.body[_x][_y][_z].type !== 'void' &&
                  _srcMatrix.body[x][y][z].type !== 'void' &&
                  _srcMatrix.body[x][y][z].id !== tgtMatrix.body[_x][_y][_z].id
                ) {
                  return false;
                }
              }
            }
          } else {
            return false;
          }
        }
      } else {
        return false;
      }
    }

    return true;
  };

  expand(radius: number = 1): void {
    let boundaries = this.boundaries;
    let expanded = new Matrix( new Boundaries(
      boundaries.x + (radius * 2),
      boundaries.y + (radius * 2),
      boundaries.z + (radius * 2)
    ));
    let point = new Point( radius, radius, radius);
    this.transferTo(expanded, point);

    let temp = expanded.clone();

    temp.iterate(function(m, x, y, z ,r) {
      let cell = m.body[x][y][z];

      if(cell.type !== 'void') {
        let clone = cell.clone();

        for(let _x = x - r; _x <= x + r; _x++) {
          for(let _y = y - r; _y <= y + r; _y++) {
            for(let _z = z - r; _z <= z + r; _z++) {
              expanded.body[_x][_y][_z] = clone;
            }
          }
        }
      }
    }, radius);

    this.body = expanded.body;
    this.update();
  };

  transferTo(destMatrix: Matrix, point: Point = new Point(), force: boolean = false): void {
    let matrix = this;

    matrix.iterate(function(m, x, y, z, p) {
      let _x = p.x + x;
      let _y = p.y + y;
      let _z = p.z + z;
      let _p = new Point(_x, _y, _z);

      if(destMatrix.contains(_p)) {
        let srcPoint = new Point(x, y, z);
        let cell = m.val(srcPoint);

        if(
          force === true ||
          (force === false && cell.type !== 'void')
        ) {
          let clone = cell.clone();
          destMatrix.val(_p, clone);
        }
      }
    }, point);

    destMatrix.update();
  };

  val(pos: Point, value?: any): any {
    if(this.contains(pos) === true) {
      if(typeof value !== 'undefined') {
        this.body[pos.x][pos.y][pos.z] = value;
      } else {
        return this.body[pos.x][pos.y][pos.z];
      }
    } else {
      return undefined;
    }
  };

  update(): void {
    this.boundaries.update(
      this.body.length,
      this.body[0].length,
      this.body[0][0].length
    );
    this.reCenter();
  };

  clone(deep: boolean = true): Matrix {
    this.update();

    let clone = new Matrix( new Boundaries(
      this.boundaries.x,
      this.boundaries.y,
      this.boundaries.z
    ));

    if(deep) this.transferTo(clone);

    return clone;
  };

  getVolume(): number {
    let volume = 0;

    for (let x = 0; x < this.body.length; x++) {
      for (let y = 0; y < this.body[x].length; y++) {
        for (let z = 0; z < this.body[x][y].length; z++) {
          if(this.body[x][y][z]) {
            volume++;
          }
        }
      }
    }

    return volume;
  };

  contains(pos: Point, excludePaddings: boolean = false): boolean {
    if(
      typeof this.body[pos.x] !== 'undefined' &&
      typeof this.body[pos.x][pos.y] !== 'undefined' &&
      typeof this.body[pos.x][pos.y][pos.z] !== 'undefined'
    ) {
      if(excludePaddings) {
        let paddings = this.paddings;
        let boundaries = this.boundaries;

        if (
          pos.x < paddings ||
          pos.y < paddings ||
          // pos.z === paddings - 1 ||
          pos.x > boundaries.x - 1 - paddings ||
          pos.y > boundaries.y - 1 - paddings//||
          // pos.z === boundaries.z - 1 - padding
        ) {
          return false;
        }
      }

      return true;
    }

    return false;
  };

  mark(pos: Point) {
    if(this.contains(pos) === true) {
      console.log(this.val(pos));
      let mark = new Cell('mark', 'm', {tile: 'mark'});
      this.val(pos, mark);
    } else {
      return undefined;
    }
  };
}
