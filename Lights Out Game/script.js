document.addEventListener('DOMContentLoaded', function() {
  const size = 8;
  let levels = [];
  let currentLevel = 0;
  let timer;
  let seconds = 0;

  const targetContainer = document.getElementById('target-image');
  const gameBoardContainer = document.getElementById('game-board');
  const levelNumberElement = document.getElementById('level-number');
  const nextLevelButton = document.getElementById('next-level');
  const resetButton = document.getElementById('reset');

  const mainScreen = document.getElementById('main-screen');
  const gameScreen = document.getElementById('game-screen');
  const congratulationsScreen = document.getElementById('congratulations-screen');
  const playButton = document.getElementById('play');
  const tutorialButton = document.getElementById('tutorial');
  const modal = document.getElementById('tutorial-modal');
  const closeModal = document.querySelector('.close');
  const backButton = document.getElementById('back');
  const timerElement = document.getElementById('time');
  const finalTimeElement = document.getElementById('final-time');
  const backToMainButton = document.getElementById('back-to-main');

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
    startTimer(); // Start the timer when loading a new level
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
    loadLevel(currentLevel); // Reload the current level without resetting the timer
  }

  function startTimer() {
    if (timer) clearInterval(timer); // Clear existing timer
    timer = setInterval(() => {
      seconds++;
      updateTimerDisplay();
    }, 1000);
  }

  function updateTimerDisplay() {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    timerElement.textContent = `${formatTime(hours)}:${formatTime(minutes)}:${formatTime(secs)}`;
  }

  function formatTime(value) {
    return value < 10 ? `0${value}` : value;
  }

  function showCongratulationsScreen() {
    clearInterval(timer); // Stop the timer
    finalTimeElement.textContent = timerElement.textContent; // Set final time
    gameScreen.style.display = 'none';
    congratulationsScreen.style.display = 'block';
  }

  playButton.addEventListener('click', function() {
    mainScreen.style.display = 'none';
    gameScreen.style.display = 'block';
    resetGame();
  });

  tutorialButton.addEventListener('click', function() {
    modal.style.display = 'block';
  });

  closeModal.addEventListener('click', function() {
    modal.style.display = 'none';
  });

  backButton.addEventListener('click', function() {
    gameScreen.style.display = 'none';
    mainScreen.style.display = 'block';
    clearInterval(timer); // Stop the timer when going back to main screen
    seconds = 0;
    timerElement.textContent = '00:00:00'; // Reset timer display
  });

  nextLevelButton.addEventListener('click', function() {
    if (currentLevel < levels.length - 1) {
      currentLevel++;
      loadLevel(currentLevel);
    } else {
      showCongratulationsScreen(); // Show congratulations screen when all levels are completed
    }
  });

  resetButton.addEventListener('click', resetGame);

  backToMainButton.addEventListener('click', function() {
    congratulationsScreen.style.display = 'none';
    mainScreen.style.display = 'block';
    seconds = 0;
    timerElement.textContent = '00:00:00'; // Reset timer display
  });

  fetchLevels();
});
