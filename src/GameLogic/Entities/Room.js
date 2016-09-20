import Cell from './Cell';
import RoomCell from './Cell/RoomCell';
import Tool from '../Utils/Tool';
import Matrix from '../Utils/Matrix';
import Boundaries from '../Utils/Boundaries';

export default class Room {
  constructor(id: id, size: string, shape: string): void {
    this.id = id;
    this.size = size;
    this.shape = shape;

    let boundaries = Room.gen.boundaries(size);
    this.matrix = Room.gen.matrix(id, boundaries, shape);
  }

  static gen = {
    matrix: function(id, boundaries, shape) {
      let matrix = new Matrix(boundaries);
      Room.gen.shape(matrix, shape);

      matrix.iterate(function(m, x, y, z) {
        let cell = m.body[x][y][z];
        if(cell.type === 'room') {
          cell.id = id;
        }
      });

      return matrix;
    },

    boundaries: function(size) {
      let boundaries;
      if(size === 'random') {
        boundaries = Tool.randAttr(Room.gen.size)();
      } else {

        boundaries = Room.gen.size[size]();
      }

      return boundaries;
    },

    size: {
      small: function() {
        let boundaries = new Boundaries(
          Tool.randAttr([3, 5]),
          Tool.randAttr([3, 5]),
          Tool.randAttr([1, 3])
        );

        return boundaries;
      },

      medium: function() {
        let boundaries = new Boundaries(
          Tool.randAttr([5, 7]),
          Tool.randAttr([5, 7]),
          Tool.randAttr([1, 3, 5])
        );

        return boundaries;
      },

      large: function() {
        let boundaries = new Boundaries(
          Tool.randAttr([7, 9, 11]),
          Tool.randAttr([7, 9, 11]),
          Tool.randAttr([1, 3, 5, 7])
        );

        return boundaries;
      },

      huge: function() {
        let boundaries = new Boundaries(
          Tool.randAttr([11, 13, 15, 17, 19, 21]),
          Tool.randAttr([11, 13, 15, 17, 19, 21]),
          Tool.randAttr([3, 5, 7, 9])
        );

        return boundaries;
      }
    },

    shape: function(matrix, shape) {
      if(shape === 'random') {
        Tool.randAttr(Room.gen.shapes)(matrix);
      } else {
        Room.gen.shapes[shape](matrix);
      }
    },

    shapes: {
      rectangle: function(matrix) {
        matrix.flatten();
        matrix.fill(Room.gen.geometry.cuboid);
      },

      cuboid: function(matrix) {
        matrix.fill(Room.gen.geometry.cuboid);
      },

      ellipse: function(matrix) {
        matrix.flatten();
        matrix.fill(Room.gen.geometry.ellipticCylinder);
      },

      ellipticCylinder: function(matrix) {
        matrix.fill(Room.gen.geometry.ellipticCylinder);
      },

      semiCircle: function(matrix) {

        return matrix;
      },

      ellipsoid: function(matrix) {

        return matrix;
      },

      semiSphere: function(matrix) {

        return matrix;
      },

      torus: function(matrix) {

        return matrix;
      },

      T: function(matrix) {

        return matrix;
      },

      Y: function(matrix) {

        return matrix;
      },

      cross: function(matrix) {

        return matrix;
      }
    },

    geometry: {
      cuboid: function(matrix) {
        return new RoomCell();
      },

      ellipticCylinder: function(matrix, x, y) {
        if(Math.pow((x - 0.5 - matrix.boundaries.x / 2) / (matrix.boundaries.x / 2), 2) + Math.pow((y - 0.5 - matrix.boundaries.y / 2) / (matrix.boundaries.y / 2), 2) <= 1) {
          return new RoomCell();
        } else {
          return new Cell();
        }

      }
    }
  };

  expand(radius) {
    return this.matrix.expand(radius);
  };

  clone(id) {
    let clone = new Room(id, this.size, this.shape);

    clone.matrix = Room.gen.matrix(id, this.matrix.boundaries, this.shape);

    return clone;
  };
}
