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

var numberOfTrees = 0

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

let treeTimer
let intervalLength = 2000

function addTreesRandomlyLoop() {
    playTime += intervalLength

    setTimeout(() => {
        addTreesRandomly()

        if (intervalLength > 500) {
            intervalLength = 0.98 * intervalLength
        }

        if (isGameRunning) addTreesRandomlyLoop()
    }, intervalLength)
}

function removeTree(tree) {
    tree.parentNode.removeChild(tree)
}

function addTree(el, position_index) {
    numberOfTrees += 1

    if (playTime > 5000) {
        let volumes = [0.3, 0.6, 0.9]

        shuffle(volumes);

        let obstacleTypes = [
            "experience",
            "feedback",
            "imagination",
            "mirror"
        ]
    
        let obstacleType = obstacleTypes[Math.floor(Math.random()*obstacleTypes.length)]
    
        el.id = `tree-${numberOfTrees}`
        el.setAttribute('sound', {
            "src": `#${obstacleType}-thought`, 
            "autoplay": true,
            "loop": true,
            "volume": volumes[position_index]
        })
    }

    treeContainer.appendChild(el)
}

function addTreeTo(position_index) {
    let template = templates[position_index]
    addTree(template.cloneNode(true), position_index)
}

function addTreesRandomly({
    propTreeLeft = 0.5,
    propTreeCenter = 0.5,
    propTreeRight = 0.5,
    maxNumberTrees = 2,
} = {}) {
    let trees = [
        { propability: propTreeLeft, position_index: 0 },
        { propability: propTreeCenter, position_index: 1 },
        { propability: propTreeRight, position_index: 2 },
    ]

    shuffle(trees)

    var numberOfTreesAdded = 0

    trees.forEach((tree) => {
        if (
            Math.random() < tree.propability &&
            numberOfTreesAdded < maxNumberTrees
        ) {
            addTreeTo(tree.position_index)
            numberOfTreesAdded += 1
        }
    })

    return numberOfTreesAdded
}

const muteAllTrees = () => {
    const treeList = document.querySelectorAll('.tree');

    treeList.forEach(tree => {
        fadeAudioOut(tree, 0, 0.5);
    })
}

//collision

let POSITION_Z_OUT_OF_SIGHT = 1.9
let POSITION_Z_LINE_START = 0.6
let POSITION_Z_LINE_END = 0.7

const setupCollision = () => {
    AFRAME.registerComponent('player', {
        tick: () => {
            document.querySelectorAll('.tree').forEach((tree) => {
                position = tree.getAttribute('position')
                tree_position_index = tree.getAttribute(
                    'data-tree-position-index'
                )
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
                    gameOver()
                }

                if (
                    position.z > Math.abs(POSITION_Z_LINE_END) &&
                    !countedTrees.has(tree_id)
                ) {
                    addScoreForTree(tree_id)
                    updateScoreDisplay()
                }
            })
        },
    })
}

//ocean

let ocean

const setupOcean = () => {
    ocean = document.getElementById('ocean')
}

//game

let isGameRunning = false
let bluetooth
let playerSphere
let playTime = 0

setupControls()
setupCollision()

window.onload = () => {
    setupAllMenus()
    setupScore()
    setupTrees()
    setupOcean()
    bindToggleVRModeEventSettings()
    btNotificationMessageHandlers.push(handleConnectionConfirmation)
    bluetooth = new BluetoothController(handleReceivedBluetoothData)
    playerSphere = document.getElementById('player-sphere')
}

const enterGame = () => {
    hideBluetoothMenu()
    showStartMenu()
    ocean.components.sound.playSound()
    fadeAudioIn(ocean, 0.03, 10);
}

function startGame() {
    if (isGameRunning) return
    isGameRunning = true

    setupScore()
    updateScoreDisplay()
    addTreesRandomlyLoop()
    hideAllMenus()
}

function gameOver() {
    isGameRunning = false
    playTime = 0
    intervalLength = 2000

    muteAllTrees()
    tearDownScore()
    showGameOverMenu()
}

const bindToggleVRModeEventSettings = () => {
    document.querySelector('a-scene').addEventListener('enter-vr', function () {
        playerSphere.setAttribute('animation__position', {
            property: 'position',
            from: { x: 0, y: 0.5, z: -0.5 },
            to: { x: 0, y: 0.525, z: -0.5 },
            loop: true,
            dir: 'alternate',
            dur: 15000,
            easing: 'easeInOutQuad',
        })

        POSITION_Z_OUT_OF_SIGHT = 1.9
        POSITION_Z_LINE_START = -0.6
        POSITION_Z_LINE_END = -0.5
    })

    document.querySelector('a-scene').addEventListener('exit-vr', function () {
        playerSphere.setAttribute('animation__position', {
            property: 'position',
            from: { x: 0, y: 0.5, z: 0.6 },
            to: { x: 0, y: 0.525, z: 0.6 },
            loop: true,
            dir: 'alternate',
            dur: 15000,
            easing: 'easeInOutQuad',
        })

        POSITION_Z_OUT_OF_SIGHT = 1.9
        POSITION_Z_LINE_START = 0.6
        POSITION_Z_LINE_END = 0.7
    })
}

//audio

const fadeAudioIn = (element, max, length) => {
    //16 for 60 fps
    step = max / (length * (1000 / 16));
    currentVolume = element.components.sound.data.volume;

    fadeInterval = setInterval(() => {
        if (currentVolume < max) {  
            element.setAttribute('sound', 'volume', currentVolume + step)
            currentVolume += step;
        } else {
            clearInterval(fadeInterval);
        }
    }, 16);
}

const fadeAudioOut = (element, min, length) => {
    //16 for 60 fps
    step = (1 - min) / (length * (1000 / 16));
    currentVolume = element.components.sound.data.volume;

    fadeInterval = setInterval(() => {
        if (currentVolume > min) {  
            element.setAttribute('sound', 'volume', currentVolume - step)
            currentVolume -= step;
        } else {
            clearInterval(fadeInterval);
        }
    }, 16);
}

//bluetooth

let isConnectedToDevice = false
let btDataMessageHandlers = []
let btNotificationMessageHandlers = []

const handleReceivedBluetoothData = (data) => {
    const messageType = data.includes(':') ? 'data' : 'notification'

    if (messageType == 'data') {
        for (i = 0; i < btDataMessageHandlers.length; i++) {
            btDataMessageHandlers[i](data)
        }
    }

    if (messageType == 'notification') {
        for (i = 0; i < btNotificationMessageHandlers.length; i++) {
            btNotificationMessageHandlers[i](data)
        }
    }
}

const removeBtMessageHandler = (handler) => {
    const dataHandlerIndex = btDataMessageHandlers.indexOf(handler)
    const notifcationHandlerIndex =
        btNotificationMessageHandlers.indexOf(handler)

    if (dataHandlerIndex > -1) {
        btDataMessageHandlers.splice(dataHandlerIndex, 1)
    }

    if (notifcationHandlerIndex < -1) {
        btNotificationMessageHandlers.splice(notifcationHandlerIndex, 1)
    }
}

const handleConnectionConfirmation = (data) => {
    console.log(data)

    if (data == 'CONNECTED!') {
        console.log('Connected! Ready to start.')
        isConnectedToDevice = true
        showBluetoothMenu()
        removeBtMessageHandler(handleConnectionConfirmation)
    }
}

const getLabelFromBtMessage = (data) => {
    const messageArray = data.split(': ')
    return messageArray[0]
}

const getDataFromBtMessage = (data) => {
    const messageArray = data.split(': ')
    return messageArray[1]
}

//utilities

const shuffle = (a) => {
    let j, x, i
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1))
        x = a[i]
        a[i] = a[j]
        a[j] = x
    }
    return a
}