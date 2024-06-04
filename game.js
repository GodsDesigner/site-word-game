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

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
        const spokenWord = event.results[0][0].transcript.toLowerCase().trim();
        const currentWord = words[currentWordIndex].toLowerCase().trim();

        if (spokenWord === currentWord) {
            handleCorrect();
        } else {
            handleIncorrect();
        }
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
    };

    function startListening() {
        recognition.start();
    }

    const siteWords = {
        easy: [
            "the", "of", "and", "a", "to", "in", "is", "you", "that", "it",
            "he", "was", "for", "on", "are", "as", "with", "his", "they", "I",
            "at", "be", "this", "have", "from", "or", "one", "had", "by", "word",
            "but", "not", "what", "all", "were", "we", "when", "your", "can", "said",
            "there", "use", "an", "each", "which", "she", "do", "how", "their", "if",
            "will", "up", "other", "about", "out", "many", "then", "them", "these", "so",
            "some", "her", "would", "make", "like", "him", "into", "time", "has", "look",
            "two", "more", "write", "go", "see", "number", "no", "way", "could", "people",
            "my", "than", "first", "water", "been", "call", "who", "oil", "its", "now",
            "find", "long", "down", "day", "did", "get", "come", "made", "may", "part",
            "over", "new", "sound", "take", "only", "little", "work", "know", "place", "year",
            "live", "me", "back", "give", "most", "very", "after", "thing", "our", "just",
            "name", "good", "sentence", "man", "think", "say", "great", "where", "help", "through",
            "much", "before", "line", "right", "too", "mean", "old", "any", "same", "tell",
            "boy", "follow", "came", "want", "show", "also", "around", "form", "three", "small",
            "set", "put", "end", "does", "another", "well", "large", "must", "big", "even",
            "such", "because", "turn", "here", "why", "ask", "went", "men", "read", "need",
            "land", "different", "home", "us", "move", "try", "kind", "hand", "picture", "again",
            "change", "off", "play", "spell", "air", "away", "animal", "house", "point", "page",
            "letter", "mother", "answer", "found", "study", "still", "learn", "should", "America", "world"
        ],
        medium: [
            "such", "because", "turn", "here", "why", "ask", "went", "men", "read", "need",
            "land", "different", "home", "us", "move", "try", "kind", "hand", "picture", "again",
            "change", "off", "play", "spell", "air", "away", "animal", "house", "point", "page",
            "letter", "mother", "answer", "found", "study", "still", "learn", "should", "America", "world",
            "high", "every", "near", "add", "food", "between", "own", "below", "country", "plant",
            "last", "school", "father", "keep", "tree", "never", "start", "city", "earth", "eyes",
            "light", "thought", "head", "under", "story", "saw", "left", "don't", "few", "while",
            "along", "might", "close", "something", "seem", "next", "hard", "open", "example", "begin",
            "life", "always", "those", "both", "paper", "together", "got", "group", "often", "run",
            "important", "until", "children", "side", "feet", "car", "mile", "night", "walk", "white",
            "sea", "began", "grow", "took", "river", "four", "carry", "state", "once", "book",
            "hear", "stop", "without", "second", "later", "miss", "idea", "enough", "eat", "face"
        ],
        hard: [
            "watch", "far", "Indian", "real", "almost", "let", "above", "girl", "sometimes", "mountains",
            "cut", "young", "talk", "soon", "list", "song", "being", "leave", "family", "it's",
            "body", "music", "color", "stand", "sun", "questions", "fish", "area", "mark", "dog",
            "horse", "birds", "problem", "complete", "room", "knew", "since", "ever", "piece", "told",
            "usually", "didn't", "friends", "easy", "heard", "order", "red", "door", "sure", "become",
            "top", "ship", "across", "today", "during", "short", "better", "best", "however", "low",
            "hours", "black", "products", "happened", "whole", "measure", "remember", "early", "waves", "reached",
            "listen", "wind", "rock", "space", "covered", "fast", "several", "hold", "himself", "toward",
            "five", "step", "morning", "passed", "vowel", "true", "hundred", "against", "pattern", "numeral",
            "table", "north", "slowly", "money", "map", "farm", "pulled", "draw", "voice", "seen",
            "cold", "cried", "plan", "notice", "south", "sing", "war", "ground", "fall", "king"
        ],
        abc: [
            "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z",
            "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"
        ],
        blending: [
            "bl - blue", "br - brown", "cl - clean", "cr - crab", "dr - drum",
            "fl - flag", "fr - frog", "gl - glue", "gr - grape", "pl - plant",
            "pr - prize", "sc - scarf", "sk - skip", "sl - slide", "sm - smile",
            "sn - snail", "sp - spoon", "st - star", "sw - swim", "tr - tree",
            "tw - twin", "scr - scrub", "shr - shrimp", "spl - splash", "spr - spring",
            "squ - squash", "str - street", "thr - three", "br - brush", "fr - fry",
            "pl - plane", "tr - train", "ch - chair", "sh - ship", "th - think",
            "wh - whale", "bl - block", "fl - flower", "gl - glow", "cl - clock",
            "sl - sleep", "br - bread", "cr - crash", "dr - dress", "gr - green",
            "pr - press", "sc - school", "sk - skate", "sp - space", "st - stone"
        ],
    };

    function showSuccessMessage(message) {
        const successMessage = document.getElementById('success-message');
        const successText = document.getElementById('success-text');
        successText.textContent = message;
        successMessage.classList.add('show');

        // Play success sound
        const successSound = new Audio('path/to/success-sound.mp3');
        successSound.play();

        // Show confetti animation
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.classList.add('confetti');
            document.body.appendChild(confetti);
            setTimeout(() => {
                confetti.remove();
            }, 2000);
        }

        setTimeout(() => {
            successMessage.classList.remove('show');
        }, 2000);
    }

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
        correctBtn.addEventListener('click', handleCorrect);
    }

    if (incorrectBtn) {
        incorrectBtn.addEventListener('click', handleIncorrect);
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
        words = customWords; // Use only custom words for now
        words = shuffleArray(words).slice(0, numWords); // Ensure the total number of words is correct
        displayWord();
        startTimer();
        updateScore();
        startListening(); // Start listening for the first word
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
        startListening(); // Start listening for the next word
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
