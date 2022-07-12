

let quests = null;
let questName = null;
let targetWords = null;

let currentLevel = 0;

const FLIP_ANIMATION_DURATION = 500;
const DANCE_ANIMATION_DURATION = 500;
const keyboard = document.querySelector("[data-keyboard]");
const alertContainer = document.querySelector("[data-alert-container]");
const progressModal = document.querySelector("[data-progress]");
const progressModalHeader = document.querySelector("[data-progress-header]");
const progressList = document.querySelector("[data-progress-list]");
const guessGrid = document.querySelector("[data-guess-grid]");
const playWordButton = document.querySelector("[data-play]");
const playNext = document.querySelector("[data-next]");

const game = document.querySelector(".game");

const questList = document.querySelector(".quest-list");



const WRONG = 'wrong';
const CORRECT = 'correct';

const synth = window.speechSynthesis;

const NUM_OF_TRIES = 4;

function getVoice() {
    // This list could be a settings option to allow the user to select the voice
    // they like.
    let voices = synth.getVoices();
    let goodVoice = voices.find(x => x.name.startsWith('Google US English'));
    return goodVoice;
}

playWordButton.addEventListener('mousedown', (e) => {
    e.preventDefault();
    playWord();
});

function playWord() {
    let msg = new SpeechSynthesisUtterance('');
    msg.lang = "en-US";
    msg.voice = getVoice();
    msg.text = targetWord;

    window.speechSynthesis.speak(msg);
}

playNext.addEventListener('mousedown', (e) => {
    e.preventDefault();
    currentLevel++;
    console.log('level', currentLevel);
    progressModal.classList.add("hide");
    startNewWord();
});

let currentWordLength = 0;
let targetWord = '';


function createInputGrid(numberOfTries, wordLength) {
    guessGrid.textContent = '';
    totalNumberOfTiles = numberOfTries * wordLength;

    for (let index = 0; index < totalNumberOfTiles; index++) {
        const element = document.createElement("div");
        element.classList.add("tile");
        guessGrid.appendChild(element);
    }
}

function setupAudio(audioSource) {
    const audio = document.getElementById('word-audio');
    audio.src = audioSource;
}

function startNewWord() {
    const position = currentLevel;
    targetWord = targetWords[position].toUpperCase();
    currentWordLength = targetWord.length;

    let numberOfTries = NUM_OF_TRIES;
    document.documentElement.style.setProperty("--rowNum", numberOfTries);
    document.documentElement.style.setProperty("--colNum", currentWordLength);

    resetKeyboard();
    createInputGrid(numberOfTries, currentWordLength);
    startInteraction();
    playWord();
}

function resetKeyboard() {
    Array.from(document.querySelectorAll('.key')).forEach((el) => {
        el.classList.remove(WRONG);
        el.classList.remove('wrong-location');
        el.classList.remove(CORRECT);
    });
}


function startInteraction() {
    document.addEventListener("click", handleMouseClick);
    document.addEventListener("keydown", handleKeyPress);
}

function stopInteraction() {
    document.removeEventListener("click", handleMouseClick);
    document.removeEventListener("keydown", handleKeyPress);
}

function handleMouseClick(e) {
    if (e.target.matches("[data-key]")) {
        pressKey(e.target.dataset.key);
        return;
    }

    if (e.target.matches("[data-enter]")) {
        submitGuess();
        return;
    }

    if (e.target.matches("[data-delete]")) {
        deleteKey();
        return;
    }
}

function handleKeyPress(e) {
    if (e.key === "Enter") {
        submitGuess();
        return;
    }

    if (e.key === "Backspace" || e.key === "Delete") {
        deleteKey();
        return;
    }

    if (e.key.match(/^[a-z]$/)) {
        pressKey(e.key);
        return;
    }
}

function pressKey(key) {
    const activeTiles = getActiveTiles();
    if (activeTiles.length >= currentWordLength) return;
    const nextTile = guessGrid.querySelector(":not([data-letter])");
    nextTile.dataset.letter = key.toLowerCase();
    nextTile.textContent = key;
    nextTile.dataset.state = "active";
}

function deleteKey() {
    const activeTiles = getActiveTiles();
    const lastTile = activeTiles[activeTiles.length - 1];
    if (lastTile == null) return;
    lastTile.textContent = "";
    delete lastTile.dataset.state;
    delete lastTile.dataset.letter;
}

function submitGuess() {
    const activeTiles = [...getActiveTiles()];
    if (activeTiles.length !== currentWordLength) {
        showAlert("Not enough letters");
        shakeTiles(activeTiles);
        return;
    }

    const guess = activeTiles.reduce((word, tile) => {
        return word + tile.dataset.letter.toUpperCase();
    }, "");

    stopInteraction();

    let correctRemoved = targetWord.split('');
    for (let i = 0; i < targetWord.length; i++) {
        if(guess[i] == targetWord[i]) {
            correctRemoved[i] = ' ';
        }
    }

    activeTiles.forEach((...params) => flipTile(...params, guess, correctRemoved));
}

function flipTile(tile, index, array, guess, correctRemoved) {
    const letter = tile.dataset.letter.toUpperCase();
    const key = keyboard.querySelector(`[data-key="${letter}"i]`);
    setTimeout(() => {
        tile.classList.add("flip");
    }, (index * FLIP_ANIMATION_DURATION) / 2);

    tile.addEventListener(
        "transitionend",
        () => {
            tile.classList.remove("flip");
            if (targetWord[index] === letter) {
                tile.dataset.state = CORRECT;
                key.classList.add(CORRECT);
            } else if (correctRemoved.includes(letter)) {
                tile.dataset.state = "wrong-location";
                key.classList.add("wrong-location");
            } else {
                tile.dataset.state = WRONG;
                key.classList.add(WRONG);
            }

            if (index === array.length - 1) {
                tile.addEventListener(
                    "transitionend",
                    () => {
                        startInteraction();
                        checkWinLose(guess, array);
                    },
                    { once: true }
                )
            }
        },
        { once: true }
    );
}

function getActiveTiles() {
    return guessGrid.querySelectorAll('[data-state="active"]');
}

function showAlert(message, duration = 1000) {
    const alert = document.createElement("div")
    alert.textContent = message
    alert.classList.add("alert")
    alertContainer.prepend(alert)
    if (duration == null) return

    setTimeout(() => {
        alert.classList.add("hide");
        alert.addEventListener("transitionend", () => {
            alert.remove();
        });
    }, duration);
}

function shakeTiles(tiles) {
    tiles.forEach(tile => {
        tile.classList.add("shake");
        tile.addEventListener(
            "animationend",
            () => {
                tile.classList.remove("shake")
            },
            { once: true }
        );
    });
}

function checkWinLose(guess, tiles) {
    if (guess === targetWord) {
        danceTiles(tiles);
        stopInteraction();
        setTimeout(() => showProgress(), 2000);
        return;
    }

    const remainingTiles = guessGrid.querySelectorAll(":not([data-letter])");
    if (remainingTiles.length === 0) {
        showFailedWord(targetWord);
        setTimeout(() => showProgress(), 2000);
        stopInteraction();
    }
}

function danceTiles(tiles) {
    tiles.forEach((tile, index) => {
        setTimeout(() => {
            tile.classList.add("dance");
            tile.addEventListener(
                "animationend",
                () => {
                    tile.classList.remove("dance");
                },
                { once: true }
            );
        }, (index * DANCE_ANIMATION_DURATION) / 5)
    });
}

function showFailedWord() {

}

const levelState1 = { step: 1, guesses: [WRONG, CORRECT, null, null], word: 'tomato' };
const levelState2 = { step: 2, guesses: [WRONG, WRONG, WRONG, WRONG], word: 'hero' };
const levelState3 = { step: 3, guesses: [WRONG, WRONG, WRONG, CORRECT], word: 'sauce', currentLevel: true };
const levelState4 = { step: 4, guesses: [null, null, null, null], word: null };
const levelState5 = { step: 5, guesses: [null, null, null, null], word: null };
const levelState6 = { step: 5, guesses: [null, null, null, null], word: null };
const levelState7 = { step: 5, guesses: [null, null, null, null], word: null };
const levelState8 = { step: 5, guesses: [null, null, null, null], word: null };
const levelState9 = { step: 5, guesses: [null, null, null, null], word: null };
const levelState10 = { step: 5, guesses: [null, null, null, null], word: null };
const levelState11 = { step: 5, guesses: [null, null, null, null], word: null };
const levelState12 = { step: 5, guesses: [null, null, null, null], word: null };

const gameState = {
    name: "Fancy words", levels: [levelState1, levelState2, levelState3,
        levelState4, levelState5, levelState6, levelState7, levelState8, levelState9, levelState10, levelState11, levelState12]
};


function showProgress() {
    progressModalHeader.innerText = gameState.name;
    progressList.textContent = '';
    gameState.levels.forEach(levelState => {

        let addTo = progressList;
        if (levelState.currentLevel) {
            const wrapper = document.createElement("div");
            wrapper.classList.add('progress-wrapper');
            addTo = wrapper;
            progressList.appendChild(wrapper);
        }
        //step
        const elementStep = document.createElement("div");
        elementStep.innerText = levelState.step;
        elementStep.classList.add('step');
        addTo.appendChild(elementStep);

        //scores

        const elementScore = document.createElement("div");
        elementScore.classList.add('scores');
        levelState.guesses.forEach(guess => {
            const score = document.createElement("div");
            score.classList.add('icon');
            if (guess == CORRECT) {
                score.dataset.state = CORRECT;
            } else if (guess == WRONG) {
                score.dataset.state = WRONG;
            }

            elementScore.appendChild(score);
        });

        addTo.appendChild(elementScore);

        //answer word

        const elementWord = document.createElement("div");
        elementWord.classList.add('word');
        elementWord.innerText = levelState.word;
        addTo.appendChild(elementWord);
    });

    progressModal.classList.remove("hide");
}

//startNewWord();
// showProgress();

function showQuestList() {
    game.classList.add('hide');
    questList.classList.remove('hide');

    load();
}


async function load() {


    const response = await fetch("quests.json");
    const fileContents = await response.json();
    quests = fileContents.quests;

    questList.textContent = '';
    quests.forEach(quest => {

        const item = document.createElement("div");
        item.classList.add('quest-item');
        item.dataset.title = quest.title;

        const title = document.createElement("div");
        title.classList.add('title');
        title.innerText = quest.title;

        item.append(title);

        const icon = document.createElement("div");
        icon.classList.add('icon');
        icon.dataset.state = getQuestStatus(quest.title);

        item.append(icon);

        item.addEventListener("click", handleSelection);

        questList.appendChild(item);
    });

}

function handleSelection(e) {
    e.preventDefault();
    const questName = (e.target.getAttribute("data-title"));

    startGame(questName)

}


function getQuestStatus(questName) {
    let status = localStorage.getItem(questName.toLowerCase());

    if (status == 'complete') {
        return "complete";
    }

    return status ? "partial" : "unfinished";
}




function startGame(questName) {
    questName = questName;
    targetWords = quests.find(q => q.title == questName).words;

    currentLevel = 0;
    questList.classList.add('hide');
    game.classList.remove('hide');
    startNewWord();
}


showQuestList();