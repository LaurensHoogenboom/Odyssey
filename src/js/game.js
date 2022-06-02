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

const obstacleTypes = ['experience', 'feedback', 'imagination', 'mirror']
let obstacleTypesLeft = ['experience', 'feedback', 'imagination', 'mirror']
let templateThoughtLeft
let templateThoughtCenter
let templateThoughtRight

let numberOfThoughts = 0

let RUNNING_TIME_BEFORE_REAL_OBSTACLES = 5000

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
    runningTime += intervalLength

    setTimeout(() => {
        addThoughtsRandomly()

        if (intervalLength > 500) {
            intervalLength = 0.98 * intervalLength
        }

        if (isGameRunning && currentChapter == chapters.running) addThoughtsRandomlyLoop()
    }, intervalLength)
}

function addThought(el) {
    numberOfThoughts += 1

    if (runningTime > RUNNING_TIME_BEFORE_REAL_OBSTACLES) {
        let obstacleType = obstacleTypesLeft[Math.floor(Math.random() * obstacleTypesLeft.length)]
        let emotiveCloud = el.querySelector('.emotive-cloud')
        let neutralCloud = el.querySelector('.neutral-cloud')

        emotiveCloud.setAttribute('visible', true);
        neutralCloud.setAttribute('visible', false)

        el.id = `thought-${numberOfThoughts}`
        el.setAttribute('data-obstacle-type', obstacleType)
        el.setAttribute('sound', {
            src: `#${obstacleType}-thought`,
            autoplay: true,
            loop: true,
            volume: 0,
        })
    }

    thoughtContainer.appendChild(el)
}

function addThoughtTo(position_index) {
    let template = templates[position_index]
    addThought(template.cloneNode(true), position_index)
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

    var numberOfThoughtsAdded = 0

    thoughts.forEach((thought) => {
        if (Math.random() < thought.propability && numberOfThoughtsAdded < maxNumberOfThoughts) {
            addThoughtTo(thought.position_index)
            numberOfThoughtsAdded += 1
        }
    })

    return numberOfThoughtsAdded
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
                    thought_position_index == controls.player_position_index
                ) {
                    if (thought.hasAttribute('data-obstacle-type')) {
                        startConfrontation(thought)
                    } else {
                        shakePathAndSea()
                    }
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
let playerSphere
let playerCamera
let runningTime = 0
let introduction

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

    // Init stuff
    setupAllMenus()
    setupInstruction()
    setupThoughts()
    setupEnvironment()
    bindToggleVRModeEventSettings()
}

const enterGame = () => {
    hideBluetoothMenu()
    showStartMenu()
    setupSound()
    oceanNormal.emit('play')
}

function startGame() {
    if (isGameRunning) return

    isGameRunning = true
    obstacleTypesLeft = obstacleTypes

    setupInstruction()
    setInstruction(' ')
    hideAllMenus()

    introduction.start(addThoughtsRandomlyLoop)
}

function gameOver() {
    isGameRunning = false
    runningTime = 0
    intervalLength = 2000
    currentChapter = chapters.introduction

    introduction.reset()
    muteAllThoughts()
    hideInstruction()
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

        document.getElementById('player-camera').setAttribute('fov', 120)
    })

    document.querySelector('a-scene').addEventListener('exit-vr', function () {
        cameraContainer.setAttribute('position', {
            x: 0,
            y: 0,
            z: 0,
        })

        document.getElementById('player-camera').setAttribute('fov', 80)
    })
}

//#endregion

//#region Audio

const fadeAudioIn = (element, max, length) => {
    element.setAttribute('animation__fadeSoundIn', {
        easing: 'linear',
        property: 'sound.volume',
        autoplay: true,
        to: max,
        dur: length,
    })
}

const fadeAudioOut = (element, min, length) => {
    element.setAttribute('animation__fadeSoundOut', {
        easing: 'linear',
        property: 'sound.volume',
        autoplay: true,
        to: min,
        dur: length,
    })
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
    obj.parentNode.removeChild(obj);
}

//#endregion
