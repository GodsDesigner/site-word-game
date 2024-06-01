document.addEventListener('DOMContentLoaded', () => {
    const ageCards = document.querySelectorAll('.age-card');
    const startBtn = document.getElementById('start-btn');
    const restartBtn = document.getElementById('restart-btn');
    const correctBtn = document.getElementById('correct-btn');
    const incorrectBtn = document.getElementById('incorrect-btn');
    const pauseBtn = document.getElementById('pause-btn');

    let words = [];
    let currentWordIndex = 0;
    let score = 0;
    let timerInterval;
    let isPaused = false;
    let numWords = 10;
    let difficulty = 'easy';

    const siteWords = {
        easy: [
            "cat", "dog", "sun", "moon", "star", "ball", "book", "car", "hat", "pen",
            "a", "and", "away", "big", "blue", "can", "come", "down", "find", "for",
            "fun", "go", "help", "here", "I", "in", "is", "it", "jump", "little", "look",
            "make", "me", "my", "not", "one", "play", "red", "run", "said", "see", "the",
            "three", "to", "two", "up", "we", "where", "yellow", "you"
        ],
        medium: [
            "apple", "banana", "cherry", "date", "elderberry", "fig", "grape", "honeydew", "kiwi", "lemon",
            "after", "again", "air", "also", "animal", "another", "any", "around", "ask", "back",
            "because", "before", "boy", "change", "does", "end", "every", "fly", "follow", "food",
            "give", "great", "hand", "home", "just", "kind", "large", "learn", "letter", "live",
            "man", "most", "mother", "move", "much", "name", "need", "off", "only", "open",
            "over", "place", "read", "right", "same", "should", "show", "small", "sound", "spell"
        ],
        hard: [
            "elephant", "giraffe", "hippopotamus", "rhinoceros", "crocodile", "pterodactyl", "tyrannosaurus", "triceratops", "stegosaurus", "brachiosaurus",
            "america", "answer", "different", "does", "even", "found", "going", "house", "large", "letter",
            "little", "mother", "much", "name", "number", "people", "place", "school", "sound", "spell",
            "still", "study", "such", "take", "thank", "thing", "think", "together", "try", "turn",
            "under", "until", "very", "walk", "watch", "water", "were", "while", "which", "world",
            "would", "write", "year"
        ]
    };

    if (ageCards.length > 0) {
        ageCards.forEach(card => {
            card.addEventListener('click', (event) => {
                const ageGroup = card.getAttribute('data-age-group');
                navigateToDifficultySelection(ageGroup);
            });
        });
    }

    if (startBtn) {
        startBtn.addEventListener('click', navigateToGame);
    }

    if (correctBtn) {
        correctBtn.addEventListener('click', () => {
            score++;
            updateScore();
            showPopup();
            nextWord();
        });
    }

    if (incorrectBtn) {
        incorrectBtn.addEventListener('click', () => {
            score--;  // Decrement the score
            updateScore();
            incorrectBtn.style.backgroundColor = 'red';
            setTimeout(() => {
                incorrectBtn.style.backgroundColor = '';  // Revert to original color after a short delay
            }, 500);
            nextWord();
        });
    }

    if (pauseBtn) {
        pauseBtn.addEventListener('click', () => {
            isPaused = !isPaused;
            pauseBtn.textContent = isPaused ? 'Resume' : 'Pause';
        });
    }

    if (restartBtn) {
        restartBtn.addEventListener('click', () => {
            resetGame();
            navigateToGameSetup();
        });
    }

    function navigateToDifficultySelection(ageGroup) {
        window.location.href = `difficulty.html?ageGroup=${ageGroup}`;
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

    function navigateToGame() {
        const setupCard = document.getElementById('setup-card');
        const gameCard = document.getElementById('game-card');
        const gameOverCard = document.getElementById('game-over-card');

        if (setupCard && gameCard && gameOverCard) {
            setupCard.style.display = 'none';
            gameCard.style.display = 'block';
            gameOverCard.style.display = 'none';
            startGame();
        }
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

    function startGame() {
        score = 0;
        currentWordIndex = 0;
        isPaused = false;
        numWords = parseInt(document.getElementById('num-words').value);
        difficulty = document.getElementById('difficulty').value;
        words = siteWords[difficulty].slice(0, numWords);
        displayWord();
        startTimer();
        updateScore();
    }

    function displayWord() {
        if (currentWordIndex < words.length) {
            document.getElementById('word-display').textContent = words[currentWordIndex];
        } else {
            navigateToGameOver();
        }
    }

    function startTimer() {
        let time = 10; // 10 seconds countdown
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
                timerElement.style.color = 'green';
            } else if (time > 2) {
                timerElement.style.color = 'yellow';
            } else {
                timerElement.style.color = 'red';
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

    navigateToGameSetup(); // Initial setup
});
