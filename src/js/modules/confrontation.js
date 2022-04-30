/*
    ====================
    Confrontation Module
    ====================
*/

// Obstacle
let obstacle
let obstacleType
let TREE_CONFRONTATION_Z_INDEX = -1
let centeredObstaclePosition
let grownObstaclePosition
let grownObstacleSize

// Confrontation Fases
const fases = Object.freeze({ angry: 'angry', afraid: 'afraid' })
let currentFase = fases.angry

// Sensor values
let lastAngryPressure
let lastBreathTime

/*
    TODO:
    2. adjust environment
    3. adjust volume
    4. add hearthbeath
    4. add tree pulse animation
    5. add shake animation
*/

const startConfrontation = (obstacleToConfrontWith) => {
    //Setup chapter
    currentChapter = chapters.confrontation
    currentFase = fases.angry

    //Setup obstacle
    obstacle = obstacleToConfrontWith
    obstacleType = obstacle.getAttribute('data-obstacle-type')

    //Setup obstacle position
    setupObstaclePosition()
    focusObstacle()

    setTimeout(() => {
        handleAnger()
    }, 2500)
}

const setupObstaclePosition = () => {
    centeredObstaclePosition = {
        x: 0,
        y: 0.6,
        z: TREE_CONFRONTATION_Z_INDEX,
    }
    grownObstaclePosition = { x: 0, y: 1.8, z: TREE_CONFRONTATION_Z_INDEX }
    grownObstacleSize = { x: 2, y: 2, z: 2 }
}

const focusObstacle = () => {
    //Change position

    console.log('fire')

    obstacle.setAttribute('animation__centerTree', {
        property: 'position',
        to: centeredObstaclePosition,
        dur: 500,
        easing: 'easeInQuad',
        autoplay: true,
    })

    obstacle.setAttribute('animation__growTree', {
        property: 'scale',
        to: grownObstacleSize,
        dur: 2000,
        easing: 'easeInQuad',
        autoplay: true,
        delay: 300,
    })

    obstacle.setAttribute('animation__keepFloored', {
        property: 'position',
        from: centeredObstaclePosition,
        to: grownObstaclePosition,
        dur: 2000,
        easing: 'easeInQuad',
        autoplay: true,
        delay: 300,
    })

    obstacle.setAttribute('sound', {
        src: `#${obstacleType}-thought-reverb`,
        autoplay: true,
        loop: true,
        volume: 0,
    })

    fadeAudioIn(obstacle, 8, 2)
}

const changeEvenvironmentTheme = () => {}

const shakePathAndSea = () => {}

const handleAnger = () => {
    btDataMessageHandlers.push(changeTreeSizeOnStress)

    const configurationInterval = setInterval(() => {
        bluetooth.send('ANGER?')

        if (
            currentFase != fases.angry ||
            currentChapter != chapters.confrontation
        ) {
            clearInterval(configurationInterval)
            removeBtMessageHandler(changeTreeSizeOnStress)
        }
    }, 250)
}

const changeTreeSizeOnStress = (data) => {
    let label = getLabelFromBtMessage(data)
    let value = getDataFromBtMessage(data)
    let shrinkThreshold = 0.8 * stressBallMaxPressure
    let growThreshold = 0.6 * stressBallMaxPressure
    let oldGrownPosition = grownObstaclePosition

    // Data is not from stressball
    if (label != 'ANGER') return

    // User is pressing
    if (value > shrinkThreshold) {
        grownObstacleSize = {
            x: 0.95 * grownObstacleSize.x,
            y: 0.95 * grownObstacleSize.y,
            z: 0.95 * grownObstacleSize.z,
        }

        grownObstaclePosition = {
            x: grownObstaclePosition.x,
            y: 0.95 * grownObstaclePosition.y,
            z: grownObstaclePosition.z,
        }
    }

    // User is releasing
    if (value < growThreshold && grownObstacleSize.z < 2.0) {
        grownObstacleSize = {
            x: 1.05 * grownObstacleSize.x,
            y: 1.05 * grownObstacleSize.y,
            z: 1.05 * grownObstacleSize.z,
        }

        grownObstaclePosition = {
            x: grownObstaclePosition.x,
            y: 1.05 * grownObstaclePosition.y,
            z: grownObstaclePosition.z,
        }
    }

    // Apply new scale and position

    obstacle.setAttribute('animation__size', {
        property: 'scale',
        to: grownObstacleSize,
        dur: 250,
        easing: 'linear',
        autoplay: true,
    })

    obstacle.setAttribute('animation__position', {
        property: 'position',
        from: oldGrownPosition,
        to: grownObstaclePosition,
        dur: 250,
        easing: 'linear',
        autoplay: true,
    })

    // Anger thought destroyed
    if (grownObstacleSize.z <= 0.5) {
        quitAnger()
    }
}

const quitAnger = () => {
    fadeAudioOut(obstacle, 0.0, 0.25)

    setTimeout(() => {
        removeTree(obstacle)
    }, 250)

    //Future: switch to afraid and after that to running when anythig left
    //currentFase = fases.afraid

    const index = obstacleTypesLeft.indexOf(obstacleType)
    obstacleTypesLeft.splice(index, 1)

    if (obstacleTypesLeft.length > 0) {
        currentChapter = chapters.running
        runningTime = 5000
        addTreesRandomlyLoop()
    } else {
        isGameRunning = false
        muteAllTrees()
        tearDownScore()
        showStartMenu()
    }

    setupObstaclePosition()
}