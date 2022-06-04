class Confrontation {
    constructor() {
        //#region Anger Constants
        this.currentAngerStep = 0

        this.ANGER_START_POSITION = {
            x: 0,
            y: 0.7,
            z: 0.5,
        }
        this.ANGER_EXPLODED_POSITION = {
            x: 0,
            y: 1.3,
            z: -2,
        }
        this.ANGER_EXPLODED_SCALE = {
            x: 1.8,
            y: 1.8,
            z: 1.8,
        }
        this.ANGER_SCALE_STEPS = [
            { x: 1.3, y: 1.3, z: 1.3 },
            { x: 0.9, y: 0.9, z: 0.9 },
            { x: 0.6, y: 0.6, z: 0.6 },
        ]

        //#endregion

        //#region Fear Constants

        this.obstacleConfrontationCache = []
        this.ObstaclePositions = [
            // FRONT
            {
                x: 0,
                y: 1.5,
                z: -1,
            },
            // LEFT
            {
                x: -2,
                y: 1.5,
                z: 0.5,
            },
            // RIGHT
            {
                x: 2,
                y: 1.5,
                z: 0.5,
            },
        ]
        this.OBSTACLE_MAX_SCALE = { x: 1.8, y: 1.8, z: 1.8 }
        this.OBSTACLE_VOLUMES = [12, 8, 8]

        //#endregion

        // Fases
        this.fases = Object.freeze({ angry: 'angry', afraid: 'afraid' })
        this.currentFase = this.fases.angry

        // Breath
        this.fearBreathState = new BreathState(
            sensorConfiguration.breathMinPressure,
            sensorConfiguration.breathMaxPressure,
            2000,
            1000,
            250
        )
    }

    //#region Start

    start(obstacleToConfrontWith, fase = this.fases.angry) {
        // Global stuff
        this.currentFase = fase
        currentChapter = chapters.confrontation
        controls.disable()
        round++;

        // Setup obstacle(s)
        this.obstacleConfrontationCache.push(obstacleToConfrontWith)

        if (this.currentFase == this.fases.afraid) {
            for (i = 1; i < this.ObstaclePositions.length; i++) {
                this.obstacleConfrontationCache[i] = obstacleToConfrontWith.cloneNode(true)
                this.addDuplicateObstacle(this.obstacleConfrontationCache[i])
            }
        }

        this.focusObstacles()

        // Change environment
        if (this.currentFase == this.fases.angry) {
            environment.changeColor(environment.Colors.blueStorm, 2000)
        } else {
            environment.changeTheme(environment.Themes.scaryStorm)
        }

        // Start Emotion Handling
        setTimeout(() => {
            if (this.currentFase == this.fases.angry) this.startAnger()
            if (this.currentFase == this.fases.afraid) this.handleFear()
        }, 1000)
    }

    addDuplicateObstacle(obstacle) {
        obstacle.id = `obstacle-${makeid(5)}`
        thoughtContainer.appendChild(obstacle)
        toggleEmotiveThought(obstacle)
    }

    focusObstacles() {
        // Anger position
        if (this.currentFase == this.fases.angry) {
            const obstacle = this.obstacleConfrontationCache[0]
            this.adjustObstaclePosition(obstacle, this.ANGER_START_POSITION, 2000, 0)
        }

        // Fear position
        if (this.currentFase == this.fases.afraid) {
            this.obstacleConfrontationCache.forEach((obstacle, index) => {
                let focusedPosition = this.ObstaclePositions[index]
                this.adjustObstaclePosition(obstacle, focusedPosition, 2000, 0)
            })

            this.obstacleConfrontationCache.forEach((obstacle, index) => {
                let foccusedScale = this.OBSTACLE_MAX_SCALE
                this.adjustObstacleScale(obstacle, foccusedScale, 2000, 0)
            })
        }
    }

    //#endregion

    //#region Anger

    startAnger() {
        const obstacle = this.obstacleConfrontationCache[0]

        // 1. Build up
        fadeAudioIn(obstacle, 6, 4000)
        obstacle.emit('pulse')

        // 2. Explode
        setTimeout(() => {
            environment.earthquake()
            environment.startThunder()

            // 3. Grow and storm
            setTimeout(() => {
                fadeAudioIn(obstacle, 8, 3000)

                this.adjustObstacleScale(obstacle, this.ANGER_EXPLODED_SCALE, 1500)
                this.adjustObstaclePosition(obstacle, this.ANGER_EXPLODED_POSITION, 1500)
                environment.changeTheme(environment.Themes.storm, environment.Colors.redStorm)

                setTimeout(() => {
                    obstacle.setAttribute('animation__pulse', 'from', '1.8 1.8 1.8')
                    obstacle.setAttribute('animation__pulse', 'to', '2.2 2.2 2.2')
                    obstacle.setAttribute('animation__pulse', 'dur', 250)
                    obstacle.emit('pulse')
                }, 1500)
            }, 400)

            setTimeout(() => {
                this.handleAnger()
            }, 3000)
        }, 4000)
    }

    handleAnger() {
        btDataMessageHandlers.push(this.changeObstacleSizeOnStress.bind(this))

        setInstruction('Knijp zo hard mogelijk.')

        setTimeout(() => {
            hideInstruction()
        }, 7500)

        const configurationInterval = setInterval(() => {
            bluetooth.send('ANGER?')

            if (this.currentFase != this.fases.angry || currentChapter != chapters.confrontation) {
                clearInterval(configurationInterval)
                removeBtMessageHandler(this.changeObstacleSizeOnStress.bind(this))
            }
        }, 500)
    }

    changeObstacleSizeOnStress(
        data,
        stressBallMaxPressure = sensorConfiguration.stressBallMaxPressure
    ) {
        let label = getLabelFromBtMessage(data)
        let value = getDataFromBtMessage(data)
        let shrinkThreshold = 0.8 * stressBallMaxPressure
        let growThreshold = 0.6 * stressBallMaxPressure

        // Data is not from stressball
        if (label != 'ANGER') return

        this.obstacleConfrontationCache.forEach((obstacle) => {
            const oldScale = obstacle.getAttribute('scale')
            const oldPosition = obstacle.getAttribute('position')

            // User is pressing
            if (value > shrinkThreshold) {
                const from = `${oldScale.x} ${oldScale.y} ${oldScale.z}`
                const to = `${oldScale.x * 0.7} ${oldScale.y * 0.7} ${oldScale.z * 0.7}`
                const newPosition = { x: oldPosition.x, y: oldPosition.y * 0.97, z: oldPosition.z }

                obstacle.setAttribute('animation__pulse', 'from', from)
                obstacle.setAttribute('animation__pulse', 'to', to)
                obstacle.emit('pulse')
                this.adjustObstaclePosition(obstacle, newPosition, 250, 0)
            }

            // User is releasing
            if (
                value < growThreshold &&
                oldScale.z < this.ANGER_SCALE_STEPS[this.currentAngerStep].z
            ) {
                const from = `${oldScale.x} ${oldScale.y} ${oldScale.z}`
                const to = `${oldScale.x * 1.15} ${oldScale.y * 1.15} ${oldScale.z * 1.15}`
                const newPosition = { x: oldPosition.x, y: oldPosition.y * 1.1, z: oldPosition.z }

                obstacle.setAttribute('animation__pulse', 'from', from)
                obstacle.setAttribute('animation__pulse', 'to', to)
                obstacle.emit('pulse')
                this.adjustObstaclePosition(obstacle, newPosition, 250, 0)
            }

            // Toggle step or quit
            if (oldScale.z <= 0.5) {
                this.quitAnger()
            } else if (
                this.currentAngerStep < this.ANGER_SCALE_STEPS.length - 1 &&
                oldScale.z < this.ANGER_SCALE_STEPS[this.currentAngerStep].z
            ) {
                this.currentAngerStep++
                environment.earthquake()
            }
        })
    }

    quitAnger() {
        // Set fase
        this.currentFase = this.fases.afraid
        const mainObstacle = this.obstacleConfrontationCache[0]
        this.obstacleConfrontationCache = []
        this.currentAngerStep = 0

        // Set position
        const oldPosition = mainObstacle.getAttribute('position')
        const newPosition = { x: oldPosition.x, y: -3, z: oldPosition.z }
        this.adjustObstaclePosition(mainObstacle, newPosition, 250, 0)

        

        // Adjust environment
        environment.earthquake()
        environment.stopThunder()

        if (round > 1) {
            setTimeout(() => {
                environment.changeTheme(environment.Themes.storm, environment.Colors.blueStorm)
                environment.startRain(environment.Colors.blueRain)
    
                setTimeout(() => {
                    this.start(mainObstacle, this.currentFase)
                }, 15000)
            }, 250)
        } else {
            this.switchToNextChapter()
            removeObject(mainObstacle)
        }
    }

    //#endregion

    //#region Fear

    handleFear(
        breathMinPressure = sensorConfiguration.breathMinPressure,
        breathMaxPressure = sensorConfiguration.breathMaxPressure
    ) {
        this.fearBreathState = new BreathState(
            breathMinPressure,
            breathMaxPressure,
            2000,
            1000,
            250
        )
        btDataMessageHandlers.push(this.changeObstacleSizeOnBreath.bind(this))
        setInstruction('Haal diep en langzaam adem.')

        setTimeout(() => {
            hideInstruction()
        }, 5000)

        const configurationInterval = setInterval(() => {
            bluetooth.send('BREATH?')

            if (this.currentFase != this.fases.afraid || currentChapter != chapters.confrontation) {
                clearInterval(configurationInterval)
                removeBtMessageHandler(this.changeObstacleSizeOnBreath.bind(this))
            }
        }, 250)

        const swapObstacles = setInterval(() => {
            if (this.currentFase == this.fases.afraid && currentChapter == chapters.confrontation) {
                for (i = 0; i < this.obstacleConfrontationCache.length; i++) {
                    this.obstacleConfrontationCache[i].setAttribute('visible', false)
                    fadeAudioOut(this.obstacleConfrontationCache[i], 4, 250)
                }

                let obstacleToShow =
                    this.obstacleConfrontationCache[
                        Math.floor(Math.random() * this.obstacleConfrontationCache.length)
                    ]

                obstacleToShow.setAttribute('visible', true)
                fadeAudioIn(obstacleToShow, 8, 250)
            } else {
                clearInterval(swapObstacles)
            }
        }, 1500)
    }

    changeObstacleSizeOnBreath(data) {
        let label = getLabelFromBtMessage(data)
        let value = getDataFromBtMessage(data)
        let shouldQuit = false

        // Data is not from breathsensor
        if (label != 'BREATH') return

        // Update breathstate
        this.fearBreathState.currentBreathPosition = value

        // Update size
        this.obstacleConfrontationCache.forEach((obstacle) => {
            let oldScale = obstacle.getAttribute('scale')
            let newScale = oldScale
            let oldPosition = obstacle.getAttribute('position')
            let newPostion = oldPosition

            // User breathing in
            if (this.fearBreathState.breathIsDeep && !this.fearBreathState.hasUsedBreath) {
                newScale = {
                    x: 0.95 * oldScale.x,
                    y: 0.95 * oldScale.y,
                    z: 0.95 * oldScale.z,
                }

                newPostion.y = 0.95 * oldPosition.y
            }

            // User is holding breath too long
            if (this.fearBreathState.breathStateTime > 10000) {
                if (newScale.z < this.OBSTACLE_MAX_SCALE.z) {
                    newScale = {
                        x: 1.05 * oldScale.x,
                        y: 1.05 * oldScale.y,
                        z: 1.05 * oldScale.z,
                    }

                    newPostion.y = 1.05 * oldPosition.y
                }
            }

            // Apply new scale and position
            this.adjustObstaclePosition(obstacle, newPostion, 250, 0)
            this.adjustObstacleScale(obstacle, newScale, 250, 0)

            // Fear destroyed
            if (newScale.z <= 0.5) {
                shouldQuit = true
            }
        })

        if (shouldQuit) this.quitFear()
    }

    quitFear() {
        environment.stopRain(environment.Colors.blueDay);

        this.obstacleConfrontationCache.forEach((obstacle) => {
            removeObject(obstacle)
        })
        this.obstacleConfrontationCache = []

        this.currentFase = this.fases.angry
        this.switchToNextChapter()
    }

    switchToNextChapter() {
        environment.changeTheme(environment.Themes.normal)

        if (round > 2) {
            startRelieve();
        } else {
            controls.enable()
            currentChapter = chapters.running
            runningTime = 0
            intervalLength = 2000
            addThoughtsRandomlyLoop()
        }
    }

    //#endregion

    //#region Modification

    adjustObstaclePosition(obstacle, position, duration, delay) {
        const oldPosition = obstacle.getAttribute('position')

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

    adjustObstacleScale = (obstacle, scale, duration, delay) => {
        const oldScale = obstacle.getAttribute('scale')

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

    //#endregion
}
