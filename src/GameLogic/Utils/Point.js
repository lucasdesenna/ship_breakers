import Tool from './Tool';

export default class Point {
  constructor(x: number = 0,
              y: number = 0,
              z: number = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  distanceTo(point: Point): number {
    return Math.sqrt(Math.pow(Math.abs(point.x - this.x), 2) +
                     Math.pow(Math.abs(point.y - this.y), 2) +
                     Math.pow(Math.abs(point.z - this.z), 2));
  }

  subtract(point: Point): Point {
    return new Point(this.x - point.x,
                     this.y - point.y,
                     this.z - point.z);
  }

  sum(point: Point): Point {
    return new Point(this.x + point.x,
                     this.y + point.y,
                     this.z + point.z);
  }

  toTopLeft(matrix: Matrix): Point {
    let center = matrix.center;

    return new Point(this.x - center.x,
                     this.y - center.y,
                     this.z - center.z);
  }

  toCenter(matrix: Matrix): Point {
    let center = matrix.center;
    return this.sum(center);
  };

  toGrid(): Point {
    return new Point(Math.round(this.x),
                     Math.round(this.y),
                     Math.round(this.z));
  };

  flatten(): Point {
    return new Point(this.x,
                     this.y,
                     0);
  };

  up(steps: number = 1): Point {
    let _y = this.y - steps;

    return new Point(this.x, _y, this.z);
  };

  right(steps: number = 1): Point {
    let _x = this.x + steps;

    return new Point(_x, this.y, this.z);
  };

  down(steps: number = 1): Point {
    let _y = this.y + steps;

    return new Point(this.x, _y, this.z);
  };

  left(steps: number = 1): Point {
    let _x = this.x - steps;

    return new Point(_x, this.y, this.z);
  };

  inAxis(axis: string, radius: number = 1): [any] {
    let inAxis = [];

    for(let i = this[axis] - radius; i <= this[axis] + radius; i++) {
      let n;
      if(axis === 'x') {
        n = new Point(i, this.y, this.z);
      } else if(axis === 'y') {
        n = new Point(this.x, i, this.z);
      } else if(axis === 'z') {
        n = new Point(this.x, this.y, i);
      }

      inAxis.push(n);
    }

    return inAxis;
  };

  parallelsInAxis(axis: string,
                  distance: number = 1,
                  length: number = 1) {
    let splitLength = Math.floor((length - 1) / 2);
    let parallels = [];

    for(let i = this[axis] - splitLength; i <= this[axis] + splitLength; i++) {
      let p;

      if(axis === 'x') {
        p = new Point(i, this.y, this.z);
        parallels.push(p.up(distance));
        parallels.push(p.down(distance));
      } else if(axis === 'y') {
        p = new Point(this.x, i, this.z);
        parallels.push(p.right(distance));
        parallels.push(p.left(distance));
      }// else if(axis === 'z') { change to make 3D work
      //   p = new Point(this.x, this.y, i);
      // }
    }

    return parallels;
  };

  parallels(distance: number = 1, length: number = 1): [] {
    let parallels = [];

    parallels = parallels.concat(this.parallelsInAxis('x', distance, length));
    parallels = parallels.concat(this.parallelsInAxis('y', distance, length));

    return parallels;
  };

  neighborsInAxis(axis: string, radius: number = 1): [] {
    let neighbors = [];

    for(let i = this[axis] - radius; i <= this[axis] + radius; i++) {
      let n;

      if(axis === 'x') {
        n = new Point(i, this.y, this.z);
      } else if(axis === 'y') {
        n = new Point(this.x, i, this.z);
      } else if(axis === 'z') {
        n = new Point(this.x, this.y, i);
      }

      if(
        !(n.x === this.x &&
        n.y === this.y &&
        n.z === this.z)
      ) {
        neighbors.push(n);
      }
    }

    return neighbors;
  };

  neighbors(radius: number = 1): [] {
    let neighborsX = this.neighborsInAxis('x', radius);
    let neighborsY = this.neighborsInAxis('y', radius);

    let neighbors = neighborsX.concat(neighborsY);

    return neighbors;
  };

  randRelativePoint(xRange: [number, number] = [0, 10],
                    yRange: [number, number] = [0, 10],
                    zRange: [number, number] = [0, 10]): Point {
    let point = new Point(
      this.x + Tool.randRange(xRange[0], xRange[1]),
      this.y + Tool.randRange(yRange[0], yRange[1]),
      this.z + Tool.randRange(zRange[0], zRange[1])
    );

    return point;
  };

  randRadialPoint(minRadius, maxRadius, flat: boolean = true): Point {
    let radius = Tool.randRange(minRadius, maxRadius);
    let angle = Tool.randRange(0, 359) * Math.PI / 180;
    let zShift;

    if(flat === true) {
      zShift = 0;
    } else {
      zShift = Tool.randRange(-radius, radius);
    }

    let point = new Point(
      this.x + Math.cos(angle) * radius,
      this.y + Math.sin(angle) * radius,
      this.z + zShift
    );

    return point;
  };

  dirTo(tgtPoint: Point): string {
    let xDelta = Math.abs(this.x - tgtPoint.x);
    let yDelta = Math.abs(this.y - tgtPoint.y);
    // let zDelta = Math.abs(this.z - tgtPoint.z);

    if(xDelta > yDelta) {
      if(this.x < tgtPoint.x) return 'right';
      if(this.x > tgtPoint.x) return 'left';
    } else if(xDelta < yDelta) {
      if(this.y > tgtPoint.y) return 'up';
      if(this.y < tgtPoint.y) return 'down';
    } else {
      console.error('diagonal alert!');
    }

  };
}
