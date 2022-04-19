const POSITION_X_LEFT = -0.5
const POSITION_X_CENTER = 0
const POSITION_X_RIGHT = 0.5

//controls

//0 = left, 1 = center, 2 = right
let player_position_index = 1

//move player to provided index @param {int} lane
function movePlayerTo(position_index) {
    player_position_index = position_index

    var position = { x: 0, y: 0, z: 0 }

    if (position_index == 0) position.x = POSITION_X_LEFT
    else if (position_index == 1) position.x = POSITION_X_CENTER
    else position.x = POSITION_X_RIGHT

    document.getElementById('player').setAttribute('position', position)
}

function setupControls() {
    AFRAME.registerComponent('lane-controls', {
        tick: function (time, timeDelta) {
            var rotation = this.el.object3D.rotation

            if (rotation.y > 0.1) movePlayerTo(0)
            else if (rotation.y < -0.1) movePlayerTo(2)
            else movePlayerTo(1)
        },
    })
}

//trees

var templateTreeLeft
var templateTreeCenter
var templateTreeRight

var numberOfTrees

function setupTrees() {
    templateTreeLeft = document.getElementById('template-tree-left')
    templateTreeCenter = document.getElementById('template-tree-center')
    templateTreeRight = document.getElementById('template-tree-right')
    treeContainer = document.getElementById('tree-container')
    templates = [templateTreeLeft, templateTreeCenter, templateTreeRight]

    removeTree(templateTreeLeft)
    removeTree(templateTreeCenter)
    removeTree(templateTreeRight)
}

var treeTimer;

function addTreesRandomlyLoop({ intervalLength = 500 } = {}) {
    treeTimer = setInterval(addTreesRandomly, intervalLength)
}

function tearDownTrees() {
    clearInterval(treeTimer);
}

function removeTree(tree) {
    tree.parentNode.removeChild(tree)
}

function addTree(el) {
    numberOfTrees += 1
    el.id = `tree-${numberOfTrees}`
    treeContainer.appendChild(el)
}

function addTreeTo(position_index) {
    let template = templates[position_index]
    addTree(template.cloneNode(true))
}

function addTreesRandomly({
    propTreeLeft = 0.5,
    propTreeCenter = 0.5,
    propTreeRight = 0.5,
    maxNumberTrees = 2,
} = {}) {
    var trees = [
        { propability: propTreeLeft, position_index: 0 },
        { propability: propTreeCenter, position_index: 1 },
        { propability: propTreeRight, position_index: 2 },
    ]

    shuffle(trees)

    var numberOfTreesAdded = 0

    trees.forEach((tree) => {
        if (Math.random() < tree.propability && numberOfTreesAdded < maxNumberTrees) {
            addTreeTo(tree.position_index)
            numberOfTreesAdded += 1
        }
    })

    return numberOfTreesAdded
}

//collision

const POSITION_Z_OUT_OF_SIGHT = 1
const POSITION_Z_LINE_START = 0.6
const POSITION_Z_LINE_END = 0.7

const setupCollision = () => {
    AFRAME.registerComponent('player', {
        tick: () => {
            document.querySelectorAll('.tree').forEach((tree) => {
                position = tree.getAttribute('position')
                tree_position_index = tree.getAttribute('data-tree-position-index')
                tree_id = tree.getAttribute('id')

                if (position.z > POSITION_Z_OUT_OF_SIGHT) {
                    removeTree(tree)
                }

                if (!isGameRunning) return

                if (
                    POSITION_Z_LINE_START < position.z &&
                    position.z < POSITION_Z_LINE_END &&
                    tree_position_index == player_position_index
                ) {
                    gameOver();
                }
            })
        },
    })
}

//game

let isGameRunning = false;

setupControls();
setupCollision();

window.onload = () => {
    setupTrees();
    startGame();
}

function startGame() {
    if (isGameRunning) return;
    isGameRunning = true;

    addTreesRandomlyLoop();
}

function gameOver() {
    isGameRunning = false;
    alert('Game over');

    tearDownTrees();
}

//utilities

const shuffle = (a) => {
    let j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}
