import { categories } from "./categories.js";

const siteSettings = {
    siteTheme: "light", // dark | light
    language: "tr"      // tr | en
};

let gameSettings = {
    version: "v1.0.0-beta4",
    sfxVolume: 80,
    rotatePlayerOrder: true,
    impostorClue: true,
    impostorShowWordLength: true,
    impostersSeeOtherImposters: false,
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
    clash_royale_cards:false,
    historical_figures:false
};

function getCounterValue(counterId) {
    const counterElement = document.getElementById(counterId);
    return parseInt(counterElement.textContent);
}

let players = [];
let jokeRound = 0;

function initializePlayers(count, playerNames) {
    players = [];
    for (let i = 0; i < count; i++) {
        players.push({
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
    const imposterCount = Math.min(getCounterValue("counter-value-imposters"),
                                    players.length);
    // Select unique random indices for imposters
    const selectedIndices = new Set();
    while (selectedIndices.size < imposterCount) {
        selectedIndices.add(Math.floor(Math.random() * players.length));
    }

    // Assign imposter status to the selected players
    selectedIndices.forEach(index => {
        players[index].status = "imposter";
        //console.log(`Player ${players[index].name} is an imposter.`);
    });

}

function getImposters() {
    return players.filter(player => player.status === "imposter");
}

const theWord = {word:"notselectedyet", categorytr:"none", categoryeng:"none"};

function updateGameSettings(){
    const settingCheckboxes = document.querySelectorAll(".settings-checkbox");
    
    settingCheckboxes.forEach(function (currentElement){
        if (currentElement.classList.contains("category-checkbox")){
            const categoryName = currentElement.id.replace('category-', '');
            gameSettings[categoryName] = currentElement.checked;
        }
        //daha modüler hale getir bu kısmı
        if (currentElement.id === "checkbox-rotate-player-order"){
            gameSettings.rotatePlayerOrder = currentElement.checked;
        }
        if (currentElement.id === "checkbox-imposter-clue"){
            gameSettings.impostorClue = currentElement.checked;
        }
        if (currentElement.id === "checkbox-imposter-show-word-length"){
            gameSettings.impostorShowWordLength = currentElement.checked;
        }
        if (currentElement.id === "checkbox-imposters-see-other-imposters"){
            gameSettings.impostersSeeOtherImposters = currentElement.checked;
        }
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
function startGame(startButton) {
    const wordList = [];
    categoryIndexMap.clear();
    for (const key in gameSettings){
        if (categories[key] && gameSettings[key] === true){ // eğer category varsa ve seçiliyse
            if(siteSettings.language === 'tr') {
                wordList.push(...categories[key].tr_words);
            } else {
                wordList.push(...categories[key].en_words); 
            }
            categoryIndexMap.set(key, wordList.length - 1); // son eklenen kelimenin indexi
        }
    }
    if (wordList.length === 0) {
        console.warn("No categories selected or no words available");
        if (siteSettings.language === "tr"){
            alert("Lütfen en az bir kategori seçin");
        } else {
            alert("Please select at least one category");
        }
        return false;
    }

    //randomly select a word from wordList
    const randint = Math.floor(Math.random() * wordList.length);
    let wordCategory = "none";
    for (let [category, index] of categoryIndexMap) {
        if (randint <= index){
            wordCategory = category;
            break;
        }
    }
    theWord.word = wordList[randint];
    theWord.categorytr = categories[wordCategory].tr_description;
    theWord.categoryeng = categories[wordCategory].en_description;
    
    document.getElementById(startButton.dataset.target).show();
}
 
function createPlayerNameInput(firstPlayerNumber, times=1) {
    const liarCounter = document.querySelector("#liar-counter");
    const isTurkish = siteSettings.language === "tr";

    for (let i = 0; i < times; i++){
        const playerNumber = firstPlayerNumber + i;

        const div = document.createElement("div");
        div.className = "player-name-container";

        const text = document.createElement(`label`);
        text.dataset.eng = `Player ${playerNumber}'s name : `;
        text.dataset.tr = `Oyuncu ${playerNumber} ismi : `;
        
        const input = document.createElement("input");        
        if (isTurkish){
            input.value = `Oyuncu ${playerNumber}`;
        } else {
            input.value = `Player ${playerNumber}`;
        }
        div.append(text, input);

        input.id = `player${playerNumber}-name-input`;
        text.htmlFor = input.id;

        updateLanguage(text);
        liarCounter.parentNode.insertBefore(div, liarCounter);
    }
}

function deletePlayerNameInput() {
    const liarCounter = document.querySelector("#liar-counter");
    liarCounter.previousElementSibling.remove();
}

function maskText(text) {
    let words = text.split(' ');
    let returnstring = "";
    words.forEach(word => {
        returnstring += `${'_ '.repeat(word.length)}(${word.length}) &nbsp;`;
    });
    return returnstring;
}

document.addEventListener('DOMContentLoaded', function() {
    //Load localstorage
    const savedGameSettings = localStorage.getItem('userGameSettings');
    if (savedGameSettings){
        gameSettings = JSON.parse(savedGameSettings);

        // Format: 'HTML_ID': 'SETTINGS_KEY'
        const settings = {
            'checkbox-rotate-player-order': { 
                jsName: 'rotatePlayerOrder', 
                defaultValue: true 
            },
            'checkbox-imposter-clue': { 
                jsName: 'impostorClue', 
                defaultValue: true 
            },
            'checkbox-imposter-show-word-length': { 
                jsName: 'impostorShowWordLength', 
                defaultValue: true 
            },
            'checkbox-imposters-see-other-imposters': { 
                jsName: 'impostersSeeOtherImposters', 
                defaultValue: false 
            }
        };

        const settingCheckboxes = document.querySelectorAll('.settings-checkbox');
        settingCheckboxes.forEach(function (currentElement){
            const setting = settings[currentElement.id]

            if (setting) { //SettingsMap'te tanımlıysa
                if (gameSettings.hasOwnProperty(setting.jsName)) { // gameSettings'te ayar varsa
                    currentElement.checked = gameSettings[setting.jsName];
                } else { // Ayar gameSettings'te yoksa eski save veya bozuk save demektir
                    currentElement.checked = setting.defaultValue; // varsayılan değeri ata
                    gameSettings[setting.jsName] = setting.defaultValue;
                    console.log(`Eski save veya eksik ayar tespit edildi. ${setting.jsName} varsayılan (${setting.defaultValue}) yapıldı.`);
                }
                
                currentElement.addEventListener('change', (event) => {
                    gameSettings[setting.jsName] = event.target.checked;
                });
            }

        });

        for (const key in gameSettings) {
            if (document.getElementById('category-' + key)) {
                const checkbox = document.getElementById('category-' + key);
                checkbox.checked = gameSettings[key];
            }
        }

        if (!gameSettings.version || gameSettings.version !== "v1.0.0-beta4"){
            console.log("Eski versiyon save tespit edildi. Ayarlar güncellendi.");
            gameSettings.version = "v1.0.0-beta4";
            localStorage.setItem('userGameSettings', JSON.stringify(gameSettings));
        }
    }
    //Load language 
    siteSettings.language = localStorage.getItem("lang") ? localStorage.getItem("lang") : "tr"
    const langSelect = document.querySelector("#language-select");
    langSelect.value = siteSettings.language;
    langSelect.addEventListener('change', (event) => {
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
    const specialText = document.getElementById("special-text")
    //const counterDisplay = document.querySelectorAll('.counter-value');

    btnDecrease.forEach(function (currentElement){
        currentElement.addEventListener('click', () => {
            let currentValue = parseInt(currentElement.nextElementSibling.textContent);
            if ((currentValue > 0 && currentElement.dataset.target === "imposters") || (currentValue > 3 && currentElement.dataset.target === "players")) {
                currentValue -= 1;
                jokeRound = 0;
                document.getElementById("special-text").hidden = true;
                currentElement.nextElementSibling.textContent = currentValue;
                if (currentElement.dataset.target === "players"){
                    deletePlayerNameInput();
                    if (currentValue < getCounterValue("counter-value-imposters")){
                        document.getElementById("counter-value-imposters").textContent = currentValue;
                        jokeRound = 1;
                        specialText.hidden = false;
                        specialText.dataset.tr = "Şaka turu aktif. Herkes sadece kendini yalancı olarak görecek.";
                        specialText.dataset.eng = "Joke round active. Everyone sees themselves as the only imposter.";
                        updateLanguage(specialText);
                    }
                } 
            }
            if(getCounterValue("counter-value-imposters") === 0){
                jokeRound = 2;
                specialText.hidden = false;
                specialText.dataset.tr = "Şaka turu aktif. Herkes kendini masum olarak görecek.";
                specialText.dataset.eng = "Joke round active. Everyone sees themselves as innocent.";
                updateLanguage(specialText);
            }
        });

    });
    btnIncrease.forEach(function (currentElement){
        currentElement.addEventListener('click', () => {
            let currentValue = parseInt(currentElement.previousElementSibling.textContent);
            if (currentValue < 10 && (currentElement.dataset.target === "players" || currentValue < getCounterValue("counter-value-players"))) {
                currentValue += 1;
                jokeRound = 0;
                specialText.hidden = true;
                currentElement.previousElementSibling.textContent = currentValue;
                if (currentElement.dataset.target === "players"){
                    createPlayerNameInput(currentValue);
                }            
            }
            if(getCounterValue("counter-value-imposters") === getCounterValue("counter-value-players")){
                jokeRound = 1;
                specialText.hidden = false;
                specialText.dataset.tr = "Şaka turu aktif. Herkes sadece kendini yalancı olarak görecek.";
                specialText.dataset.eng = "Joke round active. Everyone sees themselves as the only imposter.";
                updateLanguage(specialText);
            }
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
                startGame(currentElement);
                turnText.hidden = false;
                turnText.dataset.tr = `Sıradaki Oyuncu : ${players[0].name}`;
                turnText.dataset.eng = `${players[0].name}'s turn`;
                updateLanguage(turnText);
                return;
            }
            document.getElementById(currentElement.dataset.target).show();
            //showModal()
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
            }
            document.getElementById(currentElement.dataset.target).close();
        
        });
    });
    // Game
    const gameButton = document.querySelector("#game-btn"); //for game start button
    const wordInfo = document.querySelector("#word-info");
    const hint = document.querySelector("#hint-info");
    const lengthInfo = document.querySelector("#length-info");
    let gameButtonStateCount = 0;
    gameButton.addEventListener('click', ()=> {
        gameButtonStateCount++;
        const currentPlayer = Math.floor(gameButtonStateCount / 2);
        //console.log("gameButtonStateCount : "+ gameButtonStateCount);
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
                wordInfo.dataset.tr = `Sen bir yalancısın! Gizli kalmaya çalış.<br>`;
                wordInfo.dataset.eng = `You are a liar! Try to stay hidden.<br>`;
                if (gameSettings.impostorClue === true){
                    hint.dataset.tr = `Kategori İpucusu: ${theWord.categorytr}.`;
                    hint.dataset.eng = `Category Hint : ${theWord.categoryeng}`;
                    hint.hidden = false;
                }
                if (gameSettings.impostorShowWordLength === true){
                    lengthInfo.dataset.tr = `${maskText(theWord.word)}`;
                    lengthInfo.dataset.eng = `${maskText(theWord.word)}`;
                    lengthInfo.hidden = false;
                }
                if (gameSettings.impostersSeeOtherImposters && jokeRound === 0){
                    const otherLiars = getImposters().filter(p => (p.name !== players[currentPlayer].name)).map(p => p.name).join(", ");
                    if (otherLiars !== ""){
                        wordInfo.dataset.tr += `Diğer yalancılar : ${otherLiars}`;
                        wordInfo.dataset.eng += `Other liars : ${otherLiars}`;
                    }
                }
            }
            wordInfo.hidden = false;
            updateLanguage(turnText, gameButton, wordInfo, hint, lengthInfo);
        } else if (gameButtonStateCount % 2 === 0 && gameButtonStateCount < (getCounterValue("counter-value-players") * 2)) {
            turnText.dataset.tr = `Sıradaki Oyuncu : ${players[currentPlayer].name}`;
            turnText.dataset.eng = `${players[currentPlayer].name}'s turn`;
            gameButton.dataset.tr = "Kelimeni göster";
            gameButton.dataset.eng = "Show your word";
            wordInfo.hidden = true;
            hint.hidden = true;
            lengthInfo.hidden = true;
            updateLanguage(turnText, gameButton);
        }
        else if (gameButtonStateCount === (getCounterValue("counter-value-players") * 2)){
            gameButton.dataset.tr = "Yalancıyı Göster";
            gameButton.dataset.eng = "Reveal the Liar";
            turnText.dataset.tr = "Tüm masumlar kelimelerini gördü.<br> Oyun başladı.";
            turnText.dataset.eng = "All players have seen their words. The game has started.";
            turnText.hidden = false;
            wordInfo.hidden = true;
            lengthInfo.hidden = true;
            hint.hidden = true;
            updateLanguage(turnText, gameButton);
        }
        else if (gameButtonStateCount === (getCounterValue("counter-value-players") * 2) + 1){
            gameButton.dataset.tr = "Oyunu Bitir";
            gameButton.dataset.eng = "Close the Game";
            const imposters = getImposters();
            if (imposters.length === 1){
                turnText.dataset.tr = `Yalancı : ${imposters.map(imp => imp.name).join(", ")}`;
                turnText.dataset.eng = `Liar : ${imposters.map(imp => imp.name).join(", ")}`;
            } else if (jokeRound === 1){
                turnText.dataset.tr = `Herkes yalancı! Hiç masum yoktu.<br> Bu bir şaka turuydu.`;
                turnText.dataset.eng = `Everyone is a liar! There were no innocents. This was a joke round.`;
            } else if (jokeRound === 2){
                turnText.dataset.tr = `Herkes masum! Hiç yalancı yoktu.<br> Bu bir şaka turuydu.`;
                turnText.dataset.eng = `Everyone is innocent! There were no liars. This was a joke round.`;
            } else{
                turnText.dataset.tr = `Yalancılar : ${imposters.map(imp => imp.name).join(", ")}`;
                turnText.dataset.eng = `Liars : ${imposters.map(imp => imp.name).join(", ")}`;
            }
            wordInfo.hidden = false;
            lengthInfo.hidden = true;
            wordInfo.dataset.tr = `Turun Kelimesi : ${theWord.word}`;
            wordInfo.dataset.eng = `Round's Word : ${theWord.word}`;
            turnText.hidden = false;
            updateLanguage(gameButton, wordInfo, turnText);
        }
        else {
            gameButtonStateCount = 0;
            gameButton.dataset.tr = "Kelimeni göster";
            gameButton.dataset.eng = "Show your word";
            wordInfo.hidden = true;
            hint.hidden = true;
            lengthInfo.hidden = true;
            updateLanguage(turnText, gameButton, wordInfo, hint);
            if (gameSettings.rotatePlayerOrder) {
                players.unshift(players.pop()); // rotate the players array
            }
            assignImposters();
            document.querySelector("#modal-game").close();
        }
    });
});
document.addEventListener('click', function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
    if (modal.open && modal.id !== "modal-game") { // oyun modalında dışına tıklama kapalı
        if (!event.composedPath().includes(modal) && !event.target.closest('.trigger-modal')) {
            modal.close();
        }
    }});
});