
// Load the list of quests
// create 
// <div class="quest-item" data-key="daysOfTheWeek">
// <div class="title">Days of the Week</div>
// <div class="icon" data-state="unknown"></div>
// </div>

const questList = document.querySelector(".quest-list");

async function load() {
    const response = await fetch("quests.json"); 
    const fileContents = await response.json(); 

    const quests = fileContents.quests;

    questList.textContent = '';
    quests.forEach(quest => {
        
        const item = document.createElement("div");
        item.classList.add('quest-item');
        item.dataset.key = quest.title;

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
    console.log(e.target.getAttribute("data-key"));

}


function getQuestStatus(questName) {
    let status = localStorage.getItem(questName.toLowerCase());

    if(status == 'complete') {
        return "complete";
    }

    return status ? "partial" : "unfinished";
}

load();