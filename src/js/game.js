//#region Controls

class Controls {
    constructor() {
        this.POSITION_X_LEFT = -0.5
        this.POSITION_X_CENTER = 0
        this.POSITION_X_RIGHT = 0.5

        this.player_position_index = 1
        this.player = document.getElementById('player')
        this.playerCamera = document.getElementById('player-camera')

        this.canMove = false
        this.registerComponent()
    }

    registerComponent() {
        let controls = this

        AFRAME.registerComponent('lane-controls', {
            tick: function (time, timeDelta) {
                if (controls.canMove) {
                    let rotation = this.el.object3D.rotation

                    if (rotation.y > 0.1) controls.movePlayerTo(0)
                    else if (rotation.y < -0.1) controls.movePlayerTo(2)
                    else controls.movePlayerTo(1)
                } else {
                    controls.movePlayerTo(1)
                }
            },
        })

        this.playerCamera.setAttribute('lane-controls', '')
    }

    movePlayerTo(position_index) {
        this.player_position_index = position_index
        const oldPosition = this.player.getAttribute('position')
        let position = { x: 0, y: 0, z: 0 }

        if (position_index == 0) position.x = this.POSITION_X_LEFT
        else if (position_index == 1) position.x = this.POSITION_X_CENTER
        else position.x = this.POSITION_X_RIGHT

        if (JSON.stringify(oldPosition) != JSON.stringify(position)) {
            this.fireEvent(position_index)
        }

        this.player.setAttribute('position', position)
    }

    fireEvent(position_index, player = this.player) {
        if (position_index == 0) player.emit('movedLeft', null, false)
        else if (position_index == 1) player.emit('movedCenter', null, false)
        else player.emit('movedRight', null, false)
    }

    enable() {
        this.canMove = true
    }

    disable() {
        this.canMove = false
    }
}

//#endregion

//#region Thoughts
let templates
let templateThoughtLeft
let templateThoughtCenter
let templateThoughtRight

let numberOfThoughts = 0
let numberOfThoughtsInRow = 0

const RUNNING_TIME_BEFORE_EMOTIVE_OBSTACLES = 1000
const RUNNING_TIME_BEFORE_TWO_EMOTIVE_OBSTACLES = 15000
const RUNNING_TIME_BEFORE_ALL_EMOTIVE_OBSTACLES = 50000

function setupThoughts() {
    templateThoughtLeft = document.getElementById('template-thought-left')
    templateThoughtCenter = document.getElementById('template-thought-center')
    templateThoughtRight = document.getElementById('template-thought-right')
    thoughtContainer = document.getElementById('thought-container')
    templates = [templateThoughtLeft, templateThoughtCenter, templateThoughtRight]

    removeObject(templateThoughtLeft)
    removeObject(templateThoughtCenter)
    removeObject(templateThoughtRight)
}

let thoughtTimer
let intervalLength = 2000

function addThoughtsRandomlyLoop() {
    //if connected
    runningTime += intervalLength

    setTimeout(() => {
        addThoughtsRandomly()

        // if connected

        if (intervalLength > 500) {
            intervalLength = 0.98 * intervalLength
        }

        if (isGameRunning && currentChapter == chapters.running) addThoughtsRandomlyLoop()
    }, intervalLength)
}

function addThoughtsRandomly({
    propThoughtLeft = 0.5,
    propThoughtCenter = 0.5,
    propThoughtRight = 0.5,
    maxNumberOfThoughts = 2,
} = {}) {
    let thoughts = [
        { propability: propThoughtLeft, position_index: 0 },
        { propability: propThoughtCenter, position_index: 1 },
        { propability: propThoughtRight, position_index: 2 },
    ]

    shuffle(thoughts)

    numberOfThoughtsInRow = 0

    thoughts.forEach((thought) => {
        if (Math.random() < thought.propability && numberOfThoughtsInRow < maxNumberOfThoughts) {
            addThoughtTo(thought.position_index)
            numberOfThoughtsInRow += 1
        }
    })

    return numberOfThoughtsInRow
}

function addThoughtTo(position_index) {
    let template = templates[position_index]
    addThought(template.cloneNode(true), position_index)
}

function addThought(el) {
    numberOfThoughts += 1

    switch (true) {
        case runningTime > RUNNING_TIME_BEFORE_ALL_EMOTIVE_OBSTACLES:
            el = addObstacleToElement(el)
            break
        case runningTime > RUNNING_TIME_BEFORE_TWO_EMOTIVE_OBSTACLES:
            if (Math.random() < 0.5) {
                el = addObstacleToElement(el)
            }

            break
        case runningTime > RUNNING_TIME_BEFORE_EMOTIVE_OBSTACLES:
            if (numberOfThoughts > 2 && Math.random() < 0.5 && numberOfThoughtsInRow < 2) {
                el = addObstacleToElement(el)
            }

            break
        default:
            break
    }

    thoughtContainer.appendChild(el)
}

function addObstacleToElement(el) {
    // if connected

    toggleEmotiveThought(el)
    el.id = `thought-${numberOfThoughts}`
    el.setAttribute('emotive')
    el.setAttribute('sound', {
        src: `#heartbeat`,
        autoplay: true,
        loop: true,
        volume: 1,
    })

    return el
}

const toggleEmotiveThought = (obstacle) => {
    let emotiveCloud = obstacle.querySelector('.emotive-cloud')
    let neutralCloud = obstacle.querySelector('.neutral-cloud')

    emotiveCloud.setAttribute('visible', true)
    neutralCloud.setAttribute('visible', false)
}

const muteAllThoughts = () => {
    const thoughtList = document.querySelectorAll('.thought')

    thoughtList.forEach((thought) => {
        fadeAudioOut(thought, 0, 500)
    })
}

//#endregion

//#region Collision

let POSITION_Z_OUT_OF_SIGHT = 1.9
let POSITION_Z_LINE_START = 0.6
let POSITION_Z_LINE_END = 0.7

const setupCollision = () => {
    AFRAME.registerComponent('player', {
        tick: () => {
            document.querySelectorAll('.thought').forEach((thought) => {
                position = thought.getAttribute('position')
                thought_position_index = thought.getAttribute('data-thought-position-index')
                thought_id = thought.getAttribute('id')

                if (position.z > POSITION_Z_OUT_OF_SIGHT) {
                    removeObject(thought)
                }

                if (!isGameRunning || currentChapter != chapters.running) return

                if (
                    POSITION_Z_LINE_START < position.z &&
                    position.z < POSITION_Z_LINE_END &&
                    thought_position_index == controls.player_position_index &&
                    thought.hasAttribute('emotive')
                ) {
                    confrontation.start(thought)
                }
            })
        },
    })
}

//#endregion

//#region Game

let isGameRunning = false
const chapters = Object.freeze({
    introduction: 'introduction',
    running: 'running',
    confrontation: 'confrontation',
    relieve: 'relieve',
})

let currentChapter = chapters.introduction
let bluetooth
let sensorConfiguration
let controls
let confrontation
let environment
let playerSphere
let playerCamera
let runningTime = 0
let round = 0
let introduction
let progress

setupCollision()

const init = () => {
    // Bluetooth and sensors
    btNotificationMessageHandlers.push(handleConnectionConfirmation)
    bluetooth = new BluetoothController(handleReceivedBluetoothData)
    sensorConfiguration = new SensorConfiguration()

    // Cache Elements
    playerSphere = document.getElementById('player-sphere')
    cameraContainer = document.getElementById('camera-container')

    // Chapters and gameplay
    introduction = new Introduction(player, playerSphere, addThoughtsRandomlyLoop)
    controls = new Controls()
    confrontation = new Confrontation()
    environment = new Environment()
    progress = new Progress()

    // Init stuff
    setupAllMenus()
    setupInstruction()
    setupThoughts()
    bindToggleVRModeEventSettings()
}

const enterGame = () => {
    hideBluetoothMenu()
    showStartMenu()
    environment.setupSound()
}

function startGame() {
    if (isGameRunning) return

    isGameRunning = true

    setupInstruction()
    setInstruction(' ')
    hideAllMenus()

    introduction.start(addThoughtsRandomlyLoop)
}

function gameOver() {
    isGameRunning = false
    runningTime = 0
    round = 0
    intervalLength = 2000
    currentChapter = chapters.introduction
    controls.enable()
    introduction.reset()
    muteAllThoughts()
}

//#endregion

//#region VR Mode

const bindToggleVRModeEventSettings = () => {
    document.querySelector('a-scene').addEventListener('enter-vr', function () {
        cameraContainer.setAttribute('position', {
            x: 0,
            y: 0,
            z: 3,
        })
    })

    document.querySelector('a-scene').addEventListener('exit-vr', function () {
        cameraContainer.setAttribute('position', {
            x: 0,
            y: 0,
            z: 0,
        })
    })
}

//#endregion

//#region Audio

const fadeAudioIn = (element, max, length) => {
    element.setAttribute('animation__fadeSoundIn', {
        easing: 'linear',
        property: 'sound.volume',
        startEvents: 'fadeIn',
        to: max,
        dur: length,
    })

    element.emit('fadeIn')
}

const fadeAudioOut = (element, min, length) => {
    element.setAttribute('animation__fadeSoundOut', {
        easing: 'linear',
        property: 'sound.volume',
        startEvents: 'fadeOut',
        to: min,
        dur: length,
    })

    element.emit('fadeOut')
}

//#endregion

//#region Bluetooth

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

const removeBtMessageHandler = (handlerToRemove) => {
    const dataHandlerIndex = btDataMessageHandlers.findIndex(
        (handler) => handler.name == handlerToRemove.name
    )
    const notifcationHandlerIndex = btNotificationMessageHandlers.findIndex(
        (handler) => handler.name == handlerToRemove.name
    )

    if (dataHandlerIndex > -1) {
        btDataMessageHandlers.splice(dataHandlerIndex, 1)
    }

    if (notifcationHandlerIndex < -1) {
        btNotificationMessageHandlers.splice(notifcationHandlerIndex, 1)
    }
}

const handleConnectionConfirmation = (data) => {
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
    return parseInt(messageArray[1])
}

//#endregion

//#region Utilities

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

function makeid(length) {
    var result = ''
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    var charactersLength = characters.length
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength))
    }
    return result
}

function calculateAverageFromArray(array) {
    var total = 0
    var count = 0

    array.forEach(function (item, index) {
        total += item
        count++
    })

    return total / count
}

function removeObject(obj) {
    obj.parentNode.removeChild(obj)
}

const scale = (inputY, yRange, xRange) => {
    const [xMin, xMax] = xRange
    const [yMin, yMax] = yRange

    const percent = (inputY - yMin) / (yMax - yMin)
    const outputX = percent * (xMax - xMin) + xMin

    return outputX
}

//#endregion
