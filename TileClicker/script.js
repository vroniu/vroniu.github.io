var tiles = document.getElementsByClassName("tile");
var blackTiles = 0;
var score = 0;
var clock = 10.0;
var gameRunning = false;
var userClicked = false;
var ignoreInputs = false;
var gameTimer = setInterval(updateClock, 100);
var difficulty = 2;
var highScore = null;
var currentTheme;
var gameOverPopup = document.getElementById('gameover');
var infoPopup = document.getElementById('info');
var bonusRound = false;
var bonusRoundTimeout = null;

var colorThemes = [
    {
        "name": "default",
        "b-bg": '#000051',
        "m-bg": "#0095a8",
        "p-bg": "#ee82ee",
        "btn": "#ff8c00",
        "brd": "#4a0072",
        "p-brd": "#808080",
    }, 
    {
        "name": "monochrome",
        "b-bg": '#000000',
        "m-bg": "#262626",
        "p-bg": "#000000",
        "btn": "#404040",
        "brd": "#ffffff",
        "p-brd": "#808080",
    }
]

initGame();

function initGame(){
    // Init variables
    blackTiles = 0;
    score = 0;
    clock = 10.0;
    gameRunning = false;
    userClicked = false;
    highScore = readCookie('highScore'+difficulty);
    currentTheme = readCookie('theme');
    if(!currentTheme)currentTheme = 0;
    applyTheme();

    // Init canvas
    for(i = 0; i < tiles.length; i++){
        console.log(document.getElementById(i));
        document.getElementById(i).style.backgroundColor = 'white';
    }
    updateCanvas(-1, 3);
    updateScore();
    updateDifficulty();
    updateHighScore();
}

function updateCanvas(exclude, tilesToFill){
    while(blackTiles != tilesToFill){
        let random = Math.floor(Math.random() * 9);
        if(random == exclude)continue;
        if(document.getElementById(random).style.backgroundColor == 'white'){
            document.getElementById(random).style.backgroundColor = 'black';
            blackTiles++;
        }
    }
}

function clearCanvas(){
    for(let i = 0; i < 9; i++){
        document.getElementById(i).style.backgroundColor = 'white'
    }
    blackTiles = 0;
}


function changeColor(id) {
    if (!ignoreInputs) {
        if (!userClicked) {
            userClicked = true;
            gameRunning = true;
        }
        if (gameRunning) {
            let curCol = document.getElementById(id).style.backgroundColor;
            if (curCol == 'black') {
                document.getElementById(id).style.backgroundColor = 'white';
                blackTiles--;
                score++;
                if (score % (difficulty * 10) == 0) {
                    clock += 5;
                }
                updateScore();
                if(!bonusRound){
                    updateCanvas(id, 3);
                    if(score % ((difficulty*10)+30) == 0) { 
                        enableBonusRound()
                    }
                }
                if(bonusRound && blackTiles == 0)disableBounsRound();
            } else {
                gameOver();
            }
        }
    }
}

function enableBonusRound(){
    bonusRound = true;
    updateCanvas(-1, 9);
    bonusRoundTimeout = setTimeout(disableBounsRound, 4000);
}

function disableBounsRound(){
    bonusRound = false;
    clearTimeout(bonusRoundTimeout);
    clearCanvas();
    updateCanvas(-1, 3);
}

function updateScore(){
    document.getElementById("score").innerHTML = score;
    if(score > highScore){
        highScore = score;
        updateHighScore();
    }
}

function updateHighScore(){
    if(highScore == null || highScore == 'null'){
        document.getElementById("top").innerHTML = '0';
    } else {
        document.getElementById("top").innerHTML = highScore;
    }
}

function updateClock(){
    if(gameRunning){
        clock -= 0.1;
    }
    document.getElementById('time').innerHTML = (Math.round(clock*100)/100).toFixed(1);
    if(clock < 3){
        document.getElementById('time').style.color = 'red';
    } else if(clock < 6){
        document.getElementById('time').style.color = 'yellow';
    } else {
        document.getElementById('time').style.color = 'white';
    }
    if(clock <= 0){
        clock = 0;
        gameOver();
    }
}

function gameOver(){
    if(!readCookie('highScore'+difficulty) || readCookie('highScore'+difficulty) < highScore){
        writeCookie('highScore'+difficulty, highScore, 60);
    }
    gameRunning = false;
    if(bonusRound){
        bonusRound = false;
        clearTimeout(bonusRoundTimeout);
    }
    gameOverPopup.style.opacity = 1;
    gameOverPopup.style.visibility = 'visible';
    ignoreInputs = true;
    setTimeout(noGameOver, 2000);
}

function noGameOver(){
    gameOverPopup.style.opacity = 0;
    gameOverPopup.style.visibility = 'hidden';
    ignoreInputs = false;
}

function showInfo(){
    infoPopup.style.opacity = 1;
    infoPopup.style.visibility = 'visible';
}

function hideInfo(){
    infoPopup.style.opacity = 0;
    infoPopup.style.visibility = 'hidden';
}

function updateDifficulty(){
    let diffText = document.getElementById("diff");
    switch(difficulty){
        case 2:
            diffText.innerHTML = "easy";
            break;
        case 3:
            diffText.innerHTML = "medium";
            break;
        case 4:
            diffText.innerHTML = "hard";
            break;
    }

}

function changeDifficulty() {
    if (!gameRunning) {
        if (++difficulty == 5) {
            difficulty = 2;
        }
        highScore = readCookie('highScore' + difficulty);
        updateDifficulty();
        updateHighScore();
    }
}

function writeCookie (key, value, days) {
    var date = new Date();

    // Default at 365 days.
    days = days || 365;

    // Get unix milliseconds at current time plus number of days
    date.setTime(+ date + (days * 86400000)); //24 * 60 * 60 * 1000

    window.document.cookie = key + "=" + value + "; expires=" + date.toGMTString() + "; path=/";

    return value;
};

function readCookie(key) {
    var keyEQ = key + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(keyEQ) == 0) return c.substring(keyEQ.length,c.length);
    }
    return null;
}

function changeTheme(){
    if(++currentTheme >= colorThemes.length){
        currentTheme = 0;
    }
    applyTheme();
}

function applyTheme(){
    let r = document.querySelector(':root');
    for(const [key, val] of Object.entries(colorThemes[currentTheme])){
        if(key != "name"){
            r.style.setProperty("--"+key, val);
        }
    }
    writeCookie("theme", currentTheme, 60);
}

function goToLink(link){
    window.open(link, target="_blank")
}