document.addEventListener('DOMContentLoaded', function() {
    const size = 8;
    let levels = [];
    let currentLevel = 0;
  
    const targetContainer = document.getElementById('target-image');
    const gameBoardContainer = document.getElementById('game-board');
    const levelNumberElement = document.getElementById('level-number');
    const nextLevelButton = document.getElementById('next-level');
    const resetButton = document.getElementById('reset');
  
    const mainScreen = document.getElementById('main-screen');
    const gameScreen = document.getElementById('game-screen');
    const playButton = document.getElementById('play');
    const tutorialButton = document.getElementById('tutorial');
    const modal = document.getElementById('tutorial-modal');
    const closeModal = document.querySelector('.close');
  
    let targetCells = [];
    let gameCells = [];
  
    function createGrid(container, isTarget = false) {
      container.innerHTML = '';
      const cells = [];
      for (let i = 0; i < size; i++) {
        cells[i] = [];
        for (let j = 0; j < size; j++) {
          const cell = document.createElement('div');
          cell.classList.add('cell');
          if (!isTarget) {
            cell.addEventListener('click', function() {
              toggleCellAndNeighbors(i, j, cells);
              checkLevelCompletion(targetCells, cells);
            });
          }
          container.appendChild(cell);
          cells[i][j] = cell;
        }
      }
      return cells;
    }
  
    function toggleCellAndNeighbors(row, col, cells) {
      toggleCellColor(cells[row][col]);
      if (row > 0) toggleCellColor(cells[row - 1][col]);
      if (row < size - 1) toggleCellColor(cells[row + 1][col]);
      if (col > 0) toggleCellColor(cells[row][col - 1]);
      if (col < size - 1) toggleCellColor(cells[row][col + 1]);
    }
  
    function toggleCellColor(cell) {
      if (cell) {
        cell.classList.toggle('black');
      }
    }
  
    function setTargetPattern(targetCells, pattern) {
      pattern.forEach(([row, col]) => {
        toggleCellAndNeighbors(row, col, targetCells);
      });
    }
  
    function checkPatternMatch(targetCells, gameCells) {
      for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
          if (targetCells[i][j].classList.contains('black') !== gameCells[i][j].classList.contains('black')) {
            return false;
          }
        }
      }
      return true;
    }
  
    function checkLevelCompletion(targetCells, gameCells) {
      if (checkPatternMatch(targetCells, gameCells)) {
        nextLevelButton.disabled = false;
      }
    }
  
    function loadLevel(level) {
      levelNumberElement.textContent = level + 1;
      targetCells = createGrid(targetContainer, true);
      gameCells = createGrid(gameBoardContainer);
      setTargetPattern(targetCells, levels[level]);
      nextLevelButton.disabled = true;
      checkLevelCompletion(targetCells, gameCells);
    }
  
    function fetchLevels() {
      fetch('levels.json')
        .then(response => response.json())
        .then(data => {
          levels = data;
          loadLevel(currentLevel);
        })
        .catch(error => console.error('Error fetching levels:', error));
    }
  
    function resetGame() {
      loadLevel(currentLevel);
    }
  
    nextLevelButton.addEventListener('click', function() {
      if (currentLevel < levels.length - 1) {
        currentLevel++;
        loadLevel(currentLevel);
      } else {
        alert('You have completed all levels!');
      }
    });
  
    resetButton.addEventListener('click', resetGame);
  
    playButton.addEventListener('click', function() {
      mainScreen.style.display = 'none';
      gameScreen.style.display = 'block';
    });
  
    tutorialButton.addEventListener('click', function() {
      modal.style.display = 'block';
    });
  
    closeModal.addEventListener('click', function() {
      modal.style.display = 'none';
    });
  
    window.addEventListener('click', function(event) {
      if (event.target === modal) {
        modal.style.display = 'none';
      }
    });
  
    fetchLevels();
  });
  
