export default class Boundaries {
  constructor(x: number = 1,
              y: number = 1, 
              z: number = 1) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  redefine(x: number = this.x,
           y: number = this.y,
           z: number = this.z): Boundaries {
    this.x = x || this.x;
    this.y = y || this.y;
    this.z = z || this.z;

    return this;
  }

}
