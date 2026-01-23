import { categories } from "./categories.js";

const siteSettings = {
    siteTheme: "light", // dark | light
    language: "tr"      // tr | en
};

let gameSettings = {
    sfxVolume: 80,
    rotatePlayerOrder: true,
    impostorClue: true,
    food:true,
    animals:true,
    sports:true,
    professions:false,
    countries:false,
    technology:false,
    home:false,
    transportation:false,
    turkey_cities:false,
    university_departments:false,
    clash_royale_cards:false
};

function getCounterValue(counterId) {
    const counterElement = document.getElementById(counterId);
    return parseInt(counterElement.textContent);
}

let players = [];

function initializePlayers(count, playerNames) {
    players = [];
    for (let i = 0; i < count; i++) {
        players.push({
            //name: `Player ${i + 1}`,
            name: `${playerNames[i]}`,
            status: "innocent"
        });
    }
    assignImposters();
}

function assignImposters() {
    // Randomly assigns some players as imposter. Improve the algorithm later.
    // First, reset all players to innocent
    players.forEach(player => {
        player.status = "innocent";
    });
    const imposterCount = getCounterValue("counter-value-imposters");
    for (let i = 0; i < imposterCount; i++)
    {
        let impostorIndex = Math.floor(Math.random() * players.length);
        while (players[impostorIndex].status === "imposter"){
            impostorIndex = Math.floor(Math.random() * players.length);
        }
        players[impostorIndex].status = "imposter";
    }
}

function getImposters() {
    return players.filter(player => player.status === "imposter");
}

const theWord = {word:"notselectedyet", categorytr:"none", categoryeng:"none"};

function updateGameSettings(){
    const categoryCheckboxes = document.querySelectorAll(".category-checkbox");

    categoryCheckboxes.forEach(function (currentElement){
        const categoryName = currentElement.id.replace('category-', '');
        gameSettings[categoryName] = currentElement.checked;
        //alert(categoryName +" is set to " + gameSettings[categoryName])
    });
    localStorage.setItem('userGameSettings', JSON.stringify(gameSettings));
    console.log("Oyun ayarları LocalStorage'a kaydedildi.");
}

function updateLanguage(...elementsToUpdate) {
    let elements = elementsToUpdate;
    if (elementsToUpdate.length === 0){ //spesifik istek yoksa her şeyi update et.
        elements = document.querySelectorAll('[data-tr], [data-eng]');
    }
    elements.forEach((element) => {
    if (siteSettings.language === "tr") {
        element.innerHTML = element.getAttribute("data-tr")
    } else {
        element.innerHTML = element.getAttribute("data-eng")
    }
})};

function applyTheme(newTheme) {
    if (newTheme === "dark") {
            siteSettings.siteTheme = "dark";
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem("theme", "dark");
        } else {
            siteSettings.siteTheme = "light";
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem("theme", "light");
    }
}

let categoryIndexMap = new Map(); // kategori isimlerini son eklenen kelimenin indexi ile eşleyecek
function startGame(){
    const wordList = [];
    for (const key in gameSettings){
        if (categories[key] && gameSettings[key] === true){ // eğer category varsa ve seçiliyse
            if(siteSettings.language === 'tr') {
                wordList.push(...categories[key].tr_words);
            } else {
                wordList.push(...categories[key].en_words); 
            }
            categoryIndexMap.set(key, wordList.length - 1); // son eklenen kelimenin indexi
        }
        //console.log("categoryIndexMap : " + categoryIndexMap);
    }
    if (wordList.length === 0) {
        console.warn("No categories selected or no words available");
    }

    //randomly select a word from wordList
    const randint = Math.floor(Math.random() * wordList.length);
    let wordCategory = "none";
    for (let [category, index] of categoryIndexMap) {
        if (randint < index){
            wordCategory = category;
            break;
        }
    }
    console.log("randint : "+ randint + " word is " + wordList[randint] + " word's category is " + wordCategory);
    theWord.word = wordList[randint];
    if (siteSettings.language === "tr"){
        wordCategory = categories[wordCategory].tr_description;
        theWord.categorytr = wordCategory;
    }   else {
        wordCategory = categories[wordCategory].en_description;
        theWord.categoryeng = wordCategory;
    }
}
function createPlayerNameInput(firstPlayerNumber, times=1) {
    let currentValue = firstPlayerNumber;
    for (let i = 0; i < times; i++){
        const div = document.createElement("div");
        div.className = "player-name-container";
        const text = document.createElement(`label`);
        text.dataset.eng = `Player ${currentValue}'s name : `;
        text.dataset.tr = `Oyuncu ${currentValue} ismi : `;
        const input = document.createElement("input");        
        if (siteSettings.language === "tr"){
            input.value = `Oyuncu ${currentValue}`;
        } else {
            input.value = `Player ${currentValue}`;
        }
        div.appendChild(text);
        div.appendChild(input);
        const liarCounter = document.querySelector("#liar-counter");
        liarCounter.parentNode.insertBefore(div, liarCounter);
        input.id = `player${currentValue}-name-input`;
        text.htmlFor = input.id;
        updateLanguage(text);
        currentValue++;
    }
}

function deletePlayerNameInput() {
    const liarCounter = document.querySelector("#liar-counter");
    liarCounter.previousElementSibling.remove();
}

document.addEventListener('DOMContentLoaded', function() {
    //Load localstorage
    const savedGameSettings = localStorage.getItem('userGameSettings');
    if (savedGameSettings){
        gameSettings= JSON.parse(savedGameSettings);

        for (const key in gameSettings) {
            if (document.getElementById('category-' + key)) {
                const checkbox = document.getElementById('category-' + key);
                checkbox.checked = gameSettings[key];
            }
        }
    }
    //Load language 
    siteSettings.language = localStorage.getItem("lang") ? localStorage.getItem("lang") : "tr"
    const langSelect = document.querySelector("#language-select");
    langSelect.value = siteSettings.language;
    langSelect.addEventListener('change', (event) => {
        //console.log(event);
        siteSettings.language = event.target.value;
        localStorage.setItem("lang", siteSettings.language);
        updateLanguage();
    });
    updateLanguage(); // sayfa yüklendiğinde dili ayarla

    createPlayerNameInput(1,4);
    if (siteSettings.language === "tr"){
        initializePlayers(4,["Oyuncu 1","Oyuncu 2","Oyuncu 3","Oyuncu 4"]);
    } else {
        initializePlayers(4,["Player 1","Player 2","Player 3","Player 4"]);
    }

    const btnDecrease = document.querySelectorAll('.counter-decrease-btn');
    const btnIncrease = document.querySelectorAll('.counter-increase-btn');
    //const counterDisplay = document.querySelectorAll('.counter-value');

    btnDecrease.forEach(function (currentElement){
        currentElement.addEventListener('click', () => {
            let currentValue = parseInt(currentElement.previousElementSibling.textContent);
            if ((currentValue > 1 && currentElement.dataset.target === "imposters") || (currentValue > 3 && currentElement.dataset.target === "players")) {
                currentValue -= 1;
                currentElement.previousElementSibling.textContent = currentValue;
                if (currentElement.dataset.target === "players"){
                    deletePlayerNameInput();
                } 
            }   
        });
    });
    btnIncrease.forEach(function (currentElement){
        currentElement.addEventListener('click', () => {
            let currentValue = parseInt(currentElement.nextElementSibling.textContent);
            //console.log(currentValue);
            if (currentValue < 10 && (currentElement.dataset.target === "players" || currentValue < getCounterValue("counter-value-players") - 1)) {
                currentValue += 1;
                currentElement.nextElementSibling.textContent = currentValue;
                if (currentElement.dataset.target === "players"){
                    createPlayerNameInput(currentValue);
                }            
            }
            //if(getCounterValue("counter-value-imposters") === getCounterValue("counter-value-players")){
            //    console.log("Joke run.");
            //}
        });
    });

    //Load theme
    siteSettings.siteTheme = localStorage.getItem("theme") ? localStorage.getItem("theme") : "light"
    applyTheme(siteSettings.siteTheme);
    const darkModeCheckbox = document.getElementById('darkmode-checkbox');
    darkModeCheckbox.checked = (siteSettings.siteTheme === "dark");
    darkModeCheckbox.addEventListener('change', (event) => {
        const newTheme = event.target.checked ? "dark" : "light";
        applyTheme(newTheme);
    }); 

    const triggerButtons = document.querySelectorAll('.trigger-modal');
    const closeModal = document.querySelectorAll('.closemodal-btn');
    
    const turnText = document.querySelector("#turn-info");//for the game refresh
    
    triggerButtons.forEach(function (currentElement){
        currentElement.addEventListener('click', () => {
            if (currentElement.id === "start-btn"){
                startGame();
                turnText.hidden = false;
                turnText.dataset.tr = `Sıradaki Oyuncu : ${players[0].name}`;
                turnText.dataset.eng = `${players[0].name}'s turn`;
                updateLanguage(turnText);
            }
            document.getElementById(currentElement.dataset.target).showModal();
        });
    });
    closeModal.forEach(function (currentElement){
        currentElement.addEventListener('click', () => {
            if (currentElement.dataset.target == "modal-settings"){ // eğer ayarlar modali kapatılıyorsa
                updateGameSettings();
                const playerNames = [];
                const playerCount = getCounterValue("counter-value-players");
                for (let i = 0; i < playerCount; i++)
                {
                    const input = document.querySelector(`#player${i+1}-name-input`);
                    playerNames[i] = input.value;
                }
                initializePlayers(playerCount, playerNames);
                //console.log(players);
            }
            document.getElementById(currentElement.dataset.target).close();
        
        });
    });
    // Game
    const gameButton = document.querySelector("#game-btn"); //for game start button
    const wordInfo = document.querySelector("#word-info");
    const hint = document.querySelector("#hint-info");

    let gameButtonStateCount = 0;
    gameButton.addEventListener('click', ()=> {
        console.log(players);
        gameButtonStateCount++;
        const currentPlayer = Math.floor(gameButtonStateCount / 2);
        console.log("gameButtonStateCount : "+ gameButtonStateCount);
        if (gameButtonStateCount % 2 === 1 && gameButtonStateCount < (getCounterValue("counter-value-players") * 2)){
            turnText.dataset.tr = `Sıradaki Oyuncu : ${players[currentPlayer].name}`;
            turnText.dataset.eng = `${players[currentPlayer].name}'s turn`;
            turnText.hidden = false;
            gameButton.dataset.tr = "Sıranı geç";
            gameButton.dataset.eng = "Pass";
            gameButton.dataset.state="passTurn";
            if (players[currentPlayer].status === "innocent"){
                wordInfo.dataset.tr = `Kelimen : ${theWord.word}`;
                wordInfo.dataset.eng = `Your word : ${theWord.word}`;
                hint.dataset.tr = `Kategori : ${theWord.categorytr}.`;
                hint.dataset.eng = `Category : ${theWord.categoryeng}`;
                hint.hidden = false;
            } else {
                wordInfo.dataset.tr = `Sen bir yalancısın! Gizli kalmaya çalış.`;
                wordInfo.dataset.eng = `You are a liar! Try to stay hidden.`;
                if (gameSettings.impostorClue === true){
                    hint.dataset.tr = `Kategori İpucusu: ${theWord.categorytr}.`;
                    hint.dataset.eng = `Category Hint : ${theWord.categoryeng}`;
                    hint.hidden = false;
                }
            }
            wordInfo.hidden = false;
            updateLanguage(turnText, gameButton, wordInfo, hint);
        } else if (gameButtonStateCount % 2 === 0 && gameButtonStateCount < (getCounterValue("counter-value-players") * 2)) {
            turnText.dataset.tr = `Sıradaki Oyuncu : ${players[currentPlayer].name}`;
            turnText.dataset.eng = `${players[currentPlayer].name}'s turn`;
            gameButton.dataset.tr = "Kelimeni göster";
            gameButton.dataset.eng = "Show your word";
            wordInfo.hidden = true;
            hint.hidden = true;
            updateLanguage(turnText, gameButton);
        }
        else if (gameButtonStateCount === (getCounterValue("counter-value-players") * 2)){
            gameButton.dataset.tr = "Yalancıyı Göster";
            gameButton.dataset.eng = "Reveal the Liar";
            turnText.dataset.tr = "Tüm oyuncular kelimelerini gördü. Oyun başladı.";
            wordInfo.hidden = true;
            hint.hidden = true;
            updateLanguage(gameButton);
        }
        else if (gameButtonStateCount === (getCounterValue("counter-value-players") * 2) + 1){
            gameButton.dataset.tr = "Oyunu Bitir";
            gameButton.dataset.eng = "Close the Game";
            const imposters = getImposters();
            if (imposters.length === 1){
                wordInfo.dataset.tr = `Yalancı : ${imposters.map(imp => imp.name).join(", ")}`;
                wordInfo.dataset.eng = `Liar : ${imposters.map(imp => imp.name).join(", ")}`;
            } else {
                wordInfo.dataset.tr = `Yalancılar : ${imposters.map(imp => imp.name).join(", ")}`;
                wordInfo.dataset.eng = `Liars : ${imposters.map(imp => imp.name).join(", ")}`;
            }
            wordInfo.hidden = false;
            wordInfo.style.fontSize = "1.5em";
            wordInfo.style.fontWeight = "bold";
            turnText.hidden = true;
            updateLanguage(gameButton, wordInfo);
        }
        else {
            gameButtonStateCount = 0;
            gameButton.dataset.tr = "Kelimeni göster";
            gameButton.dataset.eng = "Show your word";
            wordInfo.hidden = true;
            hint.hidden = true;
            updateLanguage(turnText, gameButton, wordInfo, hint);
            if (gameSettings.rotatePlayerOrder) {
                players.unshift(players.pop()); // rotate the players array
            }
            assignImposters();
            document.querySelector("#modal-game").close();
        }
    });
});