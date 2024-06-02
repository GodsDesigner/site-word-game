document.addEventListener('DOMContentLoaded', () => {
    const startBtn = document.getElementById('start-btn');
    const restartBtn = document.getElementById('restart-btn');
    const correctBtn = document.getElementById('correct-btn');
    const incorrectBtn = document.getElementById('incorrect-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const themeSelect = document.getElementById('theme-select');
    const addWordBtn = document.getElementById('add-word-btn');
    const customWordInput = document.getElementById('custom-word');
    const customWordsList = document.getElementById('custom-words-list');
    const wordTypeSelect = document.getElementById('word-type');
    const backToSetupNav = document.getElementById('back-to-setup-nav');
    const volumeToggle = document.getElementById('volume-toggle');
    const correctSound = document.getElementById('correct-sound');
    const incorrectSound = document.getElementById('incorrect-sound');

    let isSoundOn = true;

    volumeToggle.addEventListener('change', () => {
        isSoundOn = volumeToggle.checked;
        toggleSound();
    });

    function toggleSound() {
        if (isSoundOn) {
            correctSound.volume = 1.0;
            incorrectSound.volume = 1.0;
        } else {
            correctSound.volume = 0.0;
            incorrectSound.volume = 0.0;
        }
    }

    let words = [];
    let currentWordIndex = 0;
    let score = 0;
    let timerInterval;
    let isPaused = false;
    let numWords = 10;
    let difficulty = 'easy';
    let customWords = JSON.parse(localStorage.getItem('customWords')) || [];
    let achievements = [];

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
        ],
        abc: [
            "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"
        ],
        blending: [
            "at", "bat", "cat", "hat", "rat", "sat", "mat", "fat", "pat", "vat",
            "can", "fan", "man", "pan", "tan", "van", "ran", "ban", "plan", "scan",
            "blend", "black", "block", "blush", "clap", "clean", "clip", "clock", "flag", "flash",
            "flip", "glad", "glass", "glow", "plan", "plant", "plum", "slide", "slip", "slim"
        ]
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

    if (startBtn) {
        startBtn.addEventListener('click', () => {
            startGame();
            showGameCard();
        });
    }

    if (backToSetupNav) {
        backToSetupNav.addEventListener('click', (event) => {
            event.preventDefault();
            navigateToGameSetup();
        });
    }

    if (correctBtn) {
        correctBtn.addEventListener('click', () => {
            if (isSoundOn) document.getElementById('correct-sound').play();
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
            if (isSoundOn) document.getElementById('incorrect-sound').play();
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
                document.getElementById('background-music').pause();
            } else {
                document.getElementById('background-music').play();
            }
        });
    }

    if (restartBtn) {
        restartBtn.addEventListener('click', () => {
            resetGame();
        });
    }

    themeSelect.addEventListener('change', (event) => {
        const theme = event.target.value;
        document.body.className = theme; // Apply the selected theme to the body
    });

    function showGameCard() {
        document.getElementById('setup-card').style.display = 'none';
        document.getElementById('game-card').style.display = 'block';
        document.getElementById('game-over-card').style.display = 'none';
    }

    function startGame() {
        score = 0;
        currentWordIndex = 0;
        isPaused = false;
        numWords = parseInt(document.getElementById('num-words').value, 10); // Ensure numWords is correctly parsed
        difficulty = document.getElementById('difficulty').value;
        const wordType = wordTypeSelect.value;
        if (wordType === 'abc' || wordType === 'blending') {
            words = shuffleArray(siteWords[wordType]);
        } else {
            words = siteWords[difficulty].slice(0, numWords).concat(customWords); // Include custom words
        }
        displayWord();
        startTimer();
        updateScore();
    }

    function navigateToGameSetup() {
        showSetupCard();
    }

    function navigateToGameOver() {
        document.getElementById('setup-card').style.display = 'none';
        document.getElementById('game-card').style.display = 'none';
        document.getElementById('game-over-card').style.display = 'block';
        document.getElementById('final-score').textContent = `Your final score is ${score}`;
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
        displayWord();
        showSetupCard();
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

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function showSetupCard() {
        document.getElementById('setup-card').style.display = 'block';
        document.getElementById('game-card').style.display = 'none';
        document.getElementById('game-over-card').style.display = 'none';
    }

    showSetupCard(); // Initial setup
});
