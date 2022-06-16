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
    runningTime += intervalLength

    setTimeout(() => {
        addThoughtsRandomly()

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

    el.id = `thought-${numberOfThoughts}`
    thoughtContainer.appendChild(el)
}

function addObstacleToElement(el) {
    toggleEmotiveThought(el)
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
    const neutralCloud = obstacle.querySelector('.neutral-cloud')
    if (neutralCloud) removeObject(neutralCloud)

    const oldModel = document.createElement('a-entity')
    oldModel.setAttribute('gltf-model', '#emotive_cloud')
    oldModel.setAttribute('class', 'emotive-cloud')
    obstacle.appendChild(oldModel)
}

const muteAllThoughts = () => {
    const thoughtList = document.querySelectorAll('.thought')

    thoughtList.forEach((thought) => {
        if (thought.hasAttribute('emotive')) fadeAudioOut(thought, 0, 500)
    })
}

const createCloudPart = (position, scale, color = 'white') => {
    const cloudPart = document.createElement('a-sphere')
    cloudPart.setAttribute('position', vect3ToString(position))
    cloudPart.setAttribute('scale', vect3ToString(scale))
    cloudPart.setAttribute('material', `color: ${color}; flatShading: true;`)
    cloudPart.setAttribute('segments-height', 6)
    cloudPart.setAttribute('segments-width', 6)
    cloudPart.setAttribute('dynamic-body', 'shape: sphere; sphereRadius: 0.4;')
    cloudPart.setAttribute('class', 'cloud-part')
    document.getElementById('scene').appendChild(cloudPart)
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
                rightChapter =
                    currentChapter == chapters.running || currentChapter == chapters.introduction

                if (position.z > POSITION_Z_OUT_OF_SIGHT) removeObject(thought)

                if (!isGameRunning || !rightChapter) return

                if (
                    POSITION_Z_LINE_START < position.z &&
                    position.z < POSITION_Z_LINE_END &&
                    thought_position_index == controls.player_position_index
                ) {
                    if (thought.hasAttribute('emotive')) {
                        confrontation.start(thought)
                    } else if (!thought.hasAttribute('hidden')) {
                        hideThought(thought)
                    }
                }
            })
        },
    })
}

const hideThought = (thought) => {
    thought.setAttribute('hidden')
    let oldPosition = thought.getAttribute('position')
    let newPosition = structuredClone(oldPosition)
    newPosition.y = -1

    thought.setAttribute('animation__hide', 'from', vect3ToString(oldPosition))
    thought.setAttribute('animation__hide', 'to', vect3ToString(newPosition))
    thought.emit('hide')
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
let relieve
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
    relieve = new Relieve()

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

const startGame = () => {
    if (isGameRunning) return

    isGameRunning = true

    setupInstruction()
    setInstruction(' ')
    hideAllMenus()

    introduction.start(addThoughtsRandomlyLoop)
}

const gameOver = () => {
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
            z: 3.5,
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

const makeid = (length) => {
    var result = ''
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    var charactersLength = characters.length
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength))
    }
    return result
}

const calculateAverageFromArray = (array) => {
    var total = 0
    var count = 0

    array.forEach(function (item, index) {
        total += item
        count++
    })

    return total / count
}

const removeObject = (obj) => {
    obj.parentNode.removeChild(obj)
}

const scale = (inputY, yRange, xRange) => {
    const [xMin, xMax] = xRange
    const [yMin, yMax] = yRange

    const percent = (inputY - yMin) / (yMax - yMin)
    const outputX = percent * (xMax - xMin) + xMin

    return outputX
}

const vect3ToString = (vector) => {
    return vector ? `${vector.x} ${vector.y} ${vector.z}` : null
}

const hexToRgb = (hex) => {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i
    hex = hex.replace(shorthandRegex, (m, r, g, b) => {
        return r + r + g + g + b + b
    })

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
        ? {
              r: parseInt(result[1], 16),
              g: parseInt(result[2], 16),
              b: parseInt(result[3], 16),
          }
        : null
}

const rgbToHex = (r, g, b) => {
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
}

//#endregion
