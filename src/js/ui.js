// Score

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

// Menu

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
let breathConfigurationSection
let breathProgressFill
let breathConfigurationInstruction
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
    // In game HTML elements
    menuStart = document.getElementById('start-menu')
    menuGameOver = document.getElementById('game-over')
    menuContainer = document.getElementById('menu-container')
    startButton = document.getElementById('start-button')
    restartButton = document.getElementById('restart-button')
    arButton = document.querySelector('.a-enter-ar-button')
    vrButton = document.querySelector('.a-enter-vr-button')
    playerCamera = document.getElementById('player-camera')

    //Pre-game html elements
    bluetoothMenu = document.getElementById('bluetooth-menu')
    connectionSection = document.getElementById('connection-section')
    stressbalConfigurationSection = document.getElementById(
        'stressball-configuration-section'
    )
    stressbalProgressFill = document.querySelector(
        '#stressbal-progress .filling'
    )
    breathConfigurationSection = document.getElementById(
        'breath-configuration-section'
    )
    breathProgressFill = document.querySelector('#breath-progress .filling')
    breathConfigurationInstruction = document.getElementById(
        'breath-configuration-instruction'
    )
    enterGameSection = document.getElementById('enter-game-section')
    enterGameButton = document.getElementById('enter-game')

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

// Bluetooth

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
        showHTML(breathConfigurationSection)
        configureBreath()
    } else {
        hideAllBluetoothMenuSections()
        showHTML(enterGameSection)
    }
}

const hideAllBluetoothMenuSections = () => {
    hideHTML(connectionSection)
    hideHTML(stressbalConfigurationSection)
    hideHTML(breathConfigurationSection)
    hideHTML(enterGameSection)
}

const hideBluetoothMenu = () => {
    showHTML(arButton)
    showHTML(vrButton)
    hideHTML(bluetoothMenu)
    enableLookControls()
}

const changeBreathSectionInstruction = (mode) => {
    if (mode == 'max') {
        breathConfigurationInstruction.innerText =
            'Doe de riem om je buik, en adem zo ver mogelijk in. Hou je adem vast tot de balk vol is.'
    }

    if (mode == 'min') {
        breathConfigurationInstruction.innerText =
            'Adem nu zo ver mogelijk uit. Hou dit vol tot de balk vol is.'
    }
}

const skipBluetoothSetup = () => {
    isStressballReady = true;
    isConnectedToDevice = true;
    isBreathSensorReady = true;
    showBluetoothMenu();
}

// Look controls

const enableLookControls = () => {
    playerCamera.setAttribute('look-controls', 'enabled: true')
}

const disableLookControls = () => {
    playerCamera.setAttribute('look-controls', 'enabled: false')
}
