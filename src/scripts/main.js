/* eslint-disable no-console */
'use strict';

const Game = require('../modules/Game.class');
const game = new Game();

const startBtn = document.querySelector('.start');
const scoreDisplay = document.querySelector('.game-score');
const fieldCells = document.querySelectorAll('.field-cell');
const messageStart = document.querySelector('.message-start');
const messageWin = document.querySelector('.message-win');
const messageLose = document.querySelector('.message-lose');

function renderBoard(board) {
  console.log(board);

  fieldCells.forEach((cell, index) => {
    const row = Math.floor(index / 4);
    const col = index % 4;
    const value = board[row][col];

    cell.textContent = value !== 0 ? value : '';

    cell.className = 'field-cell';

    if (value !== 0) {
      cell.classList.add(`field-cell--${value}`);
    }
  });
}

function showMessage(element, type) {
  if (game.getStatus() === type) {
    element.classList.remove('hidden');
  } else {
    element.classList.add('hidden');
  }
}

function upDateUI() {
  renderBoard(game.getState());
  scoreDisplay.textContent = game.getScore();

  showMessage(messageWin, 'win');
  showMessage(messageLose, 'lose');
  showMessage(messageStart, 'idle');
}

startBtn.addEventListener('click', () => {
  console.log(game.getStatus());

  if (game.getStatus() === 'idle') {
    game.start();
    startBtn.textContent = 'Restart';
    startBtn.classList.remove('start');
    startBtn.classList.add('restart');
  } else {
    game.restart();
  }

  console.log(game.getStatus());

  upDateUI();
});

document.addEventListener('keydown', (ev) => {
  console.log(game.getStatus(), ev.key);
  console.log(game.board);

  if (game.getStatus() !== 'playing') {
    return;
  }

  let moved = false;

  switch (ev.key) {
    case 'ArrowUp':
      console.log('in case Up');

      game.moveUp();
      console.log(game.getState());
      moved = true;
      break;
    case 'ArrowDown':
      game.moveDown();
      moved = true;
      break;
    case 'ArrowLeft':
      game.moveLeft();
      moved = true;
      break;
    case 'ArrowRight':
      game.moveRight();
      moved = true;
      break;
    default:
      return;
  }

  if (moved) {
    upDateUI();
  }
});

// Write your code here
