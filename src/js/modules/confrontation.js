/*
    ====================
    Confrontation Module
    ====================
*/

// Obstacle
let obstacleConfrontationCache = []
let TREE_CONFRONTATION_Z_INDEX = -1

// Confrontation Fases
const fases = Object.freeze({ angry: 'angry', afraid: 'afraid' })
let currentFase = fases.angry

// Sensor values
let lastAngryPressure
let lastBreathTime

// Default confrontation positions
let ObstaclePositions
let OBSTACLE_MAX_SCALE
let OBSTACLE_MAX_POSITION_Y

//Volumes
let OBSTACLE_VOLUMES

/*
    ANGRY:
    1. add hearthbeath: afnemen als boom kleiner wordt
    2. add tree pulse animation: als ie hetzelfde blijft of niet wordt ingedrukt
    3. add shake animation + geluid: bij klappen obstakel en bij obstakel zonder type

    AFRAID:
    2. geluid
    
    GENERAL:
    1. instructions
    2. make animation fluent
*/

const setupObstaclePositions = () => {
    ObstaclePositions = [
        // FRONT
        {
            x: 0,
            y: 1.8,
            z: TREE_CONFRONTATION_Z_INDEX,
        },
        // LEFT
        {
            x: -1.5,
            y: 1.6,
            z: TREE_CONFRONTATION_Z_INDEX + 1,
        },
        // RIGHT
        {
            x: 1.5,
            y: 1.6,
            z: TREE_CONFRONTATION_Z_INDEX + 1,
        },
    ]

    OBSTACLE_MAX_SCALE = { x: 2, y: 2, z: 2 }

    OBSTACLE_VOLUMES = [12, 8, 8]
}

const startConfrontation = (obstacleToConfrontWith, fase = fases.angry) => {
    //Setup chapter
    currentChapter = chapters.confrontation
    currentFase = fase

    //Setup obstacle
    obstacleConfrontationCache.push(obstacleToConfrontWith)

    if (currentFase == fases.afraid) {
        for (i = 1; i < ObstaclePositions.length; i++) {
            obstacleConfrontationCache[i] =
                obstacleToConfrontWith.cloneNode(true)
            addDuplicateObstacle(obstacleConfrontationCache[i])
        }
    }

    //Setup obstacle position
    setupObstaclePositions()
    focusObstacles()

    //Change Environment
    changeEvenvironmentTheme(currentFase)

    //Start Emotion Handling
    setTimeout(() => {
        if (currentFase == fases.angry) handleAnger()
        if (currentFase == fases.afraid) handleFear()
    }, 2300)
}

const addDuplicateObstacle = (obstacle) => {
    obstacle.id = `obstacle-${makeid(5)}`
    treeContainer.appendChild(obstacle)
}

const focusObstacles = () => {
    // Change position
    obstacleConfrontationCache.forEach((obstacle, index) => {
        let focusedPosition = ObstaclePositions[index]
        adjustObstaclePosition(obstacle, focusedPosition, 2300, 0)
    })

    obstacleConfrontationCache.forEach((obstacle) => {
        let foccusedScale = OBSTACLE_MAX_SCALE
        adjustObstacleScale(obstacle, foccusedScale, 2300, 0)
    })

    // Change sound

    obstacleConfrontationCache.forEach((obstacle, index) => {
        let confrontationObstacleType =
            obstacle.getAttribute('data-obstacle-type')

        setTimeout(() => {
            obstacle.setAttribute('sound', {
                src: `#${confrontationObstacleType}-thought-reverb`,
                autoplay: true,
                loop: true,
                volume: OBSTACLE_VOLUMES[index],
            })
        }, 750)
    })
}

//#region Anger

const handleAnger = () => {
    btDataMessageHandlers.push(changeObstacleSizeOnStress)

    const configurationInterval = setInterval(() => {
        bluetooth.send('ANGER?')

        if (
            currentFase != fases.angry ||
            currentChapter != chapters.confrontation
        ) {
            clearInterval(configurationInterval)
            removeBtMessageHandler(changeObstacleSizeOnStress)
        }
    }, 200)
}

const changeObstacleSizeOnStress = (data) => {
    let label = getLabelFromBtMessage(data)
    let value = getDataFromBtMessage(data)
    let shrinkThreshold = 0.8 * stressBallMaxPressure
    let growThreshold = 0.6 * stressBallMaxPressure

    // Data is not from stressball
    if (label != 'ANGER') return

    obstacleConfrontationCache.forEach((obstacle) => {
        let oldScale = obstacle.getAttribute('scale')
        let newScale = oldScale
        let oldPosition = obstacle.getAttribute('position')
        let newPosition = oldPosition

        // User is pressing
        if (value > shrinkThreshold) {
            newScale = {
                x: 0.95 * oldScale.x,
                y: 0.95 * oldScale.y,
                z: 0.95 * oldScale.z,
            }

            newPosition.y = 0.95 * oldPosition.y
        }

        // User is releasing
        if (value < growThreshold && newScale.z < OBSTACLE_MAX_SCALE.z) {
            newScale = {
                x: 1.05 * oldScale.x,
                y: 1.05 * oldScale.y,
                z: 1.05 * oldScale.z,
            }

            newPosition.y = 1.05 * oldPosition.y
        }

        // Apply new scale and position
        adjustObstaclePosition(obstacle, newPosition, 250, 0)
        adjustObstacleScale(obstacle, newScale, 250, 0)

        // Anger destroyed
        if (newScale.z <= 0.5) {
            quitAnger()
        }
    })
}

const quitAnger = () => {
    currentFase = fases.afraid
    mainObstacle = obstacleConfrontationCache[0]
    obstacleConfrontationCache = []
    startConfrontation(mainObstacle, currentFase)
}

//#endregion

//#region Afraid

const breathPositions = Object.freeze({ in: 'in', out: 'out' })
let breathOutThreshold
let breathInThreshold
let oldBreathPosition
let breathStateTime
let breathStateThreshold

const setupBreath = () => {
    breathOutThreshold =
        breathMinPressure == 0
            ? breathMaxPressure * 0.25
            : breathMinPressure * 1.25
    breathInThreshold = 0.75 * breathMaxPressure
    oldBreathPosition = breathPositions.in
    breathStateTime = 0
    breathStateThreshold = 2000
}

const handleFear = () => {
    setupBreath()
    btDataMessageHandlers.push(changeObstacleSizeOnBreath)

    // Set sensor request interval
    const configurationInterval = setInterval(() => {
        bluetooth.send('BREATH?')

        if (
            currentFase != fases.afraid ||
            currentChapter != chapters.confrontation
        ) {
            clearInterval(configurationInterval)
            removeBtMessageHandler(changeObstacleSizeOnBreath)
        }
    }, 250)

    // Make random obstacle visible
    const swapObstacles = setInterval(() => {
        if (currentFase == fases.afraid && currentChapter == chapters.confrontation) {
            for (i = 0; i < obstacleConfrontationCache.length; i++) {
                obstacleConfrontationCache[i].setAttribute('visible', false)
                fadeAudioOut(obstacleConfrontationCache[i], 0, 250)
            }
    
            let obstacleToShow =
                obstacleConfrontationCache[
                    Math.floor(Math.random() * obstacleConfrontationCache.length)
                ]
    
            obstacleToShow.setAttribute('visible', true)
            fadeAudioIn(obstacleToShow, 12, 250);
        } else {
            clearInterval(configurationInterval)
            removeBtMessageHandler(swapObstacles)
        }
    }, 1500)
}

const changeObstacleSizeOnBreath = (data) => {
    let label = getLabelFromBtMessage(data)
    let value = getDataFromBtMessage(data)
    let currentBreathPosition = oldBreathPosition
    let hasUsedBreath = false
    let shouldQuit = false;

    // Data is not from breathsensor
    if (label != 'BREATH') return

    if (value > breathInThreshold) {
        currentBreathPosition = breathPositions.in
    } else if (value < breathOutThreshold) {
        currentBreathPosition = breathPositions.out
    }

    //Update breath length
    if (currentBreathPosition == oldBreathPosition) {
        breathStateTime += 250

        if (breathStateTime > 5000) {
            hasUsedBreath = true
        }
    } else {
        breathStateTime = 0
        oldBreathPosition = currentBreathPosition
    }

    // Update size
    obstacleConfrontationCache.forEach((obstacle) => {
        let oldScale = obstacle.getAttribute('scale')
        let newScale = oldScale
        let oldPosition = obstacle.getAttribute('position')
        let newPostion = oldPosition

        // User breathing in
        if (breathStateTime > breathStateThreshold && !hasUsedBreath) {
            newScale = {
                x: 0.95 * oldScale.x,
                y: 0.95 * oldScale.y,
                z: 0.95 * oldScale.z,
            }

            newPostion.y = 0.95 * oldPosition.y
        }

        // User is holding breath too long
        if (hasUsedBreath) {
            if (newScale.z < OBSTACLE_MAX_SCALE.z) {
                newScale = {
                    x: 1.05 * oldScale.x,
                    y: 1.05 * oldScale.y,
                    z: 1.05 * oldScale.z,
                }

                newPostion.y = 1.05 * oldPosition.y
            }
        }

        // Apply new scale and position
        adjustObstaclePosition(obstacle, newPostion, 250, 0)
        adjustObstacleScale(obstacle, newScale, 250, 0)

        // Fear destroyed
        if (newScale.z <= 0.5) {
            shouldQuit = true
        }
    })

    if (shouldQuit) quitFear();
}

const quitFear = () => {
    currentFase = fases.angry

    console.log(obstacleConfrontationCache)

    handledObstacleType =
        obstacleConfrontationCache[0].getAttribute('data-obstacle-type')

    obstacleConfrontationCache.forEach((obstacle) => {
        fadeAudioOut(obstacle, 0.0, 2300)
        setTimeout(() => {
            removeTree(obstacle)
        }, 2300)
    })

    obstacleConfrontationCache = []
    
    switchToNextChapter(handledObstacleType)
}

const switchToNextChapter = (handledObstacleType) => {
    const index = obstacleTypesLeft.indexOf(handledObstacleType)
    obstacleTypesLeft.splice(index, 1)
    changeEvenvironmentTheme('normal')

    //future: goto transquility

    if (obstacleTypesLeft.length > 0) {
        currentChapter = chapters.running
        runningTime = 0
        intervalLength = 2000
        addTreesRandomlyLoop()
    } else {
        gameOver()
        showStartMenu()
    }
}

//#endregion

//#region obstacle modification

const adjustObstacleScale = (obstacle, scale, duration, delay) => {
    let oldScale = obstacle.getAttribute('scale')

    obstacle.setAttribute(`animation__size`, {
        property: 'scale',
        from: { x: oldScale.x, y: oldScale.y, z: oldScale.z },
        to: { x: scale.x, y: scale.y, z: scale.z },
        dur: duration,
        easing: 'linear',
        autoplay: true,
        delay: delay,
    })
}

const adjustObstaclePosition = (obstacle, position, duration, delay) => {
    let oldPosition = obstacle.getAttribute('position')

    obstacle.setAttribute(`animation__position`, {
        property: 'position',
        from: { x: oldPosition.x, y: oldPosition.y, z: oldPosition.z },
        to: { x: position.x, y: position.y, z: position.z },
        dur: duration,
        easing: 'linear',
        autoplay: true,
        delay: delay,
    })
}

//#endregion
