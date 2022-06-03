class Confrontation {
    constructor() {
        // Obstacle
        this.obstacleConfrontationCache = []
        this.ObstaclePositions = [
            // FRONT
            {
                x: 0,
                y: 1.8,
                z: -1,
            },
            // LEFT
            {
                x: -1.5,
                y: 1.6,
                z: -1,
            },
            // RIGHT
            {
                x: 1.5,
                y: 1.6,
                z: -1,
            },
        ]
        this.OBSTACLE_MAX_SCALE = { x: 2, y: 2, z: 2 }
        this.OBSTACLE_VOLUMES = [12, 8, 8]

        this.ANGER_START_POSITION = {
            x: 0,
            y: 1,
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
            this.adjustObstaclePosition(obstacle, this.ANGER_START_POSITION, 1000, 0)
        }

        // Fear position
        if (this.currentFase == this.fases.afraid) {
            this.obstacleConfrontationCache.forEach((obstacle, index) => {
                let focusedPosition = this.ObstaclePositions[index]
                this.adjustObstaclePosition(obstacle, focusedPosition, 1000, 0)
            })

            this.obstacleConfrontationCache.forEach((obstacle, index) => {
                let foccusedScale = this.OBSTACLE_MAX_SCALE
                this.adjustObstacleScale(obstacle, foccusedScale, 1000, 0)
            })
        }

        // Change sound
        this.obstacleConfrontationCache.forEach((obstacle, index) => {
            //let confrontationObstacleType = obstacle.getAttribute('data-obstacle-type')
            // setTimeout(() => {
            //     setTimeout(() => {
            //         obstacle.setAttribute('sound', {
            //             src: `#${confrontationObstacleType}-thought-reverb`,
            //             autoplay: true,
            //             loop: true,
            //             volume: this.OBSTACLE_VOLUMES[index],
            //         })
            //     }, 2000)
            // })
        })
    }

    //#endregion

    //#region Anger

    startAnger() {
        const obstacle = this.obstacleConfrontationCache[0]

        // 1. Build up
        fadeAudioIn(obstacle, 4, 4000)
        obstacle.emit('pulse')

        // 2. Earthquake
        setTimeout(() => {
            environment.earthquake()

            // 3. Grow and storm
            setTimeout(() => {
                fadeAudioIn(obstacle, 6, 3000)
                this.adjustObstacleScale(obstacle, this.ANGER_EXPLODED_SCALE, 1500)
                this.adjustObstaclePosition(obstacle, this.ANGER_EXPLODED_POSITION, 1500)
                environment.changeTheme(environment.Themes.storm)
                environment.changeColor(environment.Colors.redStorm)

                setTimeout(() => {
                    obstacle.setAttribute('animation__pulse', 'from', '1.8 1.8 1.8')
                    obstacle.setAttribute('animation__pulse', 'to', '2 2 2')
                    obstacle.emit('pulse')
                }, 1500);
            }, 400)

            setTimeout(() => {
                this.handleAnger()
            }, 5000)
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
        }, 200)
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
            if (value < growThreshold && newScale.z < this.OBSTACLE_MAX_SCALE.z) {
                newScale = {
                    x: 1.05 * oldScale.x,
                    y: 1.05 * oldScale.y,
                    z: 1.05 * oldScale.z,
                }

                newPosition.y = 1.05 * oldPosition.y
            }

            // Apply new scale and position
            this.adjustObstaclePosition(obstacle, newPosition, 250, 0)
            this.adjustObstacleScale(obstacle, newScale, 250, 0)

            // Anger destroyed
            if (newScale.z <= 0.5) {
                this.quitAnger()
            }
        })
    }

    quitAnger() {
        this.currentFase = this.fases.afraid
        let mainObstacle = this.obstacleConfrontationCache[0]
        this.obstacleConfrontationCache = []
        this.start(mainObstacle, this.currentFase)
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
                    fadeAudioOut(this.obstacleConfrontationCache[i], 0, 250)
                }

                let obstacleToShow =
                    this.obstacleConfrontationCache[
                        Math.floor(Math.random() * this.obstacleConfrontationCache.length)
                    ]

                obstacleToShow.setAttribute('visible', true)
                fadeAudioIn(obstacleToShow, 12, 250)
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
        this.currentFase = this.fases.angry
        let handledObstacleType =
            this.obstacleConfrontationCache[0].getAttribute('data-obstacle-type')

        this.obstacleConfrontationCache.forEach((obstacle) => {
            fadeAudioOut(obstacle, 0.0, 500)
            setTimeout(() => {
                removeObject(obstacle)
            }, 500)
        })

        this.obstacleConfrontationCache = []

        this.switchToNextChapter(handledObstacleType)
    }

    switchToNextChapter(handledObstacleType) {
        const index = obstacleTypesLeft.indexOf(handledObstacleType)
        obstacleTypesLeft.splice(index, 1)
        environment.changeTheme(environment.Themes.normal)

        if (obstacleTypesLeft.length > 0) {
            controls.enable()
            currentChapter = chapters.running
            runningTime = 0
            intervalLength = 2000
            addThoughtsRandomlyLoop()
        } else {
            startRelieve()
        }
    }

    //#endregion

    //#region Modification

    adjustObstaclePosition(obstacle, position, duration, delay) {
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

    adjustObstacleScale = (obstacle, scale, duration, delay) => {
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

    //#endregion
}
