let currentWord;
let wordsPlayed;
let turnCount;

function initializeGame() {
    fetchRandomWord().then(word => {
        currentWord = word;
        wordsPlayed = [currentWord];
        turnCount = 0;
        document.getElementById('current-word').textContent = currentWord;
        document.getElementById('turn-count').textContent = turnCount;
        document.getElementById('word-list').innerHTML = '';
        document.getElementById('messages').textContent = '';
        document.getElementById('user-input').value = '';

        // Display the initial word played by the computer
        const wordListElement = document.getElementById('word-list');
        const listItem = document.createElement('li');
        listItem.textContent = `Computer started with: ${currentWord}`;
        wordListElement.appendChild(listItem);
    });
}

document.getElementById('submit-word').addEventListener('click', userTurn);
document.getElementById('restart-game').addEventListener('click', initializeGame);

function fetchRandomWord() {
    return fetch('https://random-word-api.herokuapp.com/word?number=1&length=4')
        .then(response => response.json())
        .then(data => data[0])
        .catch(() => 'word'); // Fallback word in case of an error
}

function userTurn() {
    const userInput = document.getElementById('user-input').value.trim().toLowerCase();
    const messages = document.getElementById('messages');

    if (wordsPlayed.includes(userInput)) {
        messages.textContent = 'Word already used. Try another!';
        return;
    }

    if (!isValidTransformation(userInput)) {
        messages.textContent = 'Invalid transformation. You can only add or change one letter.';
        return;
    }

    validateWord(userInput, (isValid) => {
        if (!isValid) {
            messages.textContent = 'Invalid word. You lose!';
            return;
        }

        updateGameState(userInput, 'You played');
        setTimeout(computerTurn, 1000); // Delay to simulate thinking
    });
}

function computerTurn() {
    const messages = document.getElementById('messages');

    generateComputerWord().then(computerWord => {
        if (wordsPlayed.includes(computerWord) || !isValidTransformation(computerWord)) {
            messages.textContent = 'Computer cannot make a move. You win!';
            return;
        }

        validateWord(computerWord, (isValid) => {
            if (isValid) {
                updateGameState(computerWord, 'Computer played');
            } else {
                messages.textContent = 'Computer cannot make a move. You win!';
            }
        });
    });
}

async function generateComputerWord() {
    const response = await fetch(`https://generate-word-inky.vercel.app/generate-word/${currentWord}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    const data = await response.json();
    return data.word.trim();
}

function validateWord(word, callback) {
    fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
        .then(response => response.json())
        .then(data => {
            if (data.title === "No Definitions Found") {
                callback(false);
            } else {
                callback(true);
            }
        })
        .catch(() => callback(false));
}

function isValidTransformation(newWord) {
    if (newWord.length === currentWord.length) {
        // Check for one-letter change
        let diffCount = 0;
        for (let i = 0; i < currentWord.length; i++) {
            if (currentWord[i] !== newWord[i]) {
                diffCount++;
            }
        }
        return diffCount === 1;
    } else if (newWord.length === currentWord.length + 1) {
        // Check for one-letter addition
        return isOneLetterAddition(newWord);
    }
    return false;
}

function isOneLetterAddition(newWord) {
    // Check if newWord is currentWord with one additional letter
    for (let i = 0; i <= currentWord.length; i++) {
        const testWord = newWord.slice(0, i) + newWord.slice(i + 1);
        if (testWord === currentWord) {
            return true;
        }
    }
    return false;
}

function updateGameState(newWord, player) {
    currentWord = newWord;
    wordsPlayed.push(newWord);
    turnCount++;
    document.getElementById('current-word').textContent = currentWord;
    document.getElementById('turn-count').textContent = turnCount;
    const wordListElement = document.getElementById('word-list');
    const listItem = document.createElement('li');
    listItem.textContent = `${player}: ${newWord}`;
    wordListElement.appendChild(listItem);
    document.getElementById('user-input').value = '';
}

// Initialize the game on page load
initializeGame();
