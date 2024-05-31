document.addEventListener('DOMContentLoaded', () => {
    const ageCards = document.querySelectorAll('.age-card');
    const startBtn = document.getElementById('start-btn');
    const restartBtn = document.getElementById('restart-btn');
    const correctBtn = document.getElementById('correct-btn');
    const incorrectBtn = document.getElementById('incorrect-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const themeSelect = document.getElementById('theme-select');
    const toggleMusicBtn = document.getElementById('toggle-music');
    const correctSound = document.getElementById('correct-sound');
    const incorrectSound = document.getElementById('incorrect-sound');
    const backgroundMusic = document.getElementById('background-music');
    const addWordBtn = document.getElementById('add-word-btn');
    const customWordInput = document.getElementById('custom-word');
    const customWordsList = document.getElementById('custom-words-list');

    let words = [];
    let currentWordIndex = 0;
    let score = 0;
    let timerInterval;
    let isPaused = false;
    let numWords = 10;
    let difficulty = 'easy';
    let isMusicPlaying = true;
    let achievements = [];
    let customWords = JSON.parse(localStorage.getItem('customWords')) || [];

    const siteWords = {
        easy: ["cat", "dog", "sun", "moon", "star", "ball", "book", "car", "hat", "pen"],
        medium: ["apple", "banana", "cherry", "date", "elderberry", "fig", "grape", "honeydew", "kiwi", "lemon"],
        hard: ["elephant", "giraffe", "hippopotamus", "rhinoceros", "crocodile", "pterodactyl", "tyrannosaurus", "triceratops", "stegosaurus", "brachiosaurus"]
    };

    function displayCustomWords() {
        customWordsList.innerHTML = '';
        customWords.forEach((word, index) => {
            const li = document.createElement('li');
            li.textContent = word;
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Delete';
            deleteBtn.classList.add('btn', 'delete-btn');
            deleteBtn.addEventListener('click', () => {
                customWords.splice(index, 1);
                localStorage.setItem('customWords', JSON.stringify(customWords));
                displayCustomWords();
            });
            li.appendChild(deleteBtn);
            customWordsList.appendChild(li);
        });
    }

    addWordBtn.addEventListener('click', () => {
        const newWord = customWordInput.value.trim();
        if (newWord) {
            customWords.push(newWord);
            localStorage.setItem('customWords', JSON.stringify(customWords));
            displayCustomWords();
            customWordInput.value = '';
        }
    });

    displayCustomWords();

    // Existing code continues...

    if (ageCards.length > 0) {
        ageCards.forEach(card => {
            card.addEventListener('click', (event) => {
                const ageGroup = card.getAttribute('data-age-group');
                navigateToGame(ageGroup);
            });
        });
    }

    if (startBtn) {
        startBtn.addEventListener('click', () => {
            startGame();
            showGameCard();
        });
    }

    if (correctBtn) {
        correctBtn.addEventListener('click', () => {
            correctSound.play();
            score++;
            updateScore();
            showPopup();
            nextWord();
            correctBtn.classList.add('correct-animation');
            setTimeout(() => correctBtn.classList.remove('correct-animation'), 500);
        });
    }

    if (incorrectBtn) {
        incorrectBtn.addEventListener('click', () => {
            incorrectSound.play();
            score--;  // Decrement the score
            updateScore();
            incorrectBtn.classList.add('incorrect-animation');
            setTimeout(() => incorrectBtn.classList.remove('incorrect-animation'), 500);
            nextWord();
        });
    }

    if (pauseBtn) {
        pauseBtn.addEventListener('click', () => {
            isPaused = !isPaused;
            pauseBtn.textContent = isPaused ? 'Resume' : 'Pause';
            if (isPaused) {
                backgroundMusic.pause();
            } else {
                backgroundMusic.play();
            }
        });
    }

    if (restartBtn) {
        restartBtn.addEventListener('click', () => {
            resetGame();
            navigateToGameSetup();
        });
    }

    if (toggleMusicBtn) {
        toggleMusicBtn.addEventListener('click', () => {
            if (isMusicPlaying) {
                backgroundMusic.pause();
                toggleMusicBtn.textContent = 'Play Music';
            } else {
                backgroundMusic.play();
                toggleMusicBtn.textContent = 'Pause Music';
            }
            isMusicPlaying = !isMusicPlaying;
        });
    }

    themeSelect.addEventListener('change', (event) => {
        const theme = event.target.value;
        document.body.className = theme; // Apply the selected theme to the body
    });

    function navigateToGame(ageGroup) {
        window.location.href = `game.html?ageGroup=${ageGroup}`;
    }

    function navigateToGameSetup() {
        const setupCard = document.getElementById('setup-card');
        const gameCard = document.getElementById('game-card');
        const gameOverCard = document.getElementById('game-over-card');

        if (setupCard && gameCard && gameOverCard) {
            setupCard.style.display = 'block';
            gameCard.style.display = 'none';
            gameOverCard.style.display = 'none';
        }
    }

    function showGameCard() {
        const setupCard = document.getElementById('setup-card');
        const gameCard = document.getElementById('game-card');
        const gameOverCard = document.getElementById('game-over-card');

        if (setupCard && gameCard && gameOverCard) {
            setupCard.style.display = 'none';
            gameCard.style.display = 'block';
            gameOverCard.style.display = 'none';
        }
    }

    function startGame() {
        score = 0;
        currentWordIndex = 0;
        isPaused = false;
        numWords = parseInt(document.getElementById('num-words').value);
        difficulty = document.getElementById('difficulty').value;
        words = siteWords[difficulty].slice(0, numWords).concat(customWords); // Include custom words
        displayWord();
        startTimer();
        updateScore();
    }

    function navigateToGameOver() {
        const setupCard = document.getElementById('setup-card');
        const gameCard = document.getElementById('game-card');
        const gameOverCard = document.getElementById('game-over-card');
        const finalScore = document.getElementById('final-score');

        if (setupCard && gameCard && gameOverCard && finalScore) {
            setupCard.style.display = 'none';
            gameCard.style.display = 'none';
            gameOverCard.style.display = 'block';
            finalScore.textContent = `Your final score is ${score}`;
        }
    }

    function displayWord() {
        if (currentWordIndex < words.length) {
            document.getElementById('word-display').textContent = words[currentWordIndex];
        } else {
            navigateToGameOver();
        }
    }

    function startTimer() {
        let time = 10 - Math.floor(score / 10); // Reduce time as score increases
        if (time < 5) time = 5; // Set a minimum timer value
        updateTimerDisplay(time);
        timerInterval = setInterval(() => {
            if (!isPaused) {
                time--;
                updateTimerDisplay(time);
                if (time <= 0) {
                    clearInterval(timerInterval);
                    nextWord();
                }
            }
        }, 1000);
    }

    function updateTimerDisplay(time) {
        const timerElement = document.getElementById('timer');
        if (timerElement) {
            timerElement.textContent = `00:${time.toString().padStart(2, '0')}`;
            if (time > 5) {
                timerElement.className = 'timer green';
            } else if (time > 2) {
                timerElement.className = 'timer yellow';
            } else {
                timerElement.className = 'timer red';
            }
        }
    }

    function resetTimer() {
        clearInterval(timerInterval);
        startTimer();
    }

    function updateScore() {
        const scoreElement = document.getElementById('score');
        if (scoreElement) {
            scoreElement.textContent = `Score: ${score}`;
        }
    }

    function nextWord() {
        currentWordIndex++;
        displayWord();
        resetTimer();
        checkAchievements(); // Check achievements after each word
    }

    function resetGame() {
        clearInterval(timerInterval);
        score = 0;
        currentWordIndex = 0;
        isPaused = false;
        updateScore();
        updateTimerDisplay(10);
    }

    function showPopup() {
        const messages = ["Good Job!", "Awesome!", "Well Done!", "Great!", "Keep It Up!", "Fantastic!"];
        const randomIndex = Math.floor(Math.random() * messages.length);
        const message = messages[randomIndex];
        const popupMessage = document.getElementById('popup-message');
        const popupText = document.getElementById('popup-text');
        if (popupMessage && popupText) {
            popupText.textContent = message;
            popupMessage.classList.add('show');
            setTimeout(() => {
                popupMessage.classList.remove('show');
            }, 2000); // Popup will disappear after 2 seconds
        }
    }

    function checkAchievements() {
        if (score === 10 && !achievements.includes('First 10')) {
            achievements.push('First 10');
            alert('Achievement Unlocked: First 10!');
        }
        if (score === 20 && !achievements.includes('Second 20')) {
            achievements.push('Second 20');
            alert('Achievement Unlocked: Second 20!');
        }
        // Add more achievements as needed
    }

    navigateToGameSetup(); // Initial setup
});

