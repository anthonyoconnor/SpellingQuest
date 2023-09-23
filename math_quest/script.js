const numberNames = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];
let fileContents = null;


async function loadAdditionTables() {
    addition = fileContents.addition;

    for (let index = 0; index < addition.length; index++) {
        const table = createMathTable(numberNames[index + 1], "+", addition[index]);
        const div = document.createElement("div");
        div.classList.add('individual-table-container');
        div.appendChild(table);
        div.addEventListener("click", (_) => {
            console.log("index clicked: " + index)
        })
        document.getElementById("table-container").appendChild(div);
    }
}

async function loadSingleAdditionTable(index) {
    addition = fileContents.addition;
    const table = createMathTable(numberNames[index + 1], "+", addition[index]);

    document.getElementById("single-table-container").appendChild(table);

}

async function loadInputAdditionTable(index, randomize) {
    addition = fileContents.addition;
    const data = randomize ? shuffleArray(addition[index]) : addition[index];
    const table = createMathTableWithInput(numberNames[index + 1], "+", data);
    document.getElementById("single-table-container").appendChild(table);
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
    input.value = result;
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

// loadAdditionTables();
// loadSingleAdditionTable(11);


async function loadData() {
    const response = await fetch("math.json?v=1");
    fileContents = await response.json();
    loadInputAdditionTable(11, false);
}

loadData();

