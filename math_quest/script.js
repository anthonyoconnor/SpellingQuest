const numberNames = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];

let currentIndex = -1;
let additionData = createAdditionData();
let multiplicationData = createMultiplicationData();
let subtractionData = createSubtractionData();
let divisionData = createDivisionData();

const allTables = document.getElementById("allTables");
const singleTable = document.getElementById("singleTable");
const showAllButton = document.getElementById("showAll");
const practiceButton = document.getElementById("practice");
const quizButton = document.getElementById("quiz");

showAllButton.addEventListener("click", (e) => {
    resetEnabledButtons();
    displayInitialView();
    e.preventDefault();
});

practiceButton.addEventListener("click", (e) => {
    loadInputTable(additionData[currentIndex], currentIndex, "+");
    resetEnabledButtons();
    practiceButton.classList.add("enabled");
    e.preventDefault();
});

quizButton.addEventListener("click", (e) => {
    const data = shuffleArray(additionData[currentIndex]);
    loadInputTable(data, currentIndex, "+");
    resetEnabledButtons();
    quizButton.classList.add("enabled");
    e.preventDefault();
});

function resetEnabledButtons() {
    const buttons = document.querySelectorAll("a");
    for (const button of buttons) {
        button.classList.remove("enabled");
    }
}





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
            displaySingleView(index);
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

function loadInputTable(data, index, symbol) {

    const table = createMathTableWithInput(numberNames[index + 1], symbol, data);
    const single = document.getElementById("single-table-container");
    single.innerHTML = "";
    single.appendChild(table);

    currentInputIndex = -1;
    console.log(data.length);
    goToNextRow(data.length);  
}

function disableRowInputs(index) {
    const input = document.getElementById(`input-${index}`);
    input.disabled = true;

    const checkTd = document.getElementById(`check-${index}`);
    checkTd.innerHTML = "";

    const answerTd = document.getElementById(`answer-${index}`);
    answerTd.innerHTML = "";
}

function goToNextRow(maxRows) {
    currentInputIndex++;
    // if the current index is greater than 0
    // then disable the input in the previous indexed row
    // remove the check button from the previous indexed row
    // remove the answer button from the previous indexed row
    if (currentInputIndex > 0) {
       disableRowInputs(currentInputIndex - 1);
    }


    if (currentInputIndex < maxRows) {
        const input = document.getElementById(`input-${currentInputIndex}`);
        input.disabled = false;

        const checkButton = document.createElement("button");
        checkButton.classList.add("check");
        checkButton.innerHTML = "Check";
        const checkTd = document.getElementById(`check-${currentInputIndex}`);
        checkTd.appendChild(checkButton);

        const answerButton = document.createElement("button");
        answerButton.classList.add("answer");
        answerButton.innerHTML = "Answer";
        const answerTd = document.getElementById(`answer-${currentInputIndex}`);
        answerTd.appendChild(answerButton);

        input.focus();

        checkButton.addEventListener("click", (e) => {
            const input = document.getElementById(`input-${currentInputIndex}`);
            const key = input.getAttribute("data-key");
            if (input.value == key) {
                input.style.backgroundColor = "green";
                goToNextRow(maxRows);
            } else {
                input.style.backgroundColor = "red";
            }
            e.preventDefault();
        });

        answerButton.addEventListener("click", (e) => {
            const input = document.getElementById(`input-${currentInputIndex}`);
            const key = input.getAttribute("data-key");
            input.value = key;
            input.style.backgroundColor = "yellow";
            goToNextRow(maxRows);
            e.preventDefault();
        });
    } else {
            //when current index is equal to the number of rows
        //show the users score

        const result = document.getElementById("result");
        result.innerHTML = "You got 5 correct";
    }
}

function createMathTableWithInput(name, symbol, data) {
    const table = document.createElement("table");

    // Table header
    const thead = document.createElement("thead");
    thead.innerHTML = `<tr><th colspan="7">${name}</th></tr>`;
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
        addEmptyTd(`answer-${index}`, row);

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

function displayInitialView() {
    loadAllTables(additionData, "+");
    allTables.classList.remove("hide");
    singleTable.classList.add("hide");
}

function displaySingleView(index) {
    loadSingleTable(additionData[index], numberNames[index + 1], "+");
    allTables.classList.add("hide");
    singleTable.classList.remove("hide");
}


displayInitialView();

