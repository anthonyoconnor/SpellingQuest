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

function loadInputTable(data, index, symbol) {

    const table = createMathTableWithInput(numberNames[index + 1], symbol, data);
    const single = document.getElementById("single-table-container");
    single.innerHTML = "";
    single.appendChild(table);
    // Enable first input and set focus 
    const firstInput = table.querySelector("input");
    firstInput.disabled = false;
    firstInput.focus();
    // only show buttons for the current choice.
    const buttons = table.querySelectorAll("button");
    for (const button of buttons) {
        button.style.display = "none";
    }
    const firstButton = table.querySelector("button.check");
    firstButton.style.display = "inline-block";
    const helpButton = table.querySelector("button.help");
    helpButton.style.display = "inline-block";

    //when check button is clicked check if the input value matches the data-key value
    firstButton.addEventListener("click", (_) => {
        const input = firstInput.value;
        const key = firstButton.getAttribute("data-key");
        if (input === key) {
            firstInput.classList.add("correct");
        } else {
            firstInput.classList.add("incorrect");
        }
        firstInput.disabled = true;
        firstButton.style.display = "none";
        helpButton.style.display = "none";
    },
        { once: true }
    );
}

function createMathTableWithInput(name, symbol, data) {
    const table = document.createElement("table");

    // Table header
    const thead = document.createElement("thead");
    thead.innerHTML = `<tr><th colspan="7">${name}</th></tr>`;
    table.appendChild(thead);

    // Table body
    const tbody = document.createElement("tbody");
    for (const [first, second, result] of data) {
        const row = document.createElement("tr");

        addBasicTd(first, row);
        addBasicTd(symbol, row);
        addBasicTd(second, row);
        addBasicTd("=", row);
        addInput(result, row);
        addButton(result, "check", "Check", row);
        addButton(result, "help", "?", row);

        tbody.appendChild(row);
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

function addInput(result, row) {
    const input = document.createElement("input");
    input.classList.add("guess");
    input.type = "tel";
    //input.value = result;
    const td = document.createElement("td");

    td.appendChild(input);
    row.appendChild(td);
}

function addBasicTd(symbol, row) {
    const td = document.createElement("td");
    td.innerHTML = symbol;
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

