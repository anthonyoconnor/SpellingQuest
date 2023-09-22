const numberNames = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];
async function loadAdditionTables() {
    const response = await fetch("math.json?v=1");
    const fileContents = await response.json();
    addition = fileContents.addition;

    for (let index = 0; index < addition.length; index++) {
        const table = createMathTable(numberNames[index + 1], "+", addition[index],);
        // Append the table to the specified container
        document.getElementById("table-container").appendChild(table);
    }
}

function createMathTable(name, symbol, data, operator) {
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

loadAdditionTables();