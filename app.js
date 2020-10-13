// citation1: jquery-ui drag drop 
// https://stackoverflow.com/questions/9770935/making-a-chess-game-with-jquery-ui-i-have-used-draggable-but-i-need-to-make-th
// citation2: identifying device type
// https://medium.com/simplejs/detect-the-users-device-type-with-a-simple-javascript-check-4fc656b735e1

let win = false;
let count = 0;
let rules = "Welcome to Brainvita!<p>This one-person game is set up by placing thirty-two marbles on the board, leaving the centre dent empty.<p>The aim of the game is to remove every marble except one, and the last marble must end up in the centre dent.<p>To remove a marble, you must move another marble over it and into an empty dent. The marbles can move up, down, left or right, but not diagonally.";
// let marbleDrop = new Audio('assets/marble1.mp3');
let marbleSound = new Audio('assets/marble2.mp3');
let setupSound = new Audio('assets/win.mp3');
// let setupSound = new Audio('assets/setup.wav');
let winSound = new Audio('assets/winwin.mp3');
let loseSound = new Audio('assets/lose.mp3');
setupSound.volume = 0.4;
loseSound.volume = 0.5;
winSound.volume = 1.0;
let setup = true; //to play sound upon first interaction 

let emptyGrid = [];
let screenSize = {};


const $about = $('.about-game');
$about.on('click', createModal.bind(event, rules));
const $reset = $('.play-again');
$reset.on('click', () => {
    win = false;
    count = 0;
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
            if (!setup) {
                if (!(i == 3 && j == 3)) {
                    const $marble = $('<img>').attr('src', 'assets/marble.png').addClass('marble').hide().attr('id', `${i}${j}`).appendTo($square)
                    let t = parseInt(`${j}`) * 50;
                    $marble.delay(t).show('fast');
                }
                setTimeout(() => { setupSound.play() }, 300);
            }
        }
    }
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
    const $modal = $('<div>').addClass('modal').appendTo('.modal-parent');
    const $modalText = $('<div>').html(t).addClass('modal-text').appendTo($modal);
    const $close = $('<button>').text('Close').addClass('close').appendTo($modalText).on('click', () => {
        if (setup) {
            setTimeout(createGrid, 400);
        }
        $modal.css('display', 'none');
        setup = false;
    });
}

function createDragDrop() {
    $('.marble').draggable({
        containment: "table",
        revert: 'invalid',
        stack: '.marble',
        drag: function(event, marble) {
            if (isMobileTablet()) {
                $(`#${marble.helper[0].id}.marble`).css({
                    'width': '58px',
                    'height': '58px'
                });
            } else {
                $(`#${marble.helper[0].id}.marble`).css({
                    'width': '48px',
                    'height': '48px'
                });
            }
        },
        stop: function(event, marble) {
            $('.marble').css({
                'width': '42px',
                'height': '42px'
            });
        }

    });

    $('.square').droppable({
        drop: function(ev, ui) {
            let marble = ui.draggable; //rename dropped to pawn
            let square = $(this); //rename droppedOn to square
            square.droppable("disable");
            marble.parent().droppable("enable");
            marble.detach().css({ top: 0, left: 0 }).appendTo(square);
            let midi = parseInt(marble.attr('id').split('')[0]); //current marble id i row
            let midj = parseInt(marble.attr('id').split('')[1]); //current marble id j column
            let sidi = parseInt($(this).attr('id').split('')[0]); //target sqaure id i row
            let sidj = parseInt($(this).attr('id').split('')[1]); //target square id j column
            let jumpi = (midi + sidi) / 2; //marble to be deleted if move is legal id i row
            let jumpj = (midj + sidj) / 2; //marble to be deleted if move is legal id j column            
            const $deleteMarble = $(`#${jumpi}${jumpj}.marble`);
            $deleteMarble.parent().droppable("enable");
            // $deleteMarble.remove();
            $deleteMarble.fadeOut();
            marbleSound.play(); //play audio
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
            let jumpi = (midi + sidi) / 2;
            let jumpj = (midj + sidj) / 2;
            if (((Math.abs(midi - sidi) == 2 && Math.abs(midj - sidj) == 0) ||
                    (Math.abs(midi - sidi) == 0 && Math.abs(midj - sidj) == 2)) &&
                ($(`#${jumpi}${jumpj}.square`).attr('class').includes('ui-droppable-disabled'))
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
    // console.log("checking win");
    // console.log("First, are there any legel moves left?");

    if (!legalMovesLeft()) {
        // console.log(legalMovesLeft());
        let marblesObBoard = $('.marble').children().prevObject.length;
        // console.log(marblesObBoard);
        if (marblesObBoard == 1 && ($('#33.square').attr('class').includes('ui-droppable-disabled'))) {
            winSound.play();
            createModal('Amazing! You win!');
        } else {
            loseSound.play();
            createModal('Oops, game over!');
        }
    } else {
        // console.log("Moves left to be played, continue playing");
    }
}

function legalMovesLeft() {
    let moveFound = false;
    let marblesObBoard = $('.marble').children().prevObject.length;
    // console.log("marblesObBoard: ", marblesObBoard);
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
        // console.log("checking id: ", $('.marble').children().prevObject[i].id);
        // console.log(midH1, midH2, midV1, midV2);
        if (midH1 != "00" && midH2 != "00") {
            let a = ($(`#${midH1}.square`).attr('class').includes('ui-droppable-disabled'));
            let b = ($(`#${midH2}.square`).attr('class').includes('ui-droppable-disabled'));
            if ((a == true && b == false) || (a == false && b == true)) { //legal move left
                // console.log("horizontal move possible");
                moveFound = true;
                return true;
            }
            // console.log("Horizontal move not possible");
        }
        if (midV1 != "00" && midV2 != "00") {
            let c = ($(`#${midV1}.square`).attr('class').includes('ui-droppable-disabled'));
            let d = ($(`#${midV2}.square`).attr('class').includes('ui-droppable-disabled'));
            if ((c == true && d == false) || (c == false && d == true)) { //legal move left
                // console.log("vertical move possible");
                moveFound = true;
                return true;
            }
            // console.log("Vertical move not possible");
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

function isMobileTablet() {
    var check = false;
    (function(a) {
        if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4)))
            check = true;
    })(navigator.userAgent || navigator.vendor || window.opera);
    return check;
}

function resizeInner() {
    $('.brainvita').css({
        'width': `${screenSize.availWidth * 0.8}`,
        'height': `${screenSize.availWidth * 0.8}`
    });
}

$(() => {
    screenSize = window.screen
    console.log(screenSize);
    createGrid();

    window.onresize = resizeInner;
    setTimeout(() => { createModal(rules) }, 500);
    resizeInner();
});