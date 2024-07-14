const grid = document.querySelector('.grid');
const scoreDisplay = document.getElementById('score');
const colors = ['red', 'yellow', 'green', 'blue', 'purple'];
let score = 0;
const width = 7;
const height = 7;
let cells = [];
let selectedCell = null;
let touchStartX, touchStartY;

// Создание игрового поля
function createBoard() {
    for (let i = 0; i < width * height; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
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

// Функции для перетаскивания на десктопе
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

// Функции для сенсорных устройств
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
            // Горизонтальное движение
            targetIndex = deltaX > 0 ? index + 1 : index - 1;
        } else {
            // Вертикальное движение
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

// Обмен ячейками
function swapCells(cell1, cell2) {
    if (isAdjacent(cell1, cell2)) {
        const tempColor = cell1.style.backgroundColor;
        cell1.style.backgroundColor = cell2.style.backgroundColor;
        cell2.style.backgroundColor = tempColor;
        checkForMatches();
        fillEmptyCells();
        checkForMatches(); // Проверяем еще раз после заполнения
    }
}

// Проверка, являются ли ячейки соседними
function isAdjacent(cell1, cell2) {
    const index1 = cells.indexOf(cell1);
    const index2 = cells.indexOf(cell2);
    const row1 = Math.floor(index1 / width);
    const col1 = index1 % width;
    const row2 = Math.floor(index2 / width);
    const col2 = index2 % width;
    return (Math.abs(row1 - row2) === 1 && col1 === col2) || (Math.abs(col1 - col2) === 1 && row1 === row2);
}

// Проверка совпадений
function checkForMatches() {
    let matchFound = false;

    // Проверка горизонтальных совпадений
    for (let row = 0; row < height; row++) {
        for (let col = 0; col < width - 2; col++) {
            const index = row * width + col;
            const color = cells[index].style.backgroundColor;
            if (color !== '' &&
                color === cells[index + 1].style.backgroundColor &&
                color === cells[index + 2].style.backgroundColor) {
                cells[index].style.backgroundColor = '';
                cells[index + 1].style.backgroundColor = '';
                cells[index + 2].style.backgroundColor = '';
                score += 3;
                matchFound = true;
            }
        }
    }

    // Проверка вертикальных совпадений
    for (let col = 0; col < width; col++) {
        for (let row = 0; row < height - 2; row++) {
            const index = row * width + col;
            const color = cells[index].style.backgroundColor;
            if (color !== '' &&
                color === cells[index + width].style.backgroundColor &&
                color === cells[index + width * 2].style.backgroundColor) {
                cells[index].style.backgroundColor = '';
                cells[index + width].style.backgroundColor = '';
                cells[index + width * 2].style.backgroundColor = '';
                score += 3;
                matchFound = true;
            }
        }
    }

    scoreDisplay.textContent = score;
    return matchFound;
}

// Заполнение пустых ячеек
function fillEmptyCells() {
    for (let col = 0; col < width; col++) {
        let emptySpaces = 0;
        for (let row = height - 1; row >= 0; row--) {
            const index = row * width + col;
            if (cells[index].style.backgroundColor === '') {
                emptySpaces++;
            } else if (emptySpaces > 0) {
                cells[index + width * emptySpaces].style.backgroundColor = cells[index].style.backgroundColor;
                cells[index].style.backgroundColor = '';
            }
        }
        for (let i = 0; i < emptySpaces; i++) {
            const index = i * width + col;
            cells[index].style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        }
    }
}

// Обработчик клика
function handleClick() {
    if (checkForMatches()) {
        fillEmptyCells();
        checkForMatches(); // Проверяем еще раз после заполнения
    }
}

createBoard();