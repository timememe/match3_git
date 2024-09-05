(function() {
    const baseUrl = 'https://cdn.jsdelivr.net/gh/timememe/match3_git@main/assets/';
    const cardTypes = ['card_1', 'card_2', 'card_3', 'card_4', 'card_5', 'card_6', 'card_7'];
    const cacheBuster = Date.now();
    let preloadedImages = {};

    function getImageUrl(imageName) {
        return `${baseUrl}${imageName}.png?v=${cacheBuster}`;
    }

    function preloadImages() {
        return new Promise((resolve, reject) => {
            let loadedCount = 0;
            const totalImages = cardTypes.length;

            function onLoad() {
                loadedCount++;
                if (loadedCount === totalImages) {
                    resolve();
                }
            }

            cardTypes.forEach(cardType => {
                const img = new Image();
                img.onload = onLoad;
                img.onerror = reject;
                img.src = getImageUrl(cardType);
                preloadedImages[cardType] = img;
            });
        });
    }
    
    function initMemoryGame() {
        const container = document.getElementById('memory-game-container');
        const grid = container.querySelector('.grid');
        const scoreDisplay = container.querySelector('#score');
        const timerDisplay = container.querySelector('#timer');
        const backText = container.querySelector('#back-text');
        const languageSelect = container.querySelector('#language-select');
        let score = 0;
        const width = 7;
        const height = 7;
        let cells = [];
        let selectedCell = null;
        let touchedCell = null;
        let touchStartX, touchStartY;
        let timeLeft = 30; // 30 seconds
        let timerInterval;
        let currentLanguage = container.getAttribute('lang') || 'en';
        let isProcessing = false;

        const translations = {
            en: {
                back: "Back",
                score: "Score",
                timeUp: "Time's up! Game over.",
                backClicked: "Back button clicked! Add your functionality here.",
                instruction: "Instruction",
                tutorial: "Collect these 3 rows 3 times in 30 seconds!",
                startGame: "Start Game",
                gameOver: "Game Over",
                yourScore: "Your score:",
                playAgain: "Play Again",
                victory: "Victory!",
                taskCompleted: "You've completed the task!"
            },
            ru: {
                back: "Назад",
                score: "Счёт",
                timeUp: "Время вышло! Игра окончена.",
                backClicked: "Кнопка «Назад» нажата! Добавьте сюда свою функциональность.",
                instruction: "Инструкция",
                tutorial: "Собери 3 раза эти 3 ряда за 30 секунд!",
                startGame: "Начать игру",
                gameOver: "Игра окончена",
                yourScore: "Ваш счёт:",
                playAgain: "Играть снова",
                victory: "Победа!",
                taskCompleted: "Вы выполнили задание!"
            },
            kk: {
                back: "Артқа",
                score: "Ұпай",
                timeUp: "Уақыт бітті! Ойын аяқталды.",
                backClicked: "«Артқа» түймесі басылды! Мұнда өз функционалдығыңызды қосыңыз.",
                instruction: "Нұсқаулық",
                tutorial: "Осы 3 қатарды 30 секунд ішінде 3 рет жинаңыз!",
                startGame: "Ойынды бастау",
                gameOver: "Ойын аяқталды",
                yourScore: "Сіздің ұпайыңыз:",
                playAgain: "Қайта ойнау",
                victory: "Жеңіс!",
                taskCompleted: "Сіз тапсырманы орындадыңыз!"
            },
            uz: {
                back: "Orqaga",
                score: "Hisob",
                timeUp: "Vaqt tugadi! O'yin tugadi.",
                backClicked: "Orqaga tugmasi bosildi! Bu yerga o'z funksionalligingizni qo'shing.",
                instruction: "Ko'rsatma",
                tutorial: "Bu 3 qatorni 30 soniya ichida 3 marta yig'ing!",
                startGame: "O'yinni boshlash",
                gameOver: "O'yin tugadi",
                yourScore: "Sizning hisobingiz:",
                playAgain: "Qayta o'ynash",
                victory: "G'alaba!",
                taskCompleted: "Siz vazifani bajardingiz!"
            },
            ka: {
                back: "უკან",
                score: "ქულა",
                timeUp: "დრო ამოიწურა! თამაში დასრულდა.",
                backClicked: "უკან ღილაკი დაჭერილია! დაამატეთ თქვენი ფუნქციონალი აქ.",
                instruction: "ინსტრუქცია",
                tutorial: "შეაგროვე ეს 3 რიგი 3-ჯერ 30 წამში!",
                startGame: "თამაშის დაწყება",
                gameOver: "თამაში დასრულდა",
                yourScore: "თქვენი ქულა:",
                playAgain: "თავიდან თამაში",
                victory: "გამარჯვება!",
                taskCompleted: "თქვენ შეასრულეთ დავალება!"
            }
        };

        let comboCount = {
            card_1: 0,
            card_2: 0,
            card_3: 0
        };

        function getCookie(name) {
            let namePattern = name + "=";
            let cookiesArray = document.cookie.split(';');
            for(let i = 0; i < cookiesArray.length; i++) {
                let cookie = cookiesArray[i].trim();
                if (cookie.indexOf(namePattern) == 0) {
                    return cookie.substring(namePattern.length, cookie.length);
                }
            }
            return null;
        }

        function setCookie(name, value, days) {
            var expires = "";
            if (days) {
                var date = new Date();
                date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
                expires = "; expires=" + date.toUTCString();
            }
            document.cookie = name + "=" + (value || "") + expires + "; path=/";
        }

        function awardPoints(points) {
            const data = {
                points: points,
                won: true,
                game: 'match3'
            };
            const token = getCookie('jwt_token');
            if (token) {
                fetch('https://api.oreo-promo.com/game', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-jwt-auth': token,
                    },
                    body: JSON.stringify(data)
                })
                .then(response => response.json())
                .then(result => {
                    console.log('Points awarded successfully:', result);
                    window.location="/profile";
                })
                .catch(error => {
                    console.error('Error awarding points:', error);
                    window.location="/profile";
                });
            } else {
                setCookie('guest_game', JSON.stringify(data), 90);
                window.location="#ModalLogin";
            }
        }

        function updateLanguage() {
            //currentLanguage = languageSelect.value;
            //backText.textContent = translations[currentLanguage].back;
            updateScore();
            container.querySelector('#start-title').textContent = translations[currentLanguage].instruction;
            container.querySelector('#start-instruction').textContent = translations[currentLanguage].tutorial;
            container.querySelector('#start-button').textContent = translations[currentLanguage].startGame;
            container.querySelector('#end-title').textContent = translations[currentLanguage].gameOver;
            container.querySelector('#end-text').textContent = translations[currentLanguage].yourScore;
            container.querySelector('#play-again-button').textContent = translations[currentLanguage].playAgain;
            container.querySelector('#win-title').textContent = translations[currentLanguage].victory;
            container.querySelector('#win-text').textContent = translations[currentLanguage].taskCompleted;
            container.querySelector('#play-again-button-win').textContent = translations[currentLanguage].playAgain;
        }

        languageSelect.addEventListener('change', updateLanguage);
        languageSelect.style.display = 'none';

        // Add new functions to handle popups
        function showStartPopup() {
            container.querySelector('#start-popup').style.display = 'flex';
        }

        function hideStartPopup() {
            container.querySelector('#start-popup').style.display = 'none';
        }

        function showWinPopup() {
            container.querySelector('#win-popup').style.display = 'flex';
            container.querySelector('#win-score').innerHTML = `${translations[currentLanguage].score.toUpperCase()}:<br>${score}`;
        }

        function showEndPopup() {
            container.querySelector('#end-popup').style.display = 'flex';
            container.querySelector('#final-score').innerHTML = `${translations[currentLanguage].score.toUpperCase()}:<br>${score}`;
        }

        function hideWinPopup() {
            container.querySelector('#win-popup').style.display = 'none';
        }

        function hideEndPopup() {
            container.querySelector('#end-popup').style.display = 'none';
        }

        function sendGameResult(game, result, language) {
            console.log('Sending result:', game, result, language);  // Обновлено для отладки

            const data = {
                game: game,
                result: result,
                language: language // Добавлен параметр языка
            };

            fetch('https://wo-server-v1.onrender.com/game-result', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            })
            .then(response => {
                if (!response.ok) {
                    return response.text().then(text => {
                        throw new Error(`HTTP error! status: ${response.status}, body: ${text}`);
                    });
                }
                return response.json();
            })
            .then(data => console.log('Game result sent:', data))
            .catch(error => console.error('Error sending game result:', error));
        }

        // Add a new function to reset the game
        function resetGame() {
            clearInterval(timerInterval);
            score = 0;
            timeLeft = 30;
            comboCount = {
                card_1: 0,
                card_2: 0,
                card_3: 0
            };
            updateScore();
            updateTimer();
            cells.forEach(cell => {
                cell.style.backgroundImage = `url('${getImageUrl(cardTypes[Math.floor(Math.random() * cardTypes.length)])}')`;
            });
        }

        // Create the game board
        function createBoard() {
            for (let i = 0; i < width * height; i++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.style.backgroundImage = `url('${getImageUrl(cardTypes[Math.floor(Math.random() * cardTypes.length)])}')`;
                cell.setAttribute('draggable', true);
                cell.addEventListener('dragstart', dragStart);
                cell.addEventListener('dragover', dragOver);
                cell.addEventListener('dragenter', dragEnter);
                cell.addEventListener('dragleave', dragLeave);
                cell.addEventListener('drop', dragDrop);
                cell.addEventListener('dragend', dragEnd);
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
            if (isProcessing) return;
            selectedCell = this;
            touchedCell = this;
            const touch = e.touches[0];
            touchStartX = touch.clientX;
            touchStartY = touch.clientY;
        }

        function handleTouchMove(e) {
            if (!selectedCell || isProcessing) return;
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
                    touchedCell = cells[targetIndex];
                }
            }
        }

        function handleTouchEnd() {
            if (isProcessing) return;
            if (selectedCell && touchedCell && selectedCell !== touchedCell) {
                swapCells(selectedCell, touchedCell);
            }
            selectedCell = null;
            touchedCell = null;
        }

        // Swap cells with animation
        function swapCells(cell1, cell2) {
            if (isProcessing || !isAdjacent(cell1, cell2)) return;

            isProcessing = true;
            cell1.classList.add('moving');
            cell2.classList.add('moving');
            
            const tempBg = cell1.style.backgroundImage;
            cell1.style.backgroundImage = cell2.style.backgroundImage;
            cell2.style.backgroundImage = tempBg;
            
            setTimeout(() => {
                cell1.classList.remove('moving');
                cell2.classList.remove('moving');
                processBoard();
            }, 300);
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

        // New function to process the board
        function processBoard() {
            checkForMatches()
                .then(matchFound => {
                    if (matchFound) {
                        return fillEmptyCells();
                    } else {
                        isProcessing = false;
                    }
                })
                .then(() => {
                    if (isProcessing) {
                        processBoard(); // Continue processing if there were matches
                    }
                });
        }

        // Modify checkForMatches to return a Promise
        function checkForMatches() {
            return new Promise(resolve => {
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
                            
                            const cardType = bg.split('/').pop().split('.')[0];
                            if (['card_1', 'card_2', 'card_3'].includes(cardType) && comboCount[cardType] === 0) {
                                comboCount[cardType]++;
                                score++;
                            }
                            
                            matchFound = true;
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
                            
                            const cardType = bg.split('/').pop().split('.')[0];
                            if (['card_1', 'card_2', 'card_3'].includes(cardType) && comboCount[cardType] === 0) {
                                comboCount[cardType]++;
                                score++;
                            }
                            
                            matchFound = true;
                        }
                    }
                }

                if (matchFound) {
                    setTimeout(() => {
                        cells.forEach(cell => {
                            if (cell.classList.contains('matched')) {
                                cell.style.backgroundImage = '';
                                cell.classList.remove('matched');
                            }
                        });
                        updateScore();
                        if (comboCount.card_1 > 0 && comboCount.card_2 > 0 && comboCount.card_3 > 0) {
                            endGame();
                        }
                        resolve(true);
                    }, 500);
                } else {
                    resolve(false);
                }
            });
        }

        // Modify fillEmptyCells to return a Promise
        function fillEmptyCells() {
            return new Promise(resolve => {
                const promises = [];
        
                for (let col = 0; col < width; col++) {
                    let emptySpaces = 0;
                    for (let row = height - 1; row >= 0; row--) {
                        const index = row * width + col;
                        if (cells[index].style.backgroundImage === '') {
                            emptySpaces++;
                        } else if (emptySpaces > 0) {
                            const promise = new Promise(cellResolve => {
                                const currentCell = cells[index];
                                const targetCell = cells[index + width * emptySpaces];
                                const startPosition = currentCell.offsetTop;
                                const endPosition = targetCell.offsetTop;
        
                                currentCell.style.zIndex = '10';
                                currentCell.classList.add('falling');
                                currentCell.style.transform = `translateY(${endPosition - startPosition}px)`;
        
                                setTimeout(() => {
                                    targetCell.style.backgroundImage = currentCell.style.backgroundImage;
                                    currentCell.style.backgroundImage = '';
                                    currentCell.style.transform = '';
                                    currentCell.style.zIndex = '';
                                    currentCell.classList.remove('falling');
                                    cellResolve();
                                }, 500);
                            });
                            promises.push(promise);
                        }
                    }
                    for (let i = 0; i < emptySpaces; i++) {
                        const index = i * width + col;
                        const promise = new Promise(cellResolve => {
                            setTimeout(() => {
                                const randomCardType = cardTypes[Math.floor(Math.random() * cardTypes.length)];
                                cells[index].style.backgroundImage = `url('${getImageUrl(randomCardType)}')`;
                                cells[index].style.opacity = '0';
                                cells[index].classList.add('falling');
                                cells[index].style.transform = 'translateY(-50px)';
                                setTimeout(() => {
                                    cells[index].style.opacity = '1';
                                    cells[index].style.transform = '';
                                    cells[index].classList.remove('falling');
                                    cellResolve();
                                }, 300);
                            }, i * 100);
                        });
                        promises.push(promise);
                    }
                }
        
                Promise.all(promises).then(() => resolve());
            });
        }


        // Handle click
        function handleClick() {
            if (checkForMatches()) {
                setTimeout(() => {
                    fillEmptyCells().then(() => {
                        checkForMatches();
                    });
                }, 500);
            }
        }


        // Update score display
        function updateScore() {
            scoreDisplay.innerHTML = `${translations[currentLanguage].score.toUpperCase()}:<br>${score}`;
        }

        // Modify the updateTimer function
        function updateTimer() {
            const seconds = timeLeft;
            timerDisplay.innerHTML = `ВРЕМЯ:<br>${seconds < 10 ? '0' + seconds : seconds}`;
            if (timeLeft > 0) {
                timeLeft--;
            } else {
                clearInterval(timerInterval);
                endGame();
            }
        }

        function startGame() {
            resetGame();
            timerInterval = setInterval(updateTimer, 1000);
        }

        function endGame() {
            clearInterval(timerInterval);
            if (comboCount.card_1 > 0 && comboCount.card_2 > 0 && comboCount.card_3 > 0) {
                showWinPopup();
                awardPoints(1); // 
                sendGameResult('game2', 'win', 'ge');
            } else {
                showEndPopup();
                sendGameResult('game2', 'lose', 'ge');
            }
        }

        backText.addEventListener('click', () => {
            window.location = "/profile";
        });

        container.querySelector('#start-button').addEventListener('click', () => {
            hideStartPopup();
            startGame();
        });

        container.querySelector('#play-again-button').addEventListener('click', () => {
            hideEndPopup();
            startGame();
        });

        container.querySelector('#play-again-button-win').addEventListener('click', () => {
            hideWinPopup();
            startGame();
        });

        // Initialize the game
        function initGame() {
            createBoard();
            updateLanguage();
            resetGame();
            showStartPopup();
        }

        // Инициализация игры
        preloadImages().then(() => {
            initGame();
        }).catch(error => {
            console.error('Failed to load images:', error);
            //alert('Failed to load game images. Please refresh the page and try again.');
        });
    }

    document.addEventListener('DOMContentLoaded', initMemoryGame);
})();



