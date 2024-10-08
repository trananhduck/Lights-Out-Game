document.addEventListener('DOMContentLoaded', function () {
    const size = 8;
    let levels = [];
    let currentLevel = 0;
    let timer;
    let seconds = 0;
  
    const mainScreen = document.getElementById('main-screen');
    const gameScreen = document.getElementById('game-screen');
    const congratulationsScreen = document.getElementById('congratulations-screen');
    const playButton = document.getElementById('play');
    const tutorialButton = document.getElementById('tutorial');
    const modal = document.getElementById('tutorial-modal');
    const helpButton = document.getElementById('help');
    const helpModal = document.getElementById('help-modal');
    const closeHelpModal = document.querySelector('.close-help');
    const closeModal = document.querySelector('.close');
    const backButton = document.getElementById('back');
    const exitModal = document.getElementById('exit-modal');
    const closeExitModal = document.querySelector('.close-exit');
    const confirmExitButton = document.getElementById('confirm-exit');
    const cancelExitButton = document.getElementById('cancel-exit');
    const timerElement = document.getElementById('time');
    const finalTimeElement = document.getElementById('final-time');
    const backToMainButton = document.getElementById('back-to-main');
    const undoButton = document.getElementById('undo');
  
    const targetContainer = document.getElementById('target-image');
    const gameBoardContainer = document.getElementById('game-board');
    const levelNumberElement = document.getElementById('level-number');
    const nextLevelButton = document.getElementById('next-level');
    const resetButton = document.getElementById('reset');
    let history = [];
    let historyIndex = -1;
  
    function saveState() {
      const state = {
        currentLevel,
        seconds,
        screen: getCurrentScreen(),
        gameCells: getCurrentState(),
      };
      localStorage.setItem('gameState', JSON.stringify(state));
    }
  
    function loadState() {
      const state = JSON.parse(localStorage.getItem('gameState'));
      if (state) {
        currentLevel = state.currentLevel;
        seconds = state.seconds;
        timerElement.textContent = formatTimeDisplay(seconds);
        displayScreen(state.screen);
        loadLevel(currentLevel);
        applyState(state.gameCells);
      }
    }
  
    function getCurrentScreen() {
      if (mainScreen.style.display === 'none' && gameScreen.style.display === 'block') {
        return 'gameScreen';
      } else if (congratulationsScreen.style.display === 'block') {
        return 'congratulationsScreen';
      } else {
        return 'mainScreen';
      }
    }
  
    function displayScreen(screen) {
      mainScreen.style.display = 'none';
      gameScreen.style.display = 'none';
      congratulationsScreen.style.display = 'none';
  
      if (screen === 'gameScreen') {
        gameScreen.style.display = 'block';
      } else if (screen === 'congratulationsScreen') {
        congratulationsScreen.style.display = 'block';
      } else {
        mainScreen.style.display = 'flex';
      }
    }
  
    function createGrid(container, isTarget = false) {
      container.innerHTML = '';
      const cells = Array.from({ length: size }, () => Array(size).fill(null));
      cells.forEach((row, i) => {
        row.forEach((_, j) => {
          const cell = document.createElement('div');
          cell.classList.add('cell');
          if (!isTarget) {
            cell.addEventListener('click', () => {
              const currentState = getCurrentState();
              toggleCellAndNeighbors(i, j, cells);
              checkLevelCompletion(cells);
              addToHistory(currentState);
              saveState();
            });
          }
          container.appendChild(cell);
          cells[i][j] = cell;
        });
      });
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
      cell.classList.toggle('black');
    }
  
    function setTargetPattern(cells, pattern) {
      pattern.forEach(([row, col]) => {
        toggleCellAndNeighbors(row, col, cells);
      });
    }
  
    function checkPatternMatch(targetCells, gameCells) {
      return targetCells.every((row, i) => row.every((cell, j) => cell.classList.contains('black') === gameCells[i][j].classList.contains('black')));
    }
  
    function checkLevelCompletion(gameCells) {
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
      checkLevelCompletion(gameCells);
      startTimer();
    }
  
    function fetchLevels() {
      fetch('levels.json')
        .then(response => response.json())
        .then(data => {
          levels = data;
          loadState(); // Load the state after fetching levels
        })
        .catch(error => console.error('Error fetching levels:', error));
    }
  
    function resetGame() {
      loadLevel(currentLevel);
    }
  
    function startTimer() {
      clearInterval(timer);
      timer = setInterval(() => {
        seconds++;
        updateTimerDisplay();
        saveState();
      }, 1000);
    }
  
    function updateTimerDisplay() {
      timerElement.textContent = formatTimeDisplay(seconds);
    }
  
    function formatTimeDisplay(seconds) {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      return `${formatTime(hours)}:${formatTime(minutes)}:${formatTime(secs)}`;
    }
  
    function formatTime(value) {
      return value < 10 ? `0${value}` : value;
    }
  
    function showCongratulationsScreen() {
      clearInterval(timer);
      finalTimeElement.textContent = timerElement.textContent;
      gameScreen.style.display = 'none';
      congratulationsScreen.style.display = 'block';
      saveState();
    }
  
    playButton.addEventListener('click', () => {
      mainScreen.style.display = 'none';
      gameScreen.style.display = 'block';
      currentLevel = 0;
      seconds = 0;
      timerElement.textContent = '00:00:00';
      resetGame();
      saveState();
    });
  
    tutorialButton.addEventListener('click', () => {
      modal.style.display = 'block';
    });
  
    closeModal.addEventListener('click', () => {
      modal.style.display = 'none';
    });
  
    window.addEventListener('click', (event) => {
      if (event.target == modal) {
        modal.style.display = 'none';
      }
    });
  
    backButton.addEventListener('click', () => {
      exitModal.style.display = 'block';
    });
  
    closeExitModal.addEventListener('click', () => {
      exitModal.style.display = 'none';
    });
  
    cancelExitButton.addEventListener('click', () => {
      exitModal.style.display = 'none';
    });
  
    confirmExitButton.addEventListener('click', () => {
      clearInterval(timer);
      seconds = 0;
      timerElement.textContent = '00:00:00';
      exitModal.style.display = 'none';
      gameScreen.style.display = 'none';
      mainScreen.style.display = 'flex';
      localStorage.removeItem('gameState'); // Clear the saved state
    });
  
    helpButton.addEventListener('click', () => {
      helpModal.style.display = 'block';
    });
  
    closeHelpModal.addEventListener('click', () => {
      helpModal.style.display = 'none';
    });
  
    window.addEventListener('click', (event) => {
      if (event.target == helpModal) {
        helpModal.style.display = 'none';
      }
    });
  
    nextLevelButton.addEventListener('click', () => {
      currentLevel++;
      if (currentLevel < levels.length) {
        loadLevel(currentLevel);
      } else {
        showCongratulationsScreen();
        startConfetti();
      }
      saveState();
    });
  
    resetButton.addEventListener('click', resetGame);
  
    backToMainButton.addEventListener('click', () => {
      congratulationsScreen.style.display = 'none';
      mainScreen.style.display = 'flex';
      localStorage.removeItem('gameState'); // Clear the saved state
    });
  
    function addToHistory(state) {
      if (historyIndex < history.length - 1) {
        history = history.slice(0, historyIndex + 1);
      }
      history.push(state);
      historyIndex++;
      undoButton.disabled = false;
    }
  
    function undo() {
      if (historyIndex >= 0) {
        const state = history[historyIndex];
        historyIndex--;
        applyState(state);
        if (historyIndex < 0) {
          undoButton.disabled = true;
        }
        saveState();
      }
    }
  
    function getCurrentState() {
      return Array.from(document.querySelectorAll('#game-board .cell')).map(cell => cell.classList.contains('black'));
    }
  
    function applyState(state) {
      const cells = document.querySelectorAll('#game-board .cell');
      cells.forEach((cell, index) => {
        cell.classList.toggle('black', state[index]);
      });
    }
  
    undoButton.addEventListener('click', undo);
  
    function startConfetti() {
      const duration = 5 * 1000; // Thời gian hiệu ứng pháo hoa (5 giây)
      const end = Date.now() + duration;
  
      (function frame() {
        // Kích hoạt hiệu ứng pháo hoa
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
        });
  
        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      })();
    }
  
    // Load levels and state when the page is loaded
    fetchLevels();
  });
  
