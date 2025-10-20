// script.js

let boxes = document.querySelectorAll(".boxes");
let turn1 = document.querySelector(".turn1");
let turn2 = document.querySelector(".turn2");
let msg = document.querySelector(".msg");
let span = document.querySelector("#result");
let reset = document.getElementById("reset");
let ng = document.getElementById("ng");

// DOM Elements for Mode Selection, Symbol Selection, and Score
let twoPlayerBtn = document.getElementById("twoPlayerBtn");
let vsComputerBtn = document.getElementById("vsComputerBtn");
let chooseXBtn = document.getElementById("chooseXBtn");
let chooseOBtn = document.getElementById("chooseOBtn");
let modeSelection = document.querySelector(".mode-selection");
let symbolSelection = document.querySelector(".symbol-selection"); // NEW
let gameElements = document.querySelector(".game-elements");
let scoreXDisplay = document.getElementById("scoreX");
let scoreODisplay = document.getElementById("scoreO");


let turnX = true; // X always starts the game turn
let isGameActive = true;
let isVsComputer = false;
let playerScoreSymbol = "X"; // Tracks the player's chosen symbol (default X)
let scoreX = 0;
let scoreO = 0;

let clickSound = new Audio("click.mp3");
let winnerSound = new Audio("winner.mp3");
let loseSound = new Audio("lose.mp3"); // NEW: Assuming you have a lose.mp3

let WinnerCondition = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
];

// --- Mode Selection Handlers ---
twoPlayerBtn.addEventListener('click', () => {
    isVsComputer = false;
    startGame("X"); // Start directly with X for 2-Player mode
});

vsComputerBtn.addEventListener('click', () => {
    isVsComputer = true;
    modeSelection.classList.add("hide-initially");
    symbolSelection.classList.remove("hide-initially"); // Show symbol selection
});

// --- Symbol Selection Handlers (NEW) ---
chooseXBtn.addEventListener('click', () => {
    startGame("X");
});
chooseOBtn.addEventListener('click', () => {
    startGame("O");
});

function startGame(playerSymbol) {
    playerScoreSymbol = playerSymbol;
    modeSelection.classList.add("hide-initially");
    symbolSelection.classList.add("hide-initially");
    gameElements.classList.remove("hide-initially");
    resetGame(true); // Reset scores when starting a new session/mode
    
    // If player chooses 'O' in Vs. Computer mode, computer (X) moves first
    if (isVsComputer && playerScoreSymbol === "O") {
        setTimeout(computerMove, 500); 
    }
}

// --- Combined Reset/New Game Logic ---
reset.addEventListener('click', () => resetGame(false)); 
ng.addEventListener('click', () => resetGame(false)); 

function resetGame(shouldResetScores = false) {
    turnX = true; // X always starts the board turn
    isGameActive = true;
    boxes.forEach(box => {
       box.innerText = "";
       box.disabled = false;
       box.classList.add("hover");
       msg.classList.add("hide");
       box.classList.remove("b-s");
    });
    // Set turn indicator to X
    turn1.classList.add("b-s");
    turn2.classList.remove("b-s");
     
    if (shouldResetScores) {
        scoreX = 0;
        scoreO = 0;
        scoreXDisplay.innerText = scoreX;
        scoreODisplay.innerText = scoreO;
    }
}

// --- Main Box Click Handler ---
boxes.forEach(box => {
    box.addEventListener('click', () => {
        // If Vs Computer mode is active, prevent player from moving if it's not their turn
        if (isVsComputer) {
            const playerTurn = (playerScoreSymbol === "X" && turnX) || (playerScoreSymbol === "O" && !turnX);
            if (!playerTurn) return;
        }

        if (box.innerText !== "" || !isGameActive) return; 
        
        makeMove(box);
        
        // If Vs Computer mode is active, and it's Computer's turn, trigger computer move
        const computerTurn = (playerScoreSymbol === "O" && turnX) || (playerScoreSymbol === "X" && !turnX);
        
        if (isGameActive && isVsComputer && computerTurn) {
            setTimeout(computerMove, 500); 
        }
    });
});

function makeMove(box) {
    clickSound.play();
    const currentSymbol = turnX ? "X" : "O";

    if (currentSymbol === "X") {
        box.innerText = "X";
        box.style.color = "rgb(174, 51, 96)";
        turn2.classList.add("b-s");
        turn1.classList.remove("b-s");
        turnX = false;
    } else { // O's move
        box.innerText = "O";
        box.style.color = "rgb(17, 52, 182)";
        turn1.classList.add("b-s");
        turn2.classList.remove("b-s");
        turnX = true;
    }
    box.disabled = true; 
    box.classList.remove("hover"); 
    checkWinner();
}


// --- COMPUTER MOVE LOGIC ---
function computerMove() {
    // Check if game is still active before finding a move
    if (!isGameActive) return;

    const availableBoxes = [];
    boxes.forEach((box, index) => {
        if (box.innerText === "") {
            availableBoxes.push(index);
        }
    });

    if (availableBoxes.length === 0) return; 

    // Simple AI: Choose a random available box
    const randomIndex = Math.floor(Math.random() * availableBoxes.length);
    const boxIndexToPlay = availableBoxes[randomIndex];
    const computerBox = boxes[boxIndexToPlay];
    
    // Ensure it's still the computer's turn before making the move
    const computerTurn = (playerScoreSymbol === "O" && turnX) || (playerScoreSymbol === "X" && !turnX);
    if(isGameActive && computerTurn) {
        makeMove(computerBox);
    }
}


function checkWinner() {
    for (let condition of WinnerCondition) {
        let box1 = boxes[condition[0]].innerText;
        let box2 = boxes[condition[1]].innerText;
        let box3 = boxes[condition[2]].innerText;

        if (box1 !== "" && box2 !== "" && box3 !== "") {
            if (box1 === box2 && box2 === box3) {
                showResult(box1, condition); 
                return;
            }
        }
    }
    
    // Check for a Draw only if all boxes are filled
    if (Array.from(boxes).every(box => box.innerText !== "")) {
        showDraw();
    }
}

function showResult(result, condition) {
    isGameActive = false;
    
    // NEW: Play sound based on mode and winner
    if (isVsComputer && result !== playerScoreSymbol) {
        // Player lost against computer (Computer is the winner)
        loseSound.play();
    } else {
        // Player won, or it's 2-Player mode
        winnerSound.play();
    }

    // Update Score
    if (result === "X") {
        scoreX++;
        scoreXDisplay.innerText = scoreX;
    } else {
        scoreO++;
        scoreODisplay.innerText = scoreO;
    }

    boxes.forEach(box => {
        box.disabled = true;
        box.classList.remove("hover");
        box.classList.add("b-s");
    });

    // Highlight the winning line
    boxes[condition[0]].classList.remove("b-s");
    boxes[condition[1]].classList.remove("b-s");
    boxes[condition[2]].classList.remove("b-s");


    msg.classList.remove("hide");
    span.innerText = result;
    if (result === "X") {
        span.style.color = "rgb(174, 51, 96)";
    } else {
        span.style.color = "rgb(17, 52, 182)";
    }
}

function showDraw() {
    isGameActive = false;
    msg.classList.remove("hide");
    span.innerText = "DRAW";
    span.style.color = "aliceblue"; 
    boxes.forEach(box => {
        box.disabled = true;
        box.classList.remove("hover");
        box.classList.add("b-s");
    });
}
