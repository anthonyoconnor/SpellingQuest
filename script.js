

let quests = null;
let questName = null;
let targetWords = null;

let currentLevel = 0;

const FLIP_ANIMATION_DURATION = 500;
const DANCE_ANIMATION_DURATION = 500;
const keyboard = document.querySelector("[data-keyboard]");
const alertContainer = document.querySelector("[data-alert-container]");



const guessGrid = document.querySelector("[data-guess-grid]");
const playWordButton = document.querySelector("[data-play]");
const playNext = document.querySelector("[data-next]");
const newQuestButton = document.querySelector("[data-new-quest]");
const homeButton = document.querySelector(".home");
const helpButton = document.querySelector(".help");
const helpCloseButton = document.querySelector(".help-close");

const failedWordModal = document.querySelector("[data-failed-word-modal]");
const helpModal = document.querySelector("[data-help-modal]");

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
    failedWordModal.classList.add("hide");
    startNextWord();
});

newQuestButton.addEventListener('mousedown', (e) => {
    e.preventDefault();
    const progressModal = document.querySelector("[data-progress]");
    progressModal.classList.add("hide");
    showQuestList();
});

homeButton.addEventListener('mousedown', (e) => {
    showQuestList()
});

helpButton.addEventListener('mousedown', (e) => {
    helpModal.classList.remove("hide");
});

helpCloseButton.addEventListener('mousedown', (e) => {
    helpModal.classList.add("hide");
});


function startNextWord() {

    currentLevel++;

    if (currentLevel < targetWords.length) {
        startNewWord();
    } else {
        const wordStatus = saveEndOfGameStatus
        showSummary(questName, getWordStatus(questName));
    }
}

function saveEndOfGameStatus(questName) {
    let status = localStorage.getItem(questName.toLowerCase());
}

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


    updateProgressTrail(targetWords.length, position + 1);

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
    e.preventDefault();
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
        if (guess[i] == targetWord[i]) {
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
    const triedTiles = guessGrid.querySelectorAll("[data-letter]");

    if (guess === targetWord) {
        if(triedTiles.length == guess.length) {
            updateWordStatus(questName, targetWord, 'complete');
        } else {
            updateWordStatus(questName, targetWord, 'partial');
        }
        danceTiles(tiles);
        stopInteraction();
        setTimeout(() => startNextWord(), 2000);
        return;
    }

    const remainingTiles = guessGrid.querySelectorAll(":not([data-letter])");
    if (remainingTiles.length === 0) {
        updateWordStatus(questName, targetWord, 'attempted');
        shakeTiles(tiles);
        setTimeout(() => showFailedWord(targetWord), 1500);
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


function showFailedWord(word) {
    failedWordModal.classList.remove("hide");
    const failedWordGrid = document.querySelector("[data-failed-word]");
    failedWordGrid.innerHTML = '';
    for (let i = 0; i < word.length; i++) {
        const key = word[i];
        const element = document.createElement("div");

        element.dataset.letter = key.toLowerCase();
        element.classList.add("tile");
        element.textContent = key;
        element.dataset.state = "active";

        failedWordGrid.appendChild(element);
    }
}

function showSummary(questName, wordStatus) {

    const progressModal = document.querySelector("[data-progress]");
    const progressModalHeader = document.querySelector("[data-progress-header]");

    const results = document.querySelector("[ data-progress-results]");
    results.innerHTML = '';

    const stars = getQuestStars(questName);
    const achievements = getAchievementDiv(stars);

    results.append(achievements);

    const progressList = document.createElement("div");
    progressList.classList.add('word-list');

    progressModalHeader.innerText = questName;
    progressList.textContent = '';

    Object.entries(wordStatus).forEach(wordStatus => {
        const elementWord = document.createElement("div");
        elementWord.classList.add('word');
        elementWord.innerText = wordStatus[0];
        elementWord.dataset.status = wordStatus[1];
        progressList.appendChild(elementWord);
    });

    results.append(progressList);

    progressModal.classList.remove("hide");
}

function showQuestList() {
    game.classList.add('hide');
    questList.classList.remove('hide');

    load();
}


async function load() {
    const response = await fetch("quests.json?v=1");
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

        const stars = getQuestStars(quest.title);

        const achievements = getAchievementDiv(stars);

        item.append(achievements);

        item.addEventListener("click", handleSelection);

        questList.appendChild(item);
    });
}


function getAchievementDiv(completedStars) {
    const achievements = document.createElement("div");
    achievements.classList.add('achievements');


    for (let i = 1; i <= 3; i++) {
        const icon = document.createElement("div");
        icon.classList.add('icon');
        if (i <= completedStars) {
            icon.dataset.state = 'complete';
        }

        achievements.append(icon);
    }
    return achievements;
}

function handleSelection(e) {
    e.preventDefault();
    const questName = (e.target.getAttribute("data-title"));

    startGame(questName)

}


function getQuestStars(questName) {
    const questStatus = getWordStatus(questName);

    if(!questStatus) {
        return 0;
    }

    const wordStatuses = Object.entries(questStatus).map(x => x[1]);

    const allComplete = wordStatuses.every(x => x == 'complete');
    const someNotTried = wordStatuses.some(x => x == null);
    const allNotTried = wordStatuses.every(x => x == null);
    const someAttempted = wordStatuses.some(x => x == 'attempted');

    if(allNotTried || someNotTried) {
        return 0;
    }

    if(allComplete) {
        return 3;
    } 

    if(someAttempted) {
        return 1;
    }

    return 2;
}

function getWordStatus(questName) {
    const stored = localStorage.getItem(questName.toLowerCase());
    return JSON.parse(stored);
}

function saveWordStatus(questName, wordStatus) {
    localStorage.setItem(questName.toLowerCase(), JSON.stringify(wordStatus));
}

function updateWordStatus(questName, word, status) {
    const wordStatus = getWordStatus(questName);
    wordStatus[word.toLowerCase()] = status;
    saveWordStatus(questName, wordStatus);
}


function startGame(newQuestName) {
    questName = newQuestName;
    targetWords = quests.find(q => q.title == questName).words;

    const wordStatus = Object.assign({}, ...targetWords.map((x) => ({[x.toLowerCase()]: null})));

    // If there is already a status for a quest, this will overwrite it.
    // Might want to consider only doing this if their result is better?
    saveWordStatus(questName, wordStatus);

    currentLevel = 0;
    questList.classList.add('hide');
    game.classList.remove('hide');
    startNewWord();
}




function updateProgressTrail(total, current) {
    const progress = document.querySelector(".progress-trail");
    progress.innerHTML = '';

    for (let i = 1; i <= total; i++) {
        const item = document.createElement("div");
        item.classList.add('progress-icon');
        item.dataset.state = i < current ? 'complete' : 'incomplete';
        if (current == i) {
            item.dataset.state = 'current';
        }
        progress.appendChild(item);
    }
}




showQuestList();
