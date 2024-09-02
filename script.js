const grid = document.querySelector('.grid');
const scoreDisplay = document.getElementById('score');
const timerDisplay = document.getElementById('timer');
const backText = document.getElementById('back-text');
const languageSelect = document.getElementById('language-select');
const cardTypes = ['card_1', 'card_2', 'card_3', 'card_4', 'card_5', 'card_6', 'card_7'];
let score = 0;
const width = 7;
const height = 7;
let cells = [];
let selectedCell = null;
let touchStartX, touchStartY;
let timeLeft = 120; // 2 minutes in seconds
let currentLanguage = 'en';

const translations = {
    en: {
        back: "Back",
        score: "Score",
        timeUp: "Time's up! Game over.",
        backClicked: "Back button clicked! Add your functionality here."
    },
    ru: {
        back: "Назад",
        score: "Счёт",
        timeUp: "Время вышло! Игра окончена.",
        backClicked: "Кнопка «Назад» нажата! Добавьте сюда свою функциональность."
    },
    kk: {
        back: "Артқа",
        score: "Ұпай",
        timeUp: "Уақыт бітті! Ойын аяқталды.",
        backClicked: "«Артқа» түймесі басылды! Мұнда өз функционалдығыңызды қосыңыз."
    },
    uz: {
        back: "Orqaga",
        score: "Hisob",
        timeUp: "Vaqt tugadi! O'yin tugadi.",
        backClicked: "Orqaga tugmasi bosildi! Bu yerga o'z funksionalligingizni qo'shing."
    },
    ka: {
        back: "უკან",
        score: "ქულა",
        timeUp: "დრო ამოიწურა! თამაში დასრულდა.",
        backClicked: "უკან ღილაკი დაჭერილია! დაამატეთ თქვენი ფუნქციონალი აქ."
    }
};

function updateLanguage() {
    currentLanguage = languageSelect.value;
    backText.textContent = translations[currentLanguage].back;
    updateScore();
}

languageSelect.addEventListener('change', updateLanguage);

// Create the game board
function createBoard() {
    for (let i = 0; i < width * height; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.style.backgroundImage = `url('assets/${cardTypes[Math.floor(Math.random() * cardTypes.length)]}.png')`;
        cell.setAttribute('draggable', true);
        cell.addEventListener('dragstart', dragStart);
        cell.addEventListener('dragover', dragOver);
        cell.addEventListener('dragenter', dragEnter);
        cell.addEventListener('dragleave', dragLeave);
        cell.addEventListener('drop', dragDrop);
        cell.addEventListener('dragend', dragEnd);
        cell.addEventListener('click', handleClick);
        cell.addEventListener('touchstart', handleTouchStart);
        cell.addEventListener('touchmove', handleTouchMove);
        cell.addEventListener('touchend', handleTouchEnd);
        grid.appendChild(cell);
        cells.push(cell);
    }
}

// Drag and drop functions
function dragStart() {
    selectedCell = this;
    setTimeout(() => this.style.opacity = '0.5', 0);
}

function dragOver(e) {
    e.preventDefault();
}

function dragEnter(e) {
    e.preventDefault();
    this.classList.add('hovered');
}

function dragLeave() {
    this.classList.remove('hovered');
}

function dragDrop() {
    this.classList.remove('hovered');
    swapCells(selectedCell, this);
}

function dragEnd() {
    this.style.opacity = '1';
    selectedCell = null;
}

// Touch functions for mobile devices
function handleTouchStart(e) {
    selectedCell = this;
    const touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
}

function handleTouchMove(e) {
    if (!selectedCell) return;
    e.preventDefault();
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartX;
    const deltaY = touch.clientY - touchStartY;
    
    if (Math.abs(deltaX) > 20 || Math.abs(deltaY) > 20) {
        const index = cells.indexOf(selectedCell);
        let targetIndex;
        
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            targetIndex = deltaX > 0 ? index + 1 : index - 1;
        } else {
            targetIndex = deltaY > 0 ? index + width : index - width;
        }
        
        if (targetIndex >= 0 && targetIndex < cells.length) {
            swapCells(selectedCell, cells[targetIndex]);
            selectedCell = null;
        }
    }
}

function handleTouchEnd() {
    selectedCell = null;
}

// Swap cells with animation
function swapCells(cell1, cell2) {
    if (isAdjacent(cell1, cell2)) {
        cell1.classList.add('moving');
        cell2.classList.add('moving');
        
        const tempBg = cell1.style.backgroundImage;
        cell1.style.backgroundImage = cell2.style.backgroundImage;
        cell2.style.backgroundImage = tempBg;
        
        setTimeout(() => {
            cell1.classList.remove('moving');
            cell2.classList.remove('moving');
            checkForMatches();
            fillEmptyCells();
            checkForMatches();
        }, 300);
    }
}

// Check if cells are adjacent
function isAdjacent(cell1, cell2) {
    const index1 = cells.indexOf(cell1);
    const index2 = cells.indexOf(cell2);
    const row1 = Math.floor(index1 / width);
    const col1 = index1 % width;
    const row2 = Math.floor(index2 / width);
    const col2 = index2 % width;
    return (Math.abs(row1 - row2) === 1 && col1 === col2) || (Math.abs(col1 - col2) === 1 && row1 === row2);
}

// Check for matches with animation
function checkForMatches() {
    let matchFound = false;

    // Check horizontal matches
    for (let row = 0; row < height; row++) {
        for (let col = 0; col < width - 2; col++) {
            const index = row * width + col;
            const bg = cells[index].style.backgroundImage;
            if (bg !== '' &&
                bg === cells[index + 1].style.backgroundImage &&
                bg === cells[index + 2].style.backgroundImage) {
                cells[index].classList.add('matched');
                cells[index + 1].classList.add('matched');
                cells[index + 2].classList.add('matched');
                score += 3;
                matchFound = true;
                
                setTimeout(() => {
                    cells[index].style.backgroundImage = '';
                    cells[index + 1].style.backgroundImage = '';
                    cells[index + 2].style.backgroundImage = '';
                    cells[index].classList.remove('matched');
                    cells[index + 1].classList.remove('matched');
                    cells[index + 2].classList.remove('matched');
                }, 500);
            }
        }
    }

    // Check vertical matches
    for (let col = 0; col < width; col++) {
        for (let row = 0; row < height - 2; row++) {
            const index = row * width + col;
            const bg = cells[index].style.backgroundImage;
            if (bg !== '' &&
                bg === cells[index + width].style.backgroundImage &&
                bg === cells[index + width * 2].style.backgroundImage) {
                cells[index].classList.add('matched');
                cells[index + width].classList.add('matched');
                cells[index + width * 2].classList.add('matched');
                score += 3;
                matchFound = true;
                
                setTimeout(() => {
                    cells[index].style.backgroundImage = '';
                    cells[index + width].style.backgroundImage = '';
                    cells[index + width * 2].style.backgroundImage = '';
                    cells[index].classList.remove('matched');
                    cells[index + width].classList.remove('matched');
                    cells[index + width * 2].classList.remove('matched');
                }, 500);
            }
        }
    }

    updateScore();
    return matchFound;
}

// Fill empty cells
function fillEmptyCells() {
    for (let col = 0; col < width; col++) {
        let emptySpaces = 0;
        for (let row = height - 1; row >= 0; row--) {
            const index = row * width + col;
            if (cells[index].style.backgroundImage === '') {
                emptySpaces++;
            } else if (emptySpaces > 0) {
                cells[index + width * emptySpaces].style.backgroundImage = cells[index].style.backgroundImage;
                cells[index].style.backgroundImage = '';
            }
        }
        for (let i = 0; i < emptySpaces; i++) {
            const index = i * width + col;
            cells[index].style.backgroundImage = `url('assets/${cardTypes[Math.floor(Math.random() * cardTypes.length)]}.png')`;
        }
    }
}

// Handle click
function handleClick() {
    if (checkForMatches()) {
        setTimeout(() => {
            fillEmptyCells();
            checkForMatches();
        }, 500);
    }
}

// Update score display
function updateScore() {
    scoreDisplay.textContent = `${translations[currentLanguage].score}: ${score}`;
}

// Timer function
function updateTimer() {
    const minutes = Math.floor(timeLeft / 60);
    let seconds = timeLeft % 60;
    seconds = seconds < 10 ? '0' + seconds : seconds;
    timerDisplay.textContent = `${minutes}:${seconds}`;
    if (timeLeft > 0) {
        timeLeft--;
        setTimeout(updateTimer, 1000);
    } else {
        alert(translations[currentLanguage].timeUp);
        // Here you can add code to end the game or restart
    }
}

// Back button placeholder function
backText.addEventListener('click', () => {
    alert(translations[currentLanguage].backClicked);
});

// Initialize the game
function initGame() {
    createBoard();
    updateTimer();
    updateLanguage();
}

// Start the game
initGame();