const numberNames = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];

let currentIndex = -1;
let additionData = createAdditionData();
let multiplicationData = createMultiplicationData();
let subtractionData = createSubtractionData();
let divisionData = createDivisionData();

let currentData = additionData;
let currentSymbol = "+";

const allTables = document.getElementById("allTables");
const singleTable = document.getElementById("singleTable");
const showAllButton = document.getElementById("showAll");
const practiceButton = document.getElementById("practice");
const quizButton = document.getElementById("quiz");

showAllButton.addEventListener("click", (e) => {
    displayInitialView(currentData, currentSymbol);
    e.preventDefault();
});

practiceButton.addEventListener("click", (e) => {
    loadInputTable(currentData[currentIndex], currentIndex, currentSymbol, false);
    practiceButton.classList.add("enabled");
    e.preventDefault();
});

quizButton.addEventListener("click", (e) => {
    const data = shuffleArray(currentData[currentIndex]);
    loadInputTable(data, currentIndex, currentSymbol, true);
    quizButton.classList.add("enabled");
    e.preventDefault();
});


// ------------------------------------
// Create Math Tables
// ------------------------------------
function createAdditionData() {
    let data = [];

    for (let i = 1; i <= 12; i++) {
        const array = [];
        for (let j = 1; j <= 12; j++) {
            const result = i + j;
            array.push([i, j, result]);

        }
        data.push(array);
    }

    return data;
}

function createMultiplicationData() {
    let data = [];

    for (let i = 1; i <= 12; i++) {
        const array = [];
        for (let j = 1; j <= 12; j++) {
            const result = i * j;
            array.push([i, j, result]);

        }
        data.push(array);
    }

    return data;
}

function createSubtractionData() {
    let data = [];

    for (let i = 1; i <= 12; i++) {
        const array = [];
        for (let j = i; j < i + 12; j++) {
            const result = j - i;
            array.push([j, i, result]);
        }
        data.push(array);
    }

    return data;
}

function createDivisionData() {
    let data = [];

    for (let i = 1; i <= 12; i++) {
        const array = [];
        for (let j = 1; j <= 12; j++) {
            const result = i * j;
            array.push([result, i, j]);
        }
        data.push(array);
    }

    return data;
}

function loadAllTables(data, symbol) {

    const allTables = document.getElementById("table-container");
    allTables.innerHTML = "";
    for (let index = 0; index < data.length; index++) {
        const table = createMathTable(numberNames[index + 1], symbol, data[index]);
        const div = document.createElement("div");
        div.classList.add('individual-table-container');
        div.appendChild(table);
        div.addEventListener("click", (_) => {
            currentIndex = index;
            displaySingleView(index, data, symbol);
            window.scrollTo(0, 0);
        })
        allTables.appendChild(div);
    }
}

function loadSingleTable(data, name, symbol) {
    const table = createMathTable(name, symbol, data);

    const single = document.getElementById("single-table-container");
    single.innerHTML = "";
    single.appendChild(table);
}

let currentInputIndex = -1;

function loadInputTable(data, index, symbol, quiz = false) {

    const table = createMathTableWithInput(numberNames[index + 1], symbol, data, !quiz);
    const single = document.getElementById("single-table-container");
    single.innerHTML = "";
    single.appendChild(table);

    currentInputIndex = -1;
    goToNextRow(data.length, quiz);
}

function disableRowInputs(index, quiz) {
    const input = document.getElementById(`input-${index}`);
    input.disabled = true;

    const checkTd = document.getElementById(`check-${index}`);
    checkTd.innerHTML = "";

    if (!quiz) {
        const answerTd = document.getElementById(`answer-${index}`);
        answerTd.innerHTML = "";
    }
}

function goToNextRow(maxRows, quiz = false) {
    currentInputIndex++;

    if (currentInputIndex > 0) {
        disableRowInputs(currentInputIndex - 1, quiz);
    }

    if (currentInputIndex < maxRows) {
        const input = document.getElementById(`input-${currentInputIndex}`);
        input.disabled = false;
        input.focus();

        input.addEventListener("keyup", (e) => {
            if (e.key === 'Enter') {
                checkAnswer();
            }
        });

        const checkButton = document.createElement("button");
        checkButton.classList.add("check");
        checkButton.innerHTML = "Check";
        const checkTd = document.getElementById(`check-${currentInputIndex}`);
        checkTd.appendChild(checkButton);

        checkButton.addEventListener("click", (e) => {
            checkAnswer();
            e.preventDefault();
        });

        if (!quiz) {
            const answerButton = document.createElement("button");
            answerButton.classList.add("answer");
            answerButton.innerHTML = "Answer";
            const answerTd = document.getElementById(`answer-${currentInputIndex}`);
            answerTd.appendChild(answerButton);

            answerButton.addEventListener("click", (e) => {
                const input = document.getElementById(`input-${currentInputIndex}`);
                const key = input.getAttribute("data-key");
                input.value = key;
                input.style.backgroundColor = "orange";
                goToNextRow(maxRows, quiz);
                e.preventDefault();
            });
        }

    } else {
        const result = document.getElementById("result");
        result.innerHTML = "TODO: Show results";
        
        window.scrollTo(0, 0);
    }

    function checkAnswer() {
        const input = document.getElementById(`input-${currentInputIndex}`);
        const key = input.getAttribute("data-key");
        if (input.value == key) {
            input.style.backgroundColor = "green";
            goToNextRow(maxRows, quiz);
        } else if (input.value == "") {
            input.focus();
        } else {
            input.style.backgroundColor = "red";
            if (quiz) {
                goToNextRow(maxRows, quiz);
            } else {
                input.focus();
            }
        }
    }
}

function createMathTableWithInput(name, symbol, data, includeAnswerButton) {
    const table = document.createElement("table");

    // Table header
    const thead = document.createElement("thead");
    const colSpan = includeAnswerButton ? 7 : 6;
    thead.innerHTML = `<tr><th colspan="${colSpan}">${name}</th></tr>`;
    table.appendChild(thead);

    // Table body
    let index = 0;
    const tbody = document.createElement("tbody");
    for (const [first, second, result] of data) {
        const row = document.createElement("tr");

        //give unique id to each row
        row.id = `row-${index}`;

        addBasicTd(first, row);
        addBasicTd(symbol, row);
        addBasicTd(second, row);
        addBasicTd("=", row);
        addInput(result, row, index);
        addEmptyTd(`check-${index}`, row);
        if (includeAnswerButton) {
            addEmptyTd(`answer-${index}`, row);
        }
        tbody.appendChild(row);

        index++;
    }
    table.appendChild(tbody);

    return table;
}

function addButton(result, cssClass, label, row) {
    const button = document.createElement("button");
    button.classList.add(cssClass);
    button.setAttribute("data-key", result);
    button.innerHTML = label;
    const td = document.createElement("td");

    td.appendChild(button);
    row.appendChild(td);
}

function addInput(result, row, index) {
    const input = document.createElement("input");
    input.classList.add("guess");
    input.id = `input-${index}`;
    input.type = "tel";
    input.disabled = true;
    input.setAttribute("data-key", result);
    const td = document.createElement("td");

    td.appendChild(input);
    row.appendChild(td);
}

function addBasicTd(symbol, row) {
    const td = document.createElement("td");
    td.innerHTML = symbol;
    row.appendChild(td);
}

function addEmptyTd(id, row) {
    const td = document.createElement("td");
    td.id = id;
    row.appendChild(td);
}

function createMathTable(name, symbol, data) {
    const table = document.createElement("table");

    // Table header
    const thead = document.createElement("thead");
    thead.innerHTML = `<tr><th colspan="5">${name}</th></tr>`;
    table.appendChild(thead);

    // Table body
    const tbody = document.createElement("tbody");
    for (const [first, second, result] of data) {
        const row = document.createElement("tr");
        row.innerHTML = `<td>${first}</td>
                        <td>${symbol}</td>
                        <td>${second}</td>
                        <td>=</td>
                        <td>${result}</td>`;
        tbody.appendChild(row);
    }
    table.appendChild(tbody);

    return table;
}

function shuffleArray(originalArray) {
    const arrayCopy = [...originalArray];

    for (let i = arrayCopy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arrayCopy[i], arrayCopy[j]] = [arrayCopy[j], arrayCopy[i]];
    }

    return arrayCopy;
}

function displayInitialView(data, symbol) {
    loadAllTables(data, symbol);
    allTables.classList.remove("hide");
    singleTable.classList.add("hide");
}

function displaySingleView(index, data, symbol) {
    loadSingleTable(data[index], numberNames[index + 1], symbol);
    allTables.classList.add("hide");
    singleTable.classList.remove("hide");
}

function setTitle(text) {
    const title = document.getElementById("title");
    title.innerHTML = text;
}

function getType() {
    // get data type based on the query string parameter 'type'
    const urlParams = new URLSearchParams(window.location.search);
    const type = urlParams.get('type');
    return type;
}

function setup() {
    const type = getType();
    let data, symbol, title;
    switch (type) {
        case "multiplication":
            data = createMultiplicationData();
            symbol = "x";
            title = "Multiplication";
            break;
        case "subtraction":
            data = createSubtractionData();
            symbol = "-";
            title = "Subtraction";
            break;
        case "division":
            data = createDivisionData();
            symbol = "/";
            title = "Division";
            break;
        default: // default to addition
            data = createAdditionData();
            symbol = "+";
            title = "Addition";
            break;
    }
    currentData = data;
    currentSymbol = symbol;
    setTitle(title);
    displayInitialView(data, symbol);
}

setup();

