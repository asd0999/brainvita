// citation1: https://stackoverflow.com/questions/9770935/making-a-chess-game-with-jquery-ui-i-have-used-draggable-but-i-need-to-make-th

let win = false;
let count = 0;
let rules = "Welcome to Brainvita!<p>This one-person game is set up by placing thirty-two marbles on the board, leaving the centre dent empty.<p>The aim of the game is to remove every marble except one, and the last marble must end up in the centre dent.<p>To remove a marble, you must move another marble over it and into an empty dent. The marbles can move up, down, left or right, but not diagonally.";
// let marbleDrop = new Audio('assets/marble1.mp3');
let marbleDrop = new Audio('assets/marble2.wav');
let success = new Audio('assets/win.wav');
let gameOver = new Audio('assets/lose.mp3');
let setupSound = new Audio('assets/setup.wav');
let setup = true; //to play sound upon first interaction 

let emptyGrid = [];

const $about = $('.about-game');
$about.on('click', createModal.bind(event, rules));
const $reset = $('.play-again');
$reset.on('click', () => {
    console.log("grid re-created");
    win = false;
    count = 0;
    setupSound.play();
    createGrid();
});

function createGrid() {
    $('.brainvita').empty();
    for (let i = 0; i < 7; i++) {
        const $row = $('<div>').addClass('row').appendTo('.brainvita');
        for (let j = 0; j < 7; j++) {
            if ( // empty part of the grid
                (i <= 1 && j <= 1) ||
                (i >= 5 && j >= 5) ||
                (i <= 1 && j >= 5) ||
                (i >= 5 && j <= 1)
            ) {
                emptyGrid.push(`${i}${j}`);
                continue;
            }
            //create the grid of square divs
            const $square = $('<div>').addClass('square').attr('id', `${i}${j}`).appendTo($row);
            // roundBorder($square, i, j); //extra border-radius for corner divs if using borders on .square
            //add the marbles
            if (!(i == 3 && j == 3)) {
                const $marble = $('<img>').attr('src', 'assets/marble.png').addClass('marble').attr('id', `${i}${j}`).appendTo($square);
            }
        }
    }
    console.log(emptyGrid);
    createDragDrop();
}

function roundBorder($square, i, j) {
    if ((i == 0 && j == 2) || (i == 2 && j == 0)) {
        $square.css('border-top-left-radius', '20px');
    }
    if ((i == 4 && j == 0) || (i == 6 && j == 2)) {
        $square.css('border-bottom-left-radius', '20px');
    }
    if ((i == 0 && j == 4) || (i == 2 && j == 6)) {
        $square.css('border-top-right-radius', '20px');
    }
    if ((i == 4 && j == 6) || (i == 6 && j == 4)) {
        $square.css('border-bottom-right-radius', '20px');
    }
}

function createModal(t) {
    $('.modal-parent').empty();
    console.log("emptied modal class");
    const $modal = $('<div>').addClass('modal').appendTo('.modal-parent');
    const $modalText = $('<div>').html(t).addClass('modal-text').appendTo($modal);
    const $close = $('<button>').text('Close').addClass('close').appendTo($modalText).on('click', () => {
        if (setup) {
            setupSound.play();
        }
        $modal.css('display', 'none');
        setup = false;
    });
}

function showModal(t) {
    const $modal = $('body').children().eq(2);
    const $modalText = $modal.children().eq(0);
    $modalText.html(t)
    $modal.css('display', 'inline');
    const $close = $('<button>').text('Close').addClass('close').appendTo($modalText).on('click', () => {
        $modal.css('display', 'none');
    });
}

function createDragDrop() {
    $('.marble').draggable({
        containment: "table",
        revert: 'invalid',
        stack: '.marble',
    });

    $('.square').droppable({
        drop: function(ev, ui) {
            let marble = ui.draggable; //rename dropped to pawn
            let square = $(this); //rename droppedOn to square
            square.droppable("disable");
            marble.parent().droppable("enable");
            marble.detach().css({ top: 0, left: 0 }).appendTo(square);
            let midi = parseInt(marble.attr('id').split('')[0]);
            let midj = parseInt(marble.attr('id').split('')[1]);
            let sidi = parseInt($(this).attr('id').split('')[0]);
            let sidj = parseInt($(this).attr('id').split('')[1]);
            let newi = (midi + sidi) / 2;
            let newj = (midj + sidj) / 2;
            const $deleteMarble = $(`#${newi}${newj}.marble`);
            $deleteMarble.parent().droppable("enable");
            // $deleteMarble.remove();
            $deleteMarble.fadeOut();
            marbleDrop.play(); //play audio
            setTimeout(() => {
                $deleteMarble.remove()
                marble.attr('id', `${square.attr('id')}`);
                count++;
                checkWin();
            }, 300);
        },
        accept: function(marble) {
            let midi = parseInt(marble.attr('id').split('')[0]);
            let midj = parseInt(marble.attr('id').split('')[1]);
            let sidi = parseInt($(this).attr('id').split('')[0]);
            let sidj = parseInt($(this).attr('id').split('')[1]);
            if ((Math.abs(midi - sidi) == 2 && Math.abs(midj - sidj) == 0) ||
                (Math.abs(midi - sidi) == 0 && Math.abs(midj - sidj) == 2)
            ) {
                return true;
            } else {
                return false;
            }
        }
    });
    $('.square').not('.square:empty').droppable("disable");
}

function checkWin() {
    console.log("checking win");
    console.log("First, are there any legel moves left?");

    if (!legalMovesLeft()) {
        console.log(legalMovesLeft());
        let marblesObBoard = $('.marble').children().prevObject.length;
        console.log(marblesObBoard);
        if (marblesObBoard == 1 && ($('#33.square').attr('class').includes('ui-droppable-disabled'))) {
            success.play();
            createModal('Amazing! You win!');
        } else {
            gameOver.play();
            createModal('No more moves left</br>Game over!');
        }
    } else {
        console.log("Moves left to be played, continue playing");
    }
}

function legalMovesLeft() {
    let moveFound = false;
    let marblesObBoard = $('.marble').children().prevObject.length;
    console.log("marblesObBoard: ", marblesObBoard);
    let i = 0;
    while (i < marblesObBoard && moveFound == false) {
        mid0 = parseInt($('.marble').children().prevObject[i].id);
        let midH1 = mid0 + 1; //id for checking horizontal one side
        let midH2 = mid0 - 1; //id for checking horizontal other side
        let midV1 = mid0 + 10; //id for checking vertical one side
        let midV2 = mid0 - 10; //id for checking horizontal other side
        midH1 = getStringIds(midH1);
        midH2 = getStringIds(midH2);
        midV1 = getStringIds(midV1);
        midV2 = getStringIds(midV2);
        console.log("checking id: ", $('.marble').children().prevObject[i].id);
        console.log(midH1, midH2, midV1, midV2);
        if (midH1 != "00" && midH2 != "00") {
            let a = ($(`#${midH1}.square`).attr('class').includes('ui-droppable-disabled'));
            let b = ($(`#${midH2}.square`).attr('class').includes('ui-droppable-disabled'));
            if ((a == true && b == false) || (a == false && b == true)) { //legal move left
                console.log("horizontal move possible");
                moveFound = true;
                return true;
            }
            console.log("Horizontal move not possible");
        }
        if (midV1 != "00" && midV2 != "00") {
            let c = ($(`#${midV1}.square`).attr('class').includes('ui-droppable-disabled'));
            let d = ($(`#${midV2}.square`).attr('class').includes('ui-droppable-disabled'));
            if ((c == true && d == false) || (c == false && d == true)) { //legal move left
                console.log("vertical move possible");
                moveFound = true;
                return true;
            }
            console.log("Vertical move not possible");
        }
        i++;
    }
    if (i >= marblesObBoard && moveFound == false) {
        return false;
    }
}

function getStringIds(n) {
    let arr = ["0", "1", "5", "6", "19", "29", "39", "27", "37", "47", "72", "73", "74"];
    emptyGrid.forEach((item) => {
        arr.push(item);
    })
    let str = "";
    if (arr.includes(n.toString())) {
        str = "00";
        return str;
    } else {
        if (n <= 0) {
            str = "00";
            return str;
        }
        if (n >= 2 && n < 10) {
            str = "0";
            str += n.toString();
        } else {
            str = n.toString();
        }
    }
    return str;
}


$(() => {
    createGrid();

    // createModal(rules); //remember to remove display none from css .modal class
    setTimeout(() => { createModal(rules) }, 1000);
});