import Tool from './Tool';

export default class Builder {
  constructor(engineer, job, jobCondition, options): void {
    job = typeof job !== 'undefined' ? job : Builder.defaults.job;
    jobCondition = typeof jobCondition !== 'undefined' ? jobCondition : Builder.defaults.jobCondition;

    options = typeof options !== 'undefined' ? options : {};
    options.type = typeof options.type !== 'undefined' ? options.type : Builder.defaults.type;
    options.paddings = typeof options.paddings !== 'undefined' ? options.paddings : Builder.defaults.paddings;
    options.life = typeof options.life !== 'undefined' ? options.life : Builder.defaults.life(engineer.tgtMatrix);
    options.width = typeof options.width !== 'undefined' ? options.width : Builder.defaults.width;
    options.dodgy = typeof options.dodgy !== 'undefined' ? options.dodgy : Builder.defaults.dodgy;
    options.chanceToTurn = typeof options.chanceToTurn !== 'undefined' ? options.chanceToTurn : Builder.defaults.chanceToTurn;
    options.chanceToSpawn = typeof options.chanceToSpawn !== 'undefined' ? options.chanceToSpawn : Builder.defaults.chanceToSpawn;

    this.engineer = engineer;
    this.id = engineer.buildersCount;
    this.tgtMatrix = engineer.tgtMatrix;
    this.isAlive = true;
    this.options = options;

    options.startingPos = typeof options.startingPos !== 'undefined' ? options.startingPos : Builder.defaults.startingPos(this);
    this.options.startingPos = options.startingPos;
    this.pos = options.startingPos;

    options.startingDir = typeof options.startingDir !== 'undefined' ? options.startingDir : Builder.defaults.startingDir(this);
    this.options.startingDir = options.startingDir;
    this.direction = options.startingDir;

    this.primaryAxis = '';
    this.secondaryAxis = '';
    this.updateAxes();

    this.job = job;
    this.jobCondition = jobCondition;
  }

  static defaults = {
    type: 'builder',
    job: function(builder) { console.log(builder.pos); },
    jobCondition: function() { return true; },
    startingPos: function(builder) {
      let tgtMatrix = builder.tgtMatrix;
      let paddings = builder.options.paddings;

      return Tool.randPos([paddings, tgtMatrix.boundaries.x - paddings - 1], [paddings, tgtMatrix.boundaries.y - paddings - 1], [0, 0]);
    },
    startingDir: function(builder) {
      return Tool.randAttr(['up', 'right', 'down', 'left']);
    },
    life: function(tgtMatrix) {
      let boundaries = tgtMatrix.boundaries;
      let avrgDimension = (boundaries.x + boundaries.y) / 2;

      return Tool.randRange(avrgDimension * 0.2, avrgDimension * 0.4);
    },
    width: 1,
    dodgy: false,
    paddings: 1,
    chanceToTurn: 5,
    chanceToSpawn: 70,
  };

  updateAxes() {
    let pAxis = Tool.dirToAxis(this.direction);
    let sAxis = Tool.perpendicularAxis(pAxis);

    this.primaryAxis = pAxis;
    this.secondaryAxis = sAxis;
  };

  work() {
    if(this.checkPos()) {
      this.job(this);

      let builder = this;

      this.mayDo(this.options.chanceToSpawn, function() {
        builder.spawn();
      });

      this.moveOrTurn();

      this.age();
    } else {
      this.die();
    }
  };

  age() {
    if(this.isAlive) {
      this.options.life--;

      if(this.options.life <= 0) {
        // console.log('died of old age');
        this.die();
      }
    }
  };

  die() {
    this.isAlive = false;
  };

  possibleDirections(pos: Point = this.pos, excludeCurrentAndReverse: boolean = false) {
    let directions = ['up', 'right', 'down', 'left'];
    let direction;
    let pDirections = [];
    let newPos;

    for(let d in directions) {
      direction = directions[d];
      newPos = pos[direction]();

      if(
        this.tgtMatrix.contains(newPos) &&
        (!excludeCurrentAndReverse ||
          (excludeCurrentAndReverse &&
            direction !== this.reverseDirection() &&
            direction !== this.direction)
          )
        ) {
          pDirections.push(direction);
        }
      }

      return pDirections;
    };

    moveOrTurn() {
      let self = this;
      let validMove = this.validMove();
      let validDirections = this.validDirections();

      if(this.isAlive) {
        if(validMove !== false && validDirections !== false) {
          this.mayDo(this.options.chanceToTurn, function() {
            self.turn(validDirections);
          }, function() {
            self.move(validMove);
          });
        } else if(this.options.dodgy) {
          if(validMove !== false) {
            this.move(validMove);
          } else if(validDirections !== false) {
            this.turn(validDirections);
          } else {
            this.die();
          }
        } else if(validMove !== false) {
          this.move(validMove);
        } else {
          this.die();
        }
      }
    };

    move(validMove): void {
      // console.log('moved');

      this.pos = validMove;
    };

    turn(validDirections): void {
      // console.log('turned');

      let newDirection = Tool.randAttr(validDirections);
      this.direction = newDirection;
      this.updateAxes();

      this.pos = this.pos[newDirection](this.options.width);
      this.job(this);
      this.pos = this.pos[newDirection](this.options.width);
    };

    reverseDirection(direction = this.direction): string {
      switch(direction) {
        case 'up':
          return 'down';

        case 'right':
          return 'left';

        case 'down':
          return 'up';

        case 'left':
          return 'right';

        default:
          console.error('invalid direction');
          return null;
      }
    };

    spawn(type: string = this.type, options) {
      options.startingPos = typeof options.startingPos !== 'undefined' ? options.startingPos : this.pos;

      if(this.isAlive) {
        this.engineer.addBuilder(type, options);
        // console.log('spawned');
      }
    };

    mayDo(chanceToDo: number, task, otherwise) {
      if(this.isAlive && Tool.randPercent() <= chanceToDo) {
        task();
      } else if(typeof otherwise === 'function') {
        otherwise();
      }
    };

    validMove(pos: Point = this.pos, direction: string = this.direction) {
      let width = this.options.width;
      let distance = Math.ceil(width / 2);
      let newPos = pos[direction](distance);

      if(
        this.checkPos(newPos, direction)
      ) {
        return newPos;
      } else {
        return false;
      }
    };

    validDirections(pos: Point = this.pos): [] {
      let newPos = pos;
      let pos0 = newPos;
      let pDirections = this.possibleDirections(pos0, true);
      let direction;
      let vDirections = [];

      for(let pD in pDirections) {
        direction = pDirections[pD];

        if(
          this.validMove(pos0[direction](), direction) !== false &&
          this.validMove(pos0[direction](2), direction) !== false
        ) {
          vDirections.push(direction);
        }
      }

      if(vDirections.length > 0) {
        return vDirections;
      } else {
        return null;
      }
    };

    checkPos(pos: Point = this.pos, direction: string = this.direction): boolean {
      if(
        this.tgtMatrix.contains(pos, true) &&
        this.jobCondition(this, pos, direction)
      ) {
        return true;
      }

      return false;
    };
}
