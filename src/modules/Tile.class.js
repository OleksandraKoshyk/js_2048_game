'use strict';

class Tile {
  constructor(value, row, col) {
    this.value = value;
    this.row = row;
    this.col = col;
    this.previousPosition = null;
    this.mergedFrom = null;
  }

  savePosition() {
    this.previousPosition = { row: this.row, col: this.col };
  }

  updatePosition(row, col) {
    this.row = row;
    this.col = col;
  }
}

module.exports = Tile;
