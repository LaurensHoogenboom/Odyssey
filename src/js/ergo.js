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

var treeTimer

function addTreesRandomlyLoop({ intervalLength = 700 } = {}) {
    treeTimer = setInterval(addTreesRandomly, intervalLength)
}

function tearDownTrees() {
    clearInterval(treeTimer)
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

//collision

const POSITION_Z_OUT_OF_SIGHT = 1.9
const POSITION_Z_LINE_START = 0.6
const POSITION_Z_LINE_END = 0.7

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
                    position.z > POSITION_Z_LINE_END &&
                    !countedTrees.has(tree_id)
                ) {
                    addScoreForTree(tree_id)
                    updateScoreDisplay()
                }
            })
        },
    })
}

//score

let score
let countedTrees
let gameOverScoreDisplay
let scoreDisplay

function setupScore() {
    score = 0
    countedTrees = new Set()
    scoreDisplay = document.getElementById('score')
    gameOverScoreDisplay = document.getElementById('game-score')
    scoreDisplay.setAttribute('visible', false)
}

function tearDownScore() {
    scoreDisplay.setAttribute('value', 0)
    scoreDisplay.setAttribute('visible', false)
    gameOverScoreDisplay.setAttribute('value', score)
}

function addScoreForTree(tree_id) {
    if (countedTrees.has(tree_id)) return
    score += 1
    countedTrees.add(tree_id)
}

function updateScoreDisplay() {
    scoreDisplay.setAttribute('visible', true)
    scoreDisplay.setAttribute('value', score)
}

// menu

let menuStart
let menuGameOver
let menuContainer
let startButton
let restartButton
let arButton
let vrButton

let bluetoothMenu
let connectionSection
let stressbalConfigurationSection
let stressbalProgressFill
let enterGameSection
let enterGameButton

function hideEntity(el) {
    el.setAttribute('visible', false)
}

function showEntity(el) {
    el.setAttribute('visible', true)
}

function hideHTML(el) {
    el.classList.add('hidden')
}

function showHTML(el) {
    el.classList.remove('hidden')
}

function setupAllMenus() {
    // Get HTML elements
    menuStart = document.getElementById('start-menu')
    menuGameOver = document.getElementById('game-over')
    menuContainer = document.getElementById('menu-container')
    startButton = document.getElementById('start-button')
    restartButton = document.getElementById('restart-button')
    arButton = document.querySelector('.a-enter-ar-button')
    vrButton = document.querySelector('.a-enter-vr-button')

    bluetoothMenu = document.getElementById('bluetooth-menu')
    connectionSection = document.getElementById('connection-section')
    stressbalConfigurationSection = document.getElementById(
        'stressball-configuration-section'
    )
    stressbalProgressFill = document.querySelector('#stressbal-progress .filling')
    enterGameSection = document.getElementById('enter-game-section')
    enterGameButton = document.getElementById('enter-game')

    playerCamera = document.getElementById('player-camera')

    // Set eventlisteners
    enterGameButton.addEventListener('click', enterGame)
    startButton.addEventListener('click', startGame)
    restartButton.addEventListener('click', startGame)

    // Open initial menu's
    hideAllMenus()
    showBluetoothMenu()
}

function hideAllMenus() {
    hideEntity(menuContainer)
    hideBluetoothMenu()
    enterGameButton.style.pointerEvents = 'none'
    startButton.classList.remove('clickable')
    restartButton.classList.remove('clickable')
}

function showGameOverMenu() {
    showEntity(menuContainer)
    hideEntity(menuStart)
    showEntity(menuGameOver)
    startButton.classList.remove('clickable')
    restartButton.classList.add('clickable')
}

function showStartMenu() {
    showEntity(menuContainer)
    hideEntity(menuGameOver)
    showEntity(menuStart)
    startButton.classList.add('clickable')
    restartButton.classList.remove('clickable')
}

const showBluetoothMenu = () => {
    showHTML(bluetoothMenu)
    hideHTML(arButton)
    hideHTML(vrButton)
    disableLookControls()

    if (!isConnectedToDevice) {
        hideAllBluetoothMenuSections()
        showHTML(connectionSection)
    } else if (!isStressballReady) {
        hideAllBluetoothMenuSections()
        showHTML(stressbalConfigurationSection)
        configureStressBal()
    } else if (!isBreathSensorReady) {
        hideAllBluetoothMenuSections()
        // breath sensor section
    } else {
        hideAllBluetoothMenuSections()
        showHTML(enterGameSection)
    }
}

const hideAllBluetoothMenuSections = () => {
    hideHTML(connectionSection)
    hideHTML(stressbalConfigurationSection)
    //hide breath sensor section
    hideHTML(enterGameSection)
}

const hideBluetoothMenu = () => {
    showHTML(arButton)
    showHTML(vrButton)
    hideHTML(bluetoothMenu)
    enableLookControls()
}

const enableLookControls = () => {
    playerCamera.setAttribute('look-controls', 'enabled: true')
}

const disableLookControls = () => {
    playerCamera.setAttribute('look-controls', 'enabled: false')
}

// sensor configuration

let isStressballReady = false
let isBreathSensorReady = false
let sensorConfigurationStarted = false
let stressBallMaxPressure = 0
let breathMinPressure = 0
let breathMaxPressure = 0

const configureStressBal = () => {
    let progress = 0;
    btDataMessageHandlers.push(changeStressBalMaxPressure)

    const configurationInterval = setInterval(() => {
        bluetooth.send('ANGER?')

        if (sensorConfigurationStarted) {
            progress +=20;
            stressbalProgressFill.style.width = `${progress}%`;
        }
        
        if (progress == 100) {
            setTimeout(() => {
                removeBtMessageHandler(changeStressBalMaxPressure);
                isStressballReady = true;
                sensorConfigurationStarted = false;
                showBluetoothMenu();
                console.log(stressBallMaxPressure);
                clearInterval(configurationInterval);
            }, 500)
        }
    }, 1000)
}

const changeStressBalMaxPressure = (data) => {
    const label = getLabelFromBtMessage(data)
    const value = getDataFromBtMessage(data)

    if (label == 'ANGER' && value > stressBallMaxPressure) {
        stressBallMaxPressure = value
    }

    if (value > 900) {
        sensorConfigurationStarted = true
    }
}

//game

let isGameRunning = false
let bluetooth = undefined

setupControls()
setupCollision()

window.onload = () => {
    setupAllMenus()
    setupScore()
    setupTrees()
    btNotificationMessageHandlers.push(handleConnectionConfirmation)
    bluetooth = new BluetoothController(handleReceivedBluetoothData)
}

const enterGame = () => {
    hideBluetoothMenu()
    showStartMenu()
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

    tearDownTrees()
    tearDownScore()
    showGameOverMenu()
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
    console.log(data);

    if (data == 'CONNECTED!') {
        console.log('Connected! Ready to start.')
        isConnectedToDevice = true
        showBluetoothMenu()
        removeBtMessageHandler(handleConnectionConfirmation)
    }
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

const getLabelFromBtMessage = (data) => {
    const messageArray = data.split(': ')
    return messageArray[0]
}

const getDataFromBtMessage = (data) => {
    const messageArray = data.split(': ')
    return messageArray[1]
}
