'use strict'

const MINE = '💣';
var BOARDSIZE = 4;
var gCounter = 1;
var gBoard = [];
var gFirstClick = false;
var gTimerInterval;
var glifeCount;
var gStartTime;
var gMenuallyCreateMines;
var gMinesCreates;
var gButtonCreateMineWasClicked;
var gClickedCells = [];
var gUndo;
var gLevel = {
    size: BOARDSIZE * BOARDSIZE,
    MINES: 2
}
var gSafeClickcount;
var gTotalSeconds = 0;
var gGame = {
    score: 0,
    isOn: false,
    showCount: 0,
    markedCount: 0,
    secsPassed: 0
}
var gBestScore;
document.querySelector('h3 span').innerHTML = localStorage.getItem('bestScoreLevel1');


function init() {
    gBoard = buildBoard();
    renderBoard(gBoard, '.board');
    gGame.isOn = true;
    console.log(buildBoard());
    gFirstClick = false;
    glifeCount = 0;
    gTotalSeconds = 0;
    gSafeClickcount = 3;
    gMenuallyCreateMines = false;
    gButtonCreateMineWasClicked = false;
    gUndo = false;
    gClickedCells = [];
    gMinesCreates = gLevel.MINES;
    var elBtnCreateMine = document.querySelector('.createMines');
    elBtnCreateMine.innerHTML = `Manully positiond ${gLevel.MINES} mines`;
    document.querySelector('.safeClicks').innerHTML = `${gSafeClickcount} Safe clicks available`;
    var elButtonHint = document.querySelectorAll('.hint');
    for (var i = 0; i < elButtonHint.length; i++) {
        elButtonHint[i].style.display = 'inline';
    }
    var elButtonLife = document.querySelectorAll('.life');
    for (var i = 0; i < elButtonLife.length; i++) {
        elButtonLife[i].style.display = 'inline';
    }
    gGame = {
        score: 0,
        isOn: true,
        showCount: 0,
        markedCount: 0,
        secsPassed: 0
    }
}

function hintButton(elHint) {
    if (!gFirstClick) {
        return;
    }
    elHint.style.display = 'none';
    var indxCell = getRendomCell();
    neighborsHintShow(indxCell.i, indxCell.j, gBoard);
    setTimeout(function () {
        neighborsHintHide(indxCell.i, indxCell.j, gBoard);
    }, 1000);
}


function neighborsHintShow(cellI, cellJ, mat) {
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= mat.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= mat[i].length) continue;
            if (!mat[i][j].isShown) {
                mat[i][j].isShown = true;
                mat[i][j].isHint = true;
                console.log(mat);
            }
            var elCell = document.querySelector(`.cell${i}-${j}`);
            if (i === cellI && j === cellJ) {
                elCell.style.backgroundColor = 'rgb(107, 97, 8)';
            }
            else if (mat[i][j].isHint) {
                elCell.style.backgroundColor = '#3e76a3';
            }
            if (mat[i][j].isMine) {
                elCell.innerHTML = MINE;
            } else {
                var count = mat[i][j].minesAroundCount;
                if (count === 0) {
                    elCell.innerHTML = '';
                } else {
                    elCell.innerHTML = count.toString();
                }
            }
        }
    }
}

function neighborsHintHide(cellI, cellJ, mat) {
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= mat.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= mat[i].length) continue;
            var elCell = document.querySelector(`.cell${i}-${j}`);
            if (mat[i][j].isHint) {
                mat[i][j].isShown = false;
                mat[i][j].isHint = false;
                elCell.innerHTML = '';
                elCell.style.backgroundColor = 'rgb(46, 59, 73)';
            }
        }
    }
}

function buildBoard() {
    var board = [];
    for (var i = 0; i < BOARDSIZE; i++) {
        board.push([]);
        for (var j = 0; j < BOARDSIZE; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false,
                isHint: false
            }
        }
    }
    return board;
}

function renderBoard(mat, selector) {
    var strHTML = '';
    for (var i = 0; i < mat.length; i++) {
        strHTML += '<tr>';
        for (var j = 0; j < mat[0].length; j++) {
            var cell = '';
            var className = 'cell cell' + i + '-' + j;
            strHTML += `<td class="${className}" onclick="cellClicked(${i},${j})" onmousedown="mouseRightClick(event,${i},${j})">${cell}</td>`;
        }
        strHTML += '</tr>'
    }
    var elContainer = document.querySelector(selector);
    elContainer.innerHTML = strHTML;
}

function mouseRightClick(ev, indxI, indxJ) {
    var elCell = document.querySelector(`.cell${indxI}-${indxJ}`);
    if (ev.button === 2) {
        if (gBoard[indxI][indxJ].isShown) {
            return;
        }
        else if (!gBoard[indxI][indxJ].isMarked) {
            gBoard[indxI][indxJ].isMarked = true;
            elCell.innerHTML = '🏳️‍🌈';
            gGame.markedCount++;
        } else {
            gBoard[indxI][indxJ].isMarked = false;
            elCell.innerHTML = '';
            gGame.markedCount--;
        }
    }
    checkIfWin();
}

function rndCellForMine() {
    for (var i = 0; i < gLevel.MINES; i++) {
        var indxCell = getRendomCell();
        gBoard[indxCell.i][indxCell.j].isMine = true;
    }
}


function cellClicked(i, j) {
    if (!gGame.isOn) {
        return;
    }
    if (gMenuallyCreateMines) {
        menuallyCreateMinesCell(i, j);
        return;
    }
    gClickedCells.push({ i, j });
    console.log(gClickedCells);
    gBoard[i][j].isShown = true;
    gGame.showCount++;
    if (gFirstClick === false) {
        var date = new Date();
        gStartTime = date.getTime();
        gTimerInterval = setInterval(countTimer, 1);
        gFirstClick = true;
        if (!gButtonCreateMineWasClicked) {
            rndCellForMine();
        }
        updateCountMine(gBoard);
        fullExpend(i, j, gBoard);
    }
    checkIfWin();
    fullExpend(i, j, gBoard);
    if (gBoard[i][j].isMine) {
        var element = document.querySelector(`.cell${i}-${j}`);
        element.innerHTML = MINE;
        checkIfGameOver();
    } else {
        renderCell(i, j);
    }
}

function undoButton() {
    if (!gFirstClick) return;
    var indxCell = gClickedCells.pop();
    undo(indxCell.i, indxCell.j);
}

function undo(i, j) {
    gBoard[i][j].isShown = false;
    gGame.showCount--;
    if (gBoard[i][j].isMine) {
        gLevel.MINES++;
    }
    var elCell = document.querySelector(`.cell${i}-${j}`);
    elCell.style.backgroundColor = 'rgb(46, 59, 73)';
    elCell.innerHTML = '';
    if (gBoard[i][j].minesAroundCount === 0 && !gBoard[i][j].isMine) {
        undofullExpend(i, j, gBoard);
    }
}

function fullExpend(cellI, cellJ, mat) {
    if (mat[cellI][cellJ].minesAroundCount !== 0 || mat[cellI][cellJ].isMine) return;
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= mat.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            console.log(i, j);
            if (j < 0 || j >= mat[i].length) continue;
            if (i === cellI && j === cellJ) continue;
            if (mat[i][j].isShown) continue;
            mat[i][j].isShown = true;
            gGame.showCount++;
            renderCell(i, j);
            if (mat[i][j].minesAroundCount === 0) {
                fullExpend(i, j, mat);
            }
        }

    }
}

function undofullExpend(cellI, cellJ, mat) {
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= mat.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= mat[i].length) continue;
            if (i === cellI && j === cellJ) continue;
            if (!mat[i][j].isShown) continue;
            mat[i][j].isShown = false;
            gGame.showCount--;
            var elCell = document.querySelector(`.cell${i}-${j}`);
            elCell.style.backgroundColor = 'rgb(46, 59, 73)';
            elCell.innerHTML = '';
            if (mat[i][j].minesAroundCount === 0) {
                undofullExpend(i, j, mat);
            }
        }

    }
}

function renderCell(i, j) {
    var elCell = document.querySelector(`.cell${i}-${j}`);
    elCell.style.backgroundColor = '#4779aa';
    var count = gBoard[i][j].minesAroundCount;
    if (count === 0) {
        elCell.innerHTML = '';
    } else {
        elCell.innerHTML = count.toString();
    }
}


function checkIfGameOver() {
    var elSmiley = document.querySelector('.gameMood');
    elSmiley.innerHTML = '😕';

    var elLife = document.querySelectorAll('.life');
    if (glifeCount < elLife.length) {
        elLife[glifeCount].style.display = 'none';
    }
    if (glifeCount === elLife.length) {
        for (var indxI = 0; indxI < gBoard.length; indxI++) {
            for (var indxJ = 0; indxJ < gBoard[0].length; indxJ++) {
                if (gBoard[indxI][indxJ].isMine && !gBoard[indxI][indxJ].isHint) {
                    var elCellMine = document.querySelector(`.cell${indxI}-${indxJ}`);
                    elCellMine.innerHTML = MINE;
                    gBoard[indxI][indxJ].isShown = true;
                }
                gTotalSeconds = 0;
                gCounter = 1;
                clearInterval(gTimerInterval);
                gGame.isOn = false;
            }
        }
    }
    glifeCount++;
    gLevel.MINES--;
}

function countTimer() {
    var date = new Date();
    var newDate = (date.getTime()) - gStartTime;
    var seconds = newDate / 1000;
    var milliseconds = seconds - Math.floor(seconds);
    milliseconds = Math.floor(milliseconds * 1000);
    if (milliseconds < 10) {
        milliseconds = "00" + milliseconds;
    } else if (milliseconds < 100) {
        milliseconds = "0" + milliseconds
    }
    document.querySelector('.timer').innerHTML = Math.floor(seconds) + "." + milliseconds;
    gGame.secsPassed = Math.floor(seconds) + "." + milliseconds;
}

function levels(elButton) {
    switch (elButton.innerHTML) {
        case 'Easy':
            BOARDSIZE = 4;
            gLevel.MINES = 2;
            document.querySelector('h3 span').innerHTML = localStorage.getItem('bestScoreLevel1');
            playAgain();
            break;
        case 'Medium':
            BOARDSIZE = 8;
            gLevel.MINES = 12;
            gBestScore = document.querySelector('h3 span').innerHTML = localStorage.getItem('bestScoreLevel2');
            playAgain();
            break;
        case 'Hard':
            BOARDSIZE = 12;
            gLevel.MINES = 30;
            gBestScore = document.querySelector('h3 span').innerHTML = localStorage.getItem('bestScoreLevel3');
            playAgain();
            break;
    }
}

function playAgain() {
    gTotalSeconds = 0;
    gCounter = 1;
    clearInterval(gTimerInterval);
    init();
}

function countNeighbors(cellI, cellJ, mat) {
    if (mat[cellI][cellJ].isMine) return;
    var count = 0;
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= mat.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            // same cell
            if (i === cellI && j === cellJ) continue;
            if (j < 0 || j >= mat[i].length) continue;
            if (mat[i][j].isMine) {
                count++;
            }
        }
    }
    return count;
}

function updateCountMine(board) {
    var count;
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            count = countNeighbors(i, j, board);
            if (board[i][j].isMine) continue;
            var elcell = document.querySelector(`.cell${i}-${j}`);
            board[i][j].minesAroundCount = count;
            if (board[i][j].isShown) {
                if (count === 0) {
                    elcell.innerHTML = '';
                } else {
                    elcell.innerHTML = count.toString();
                }
            }
        }
    }
}



function updateScore(score) {
    gGame.score += score;
    document.querySelector('h3 span').innerText = gGame.score;
}

function getRendomCell() {
    var indxI = getRandomIntInclusive(0, BOARDSIZE - 1);
    var indxJ = getRandomIntInclusive(0, BOARDSIZE - 1);
    while (gBoard[indxI][indxJ].isShown || gBoard[indxI][indxJ].isMine) {
        indxI = getRandomIntInclusive(0, BOARDSIZE - 1);
        indxJ = getRandomIntInclusive(0, BOARDSIZE - 1);
    }
    var indxCell = {
        i: indxI,
        j: indxJ
    }
    return indxCell;
}

function menuallyCreateMinesButton() {
    if (gFirstClick) return;
    gMenuallyCreateMines = true;
    gButtonCreateMineWasClicked = true;
}

function menuallyCreateMinesCell(i, j) {
    if (!gMenuallyCreateMines) return;
    if (gMinesCreates === 1) {
        gMenuallyCreateMines = false;
    }
    gBoard[i][j].isMine = true;
    gMinesCreates--;
}


function safeClickButton() {
    if (gSafeClickcount === 0 || !gFirstClick) return;
    if (gGame.showCount === (gLevel.size - gLevel.MINES)) return;
    gSafeClickcount--;
    var indx = getRendomCell();
    var i = indx.i;
    var j = indx.j;
    gBoard[i][j].isShown = true;
    gBoard[i][j].isHint = true;
    renderCell(i, j);
    setTimeout(function () {
        var elCell = document.querySelector(`.cell${i}-${j}`);
        gBoard[i][j].isShown = false;
        gBoard[i][j].isHint = false;
        elCell.innerHTML = '';
        elCell.style.backgroundColor = 'rgb(46, 59, 73)';
    }, 1000);

    document.querySelector('.safeClicks').innerText = `${gSafeClickcount} Safe clicks available`;
}


function checkIfWin() {
    if (gGame.showCount === (gLevel.size - gLevel.MINES) && gGame.markedCount === gLevel.MINES) {
        var elSmiley = document.querySelector('.gameMood');
        elSmiley.innerHTML = '😎';
        clearInterval(gTimerInterval);
        gGame.score = gGame.secsPassed;
        renderBestScore();
        gGame.isOn = false;
        gTotalSeconds = 0;
        gCounter = 1;
    }
}

function renderBestScore() {
    switch (BOARDSIZE) {
        case 4:
            setBestScoreToLocalStorage(1);
            break;
        case 8:
            setBestScoreToLocalStorage(2)
            break;
        case 12:
            setBestScoreToLocalStorage(3)
            break;
    }
}


function setBestScoreToLocalStorage(levelCount) {
    if (localStorage.getItem(`bestScoreLevel${levelCount}`) === null) {
        localStorage.setItem(`bestScoreLevel${levelCount}`, gGame.score);
        gBestScore = gGame.score;
        document.querySelector('h3 span').innerHTML = gGame.score;
    } else if (gGame.score < localStorage.getItem(`bestScoreLevel${levelCount}`)) {
        gBestScore = document.querySelector('h3 span').innerHTML = gGame.score;
        localStorage.setItem(`bestScoreLevel${levelCount}`, gGame.score);
    }
}