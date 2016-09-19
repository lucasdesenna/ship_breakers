export default class Seed {
  constructor(val?: [] = Seed.genVal()) {
    this.val = val;
    this.length = val.length;
  }

  static genVal(length: number): [] {
    length = typeof length !== 'undefined' ? length : 100;
    let val = [];

    for(let s = length; s > 0; s--) {
      val.push(Math.random());
    }

    return val;
  };

  pick(): number {
    let pick = this.val.splice(0, 1)[0];
    this.val.push(pick);

    return pick;
  };

  reset(): void {
    this.val = Seed.genVal(this.length);
  };
}
