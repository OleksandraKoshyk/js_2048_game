'use strict';

const Tile = require('./Tile.class');

/**
 * This class represents the game.
 * Now it has a basic structure, that is needed for testing.
 * Feel free to add more props and methods if needed.
 */
class Game {
  /**
   * Creates a new game instance.
   *
   * @param {number[][]} initialState
   * The initial state of the board.
   * @default
   * [[0, 0, 0, 0],
   *  [0, 0, 0, 0],
   *  [0, 0, 0, 0],
   *  [0, 0, 0, 0]]
   *
   * If passed, the board will be initialized with the provided
   * initial state.
   */
  constructor(initialState) {
    this.boardSize = 4;
    this.board = initialState || this.#createEmptyBoard();
    this.score = 0;
    this.status = 'idle';
    this.winNumber = 2048;
    this.tiles = [];
  }

  moveLeft() {
    this.#move('left');
  }

  moveRight() {
    this.#move('right');
  }
  moveUp() {
    this.#move('up');
  }
  moveDown() {
    this.#move('down');
  }

  /**
   * @returns {number}
   */
  getScore() {
    return this.score;
  }

  /**
   * @returns {number[][]}
   */
  getState() {
    return this.board.map((row) => [...row]);
  }

  /**
   * Returns the current game status.
   *
   * @returns {string} One of: 'idle', 'playing', 'win', 'lose'
   *
   * `idle` - the game has not started yet (the initial state);
   * `playing` - the game is in progress;
   * `win` - the game is won;
   * `lose` - the game is lost
   */
  getStatus() {
    return this.status;
  }

  /**
   * Starts the game.
   */
  start() {
    this.status = 'playing';
    this.board = this.#createEmptyBoard();
    this.score = 0;
    this.#addRandomTile();
    this.#addRandomTile();
  }

  /**
   * Resets the game.
   */
  restart() {
    this.status = 'idle';
    this.start();
  }

  #createEmptyBoard() {
    return Array.from({ length: this.boardSize }, () => {
      return Array(this.boardSize).fill(0);
    });
  }

  #getEmptyCells() {
    const emptyCells = [];

    for (let row = 0; row < this.boardSize; row++) {
      for (let col = 0; col < this.boardSize; col++) {
        if (this.board[row][col] === 0) {
          emptyCells.push({ row, col });
        }
      }
    }

    return emptyCells;
  }

  #addRandomTile() {
    const emptyCells = this.#getEmptyCells();

    if (emptyCells.length === 0) {
      return;
    }

    const randomIndex = Math.floor(Math.random() * emptyCells.length);
    const { row, col } = emptyCells[randomIndex];
    const newValue = Math.random() < 0.9 ? 2 : 4;

    const newTile = new Tile(newValue, row, col);

    this.tiles.push(newTile);
    this.board[row][col] = newValue;
  }

  #slideAndMergeLine(line) {
    let changed = false;
    let mergerScore = 0;
    let newLine = line.filter((val) => val !== 0);

    for (let i = 0; i < newLine.length - 1; i++) {
      if (newLine[i] === newLine[i + 1]) {
        newLine[i] *= 2;
        newLine[i + 1] = 0;
        mergerScore += newLine[i];
        changed = true;
      }
    }
    newLine = newLine.filter((val) => val !== 0);

    while (newLine.length < this.boardSize) {
      newLine.push(0);
    }

    if (newLine.join('') !== line.join('')) {
      changed = true;
    }

    return { newLine, mergerScore, changed };
  }

  #move(direction) {
    if (this.status !== 'playing') {
      return;
    }

    this.tiles.forEach((tile) => tile.savePosition());

    let boardChanged = false;
    let currentMoveScore = 0;

    if (direction === 'left' || direction === 'right') {
      for (let row = 0; row < this.boardSize; row++) {
        const originalRow = [...this.board[row]];
        const modifiedRow =
          direction === 'right' ? originalRow.reverse() : originalRow;
        const { newLine, mergerScore, changed } =
          this.#slideAndMergeLine(modifiedRow);

        this.board[row] = direction === 'right' ? newLine.reverse() : newLine;
        currentMoveScore += mergerScore;

        if (changed) {
          boardChanged = true;
          this.tiles.forEach((tile) => tile.savePosition());
        }
      }
    } else {
      for (let col = 0; col < this.boardSize; col++) {
        const originalCol = this.board.map((row) => row[col]);
        const modifiedCol =
          direction === 'down' ? [...originalCol].reverse() : originalCol;
        const { newLine, mergerScore, changed } =
          this.#slideAndMergeLine(modifiedCol);

        const finalCol = direction === 'down' ? newLine.reverse() : newLine;

        for (let row = 0; row < this.boardSize; row++) {
          this.board[row][col] = finalCol[row];
        }

        currentMoveScore += mergerScore;

        if (changed) {
          boardChanged = true;
        }
      }
    }
    this.#finalizeMove(boardChanged, currentMoveScore);
  }

  #finalizeMove(boardChanged, currentMoveScore) {
    if (boardChanged) {
      this.score += currentMoveScore;
      this.#addRandomTile();
      this.#checkGameStatus();
    }
  }

  #checkWinCondition() {
    if (this.status === 'playing') {
      for (let row = 0; row < this.boardSize; row++) {
        for (let col = 0; col < this.boardSize; col++) {
          if (this.board[row][col] === this.winNumber) {
            this.status = 'win';

            return;
          }
        }
      }
    }
  }

  #isGameOver() {
    if (this.#getEmptyCells().length > 0) {
      return false;
    }

    const tempBoard = this.getState();

    for (let row = 0; row < this.boardSize; row++) {
      const originalRow = [...tempBoard[row]];
      const { changed } = this.#slideAndMergeLine(originalRow);

      if (changed) {
        return false;
      }
    }

    for (let col = 0; col < this.boardSize; col++) {
      const originalCol = [];

      for (let row = 0; row < this.boardSize; row++) {
        originalCol.push(tempBoard[row][col]);
      }

      const { changed } = this.#slideAndMergeLine(originalCol);

      if (changed) {
        return false;
      }
    }

    return true;
  }

  #checkGameStatus() {
    if (this.status === 'win' || this.status === 'lose') {
      return;
    }
    this.#checkWinCondition();

    if (this.status === 'win') {
      return;
    }

    if (this.#isGameOver()) {
      this.status = 'lose';
    }
  }
}

module.exports = Game;
