class Relieve {
    constructor() {
        //#region General
        this.currentSunriseIndex = 0
        this.relieveBreathState = new BreathState(
            sensorConfiguration.breathMinPressure,
            sensorConfiguration.breathMaxPressure,
            500,
            1000,
            500
        )
        //#endregion

        //#region Sunrise

        this.sun = document.getElementById('sun')
        this.SUNRISE_COLORS = Object.freeze([
            '#202D46',
            '#454644',
            '#907F66',
            '#C89459',
            '#DCC391',
            '#D3DFCB',
            '#CAE0DA',
            '#a3d0ed',
        ])
        this.SUNRISE_POSITIONS = Object.freeze([
            { x: 0, y: -3, z: -10 },
            { x: 0, y: -3, z: -10 },
            { x: 0, y: -1.7, z: -10 },
            { x: 0, y: -0.5, z: -10 },
            { x: 0, y: 1.7, z: -10 },
            { x: 0, y: 4.8, z: -10 },
            { x: 0, y: 7.6, z: -10 },
            { x: 0, y: 12, z: -10 },
        ])
        this.SUNRISE_SCALES = Object.freeze([
            { x: 1, y: 1, z: 1 },
            { x: 1, y: 1, z: 1 },
            { x: 1, y: 1, z: 1 },
            { x: 1.5, y: 1.5, z: 1.5 },
            { x: 2.0, y: 2.0, z: 2.0 },
            { x: 2.5, y: 2.5, z: 2.5 },
            { x: 3, y: 3, z: 3 },
            { x: 3.5, y: 3.5, z: 3.5 },
        ])

        //#endregion

        //#region Seagull

        this.seagull = document.getElementById('seagull')
        this.SEAGULL_POSITIONS = Object.freeze([
            { x: -4.7, y: 2.6, z: 2.6 },
            { x: -0.7, y: 2.3, z: 0.3 },
            { x: 1.7, y: 2.3, z: -4.2 },
            { x: -0.2, y: 3, z: -4.1 },
            { x: -0.1, y: 4.9, z: -9.5 },
            { x: 0, y: 8, z: -17 },
        ])
        this.SEAGULL_ROTATIONS = Object.freeze([
            { x: -20, y: -122, z: 15.1 },
            { x: -0.7, y: -110, z: -7 },
            { x: -7.9, y: -90, z: -13.6 },
            { x: -8.1, y: -76, z: -29.9 },
            { x: -3, y: -85, z: -20 },
            { x: -0, y: -90, z: -20 },
        ])

        //#endregion
    }

    start() {
        // General
        currentChapter = chapters.relieve
        this.sun.emit('show')

        // Calming ocean & stop rain
        environment.changeTheme(environment.THEMES.sunrise)
        environment.stopRain()

        // Start sunrise handling
        setTimeout(this.handleSunrise.bind(this), 2000)
    }

    handleSunrise() {
        let offlineTimer = 0
        btDataMessageHandlers.push(this.changeSunriseOnBreath.bind(this))
        progress.start(
            0,
            this.SUNRISE_POSITIONS.length,
            this.currentSunriseIndex,
            'Haal diep en langzaam adem.'
        )

        setTimeout(() => {
            //Set sensor request interval
            const breathInterval = setInterval(() => {
                if (bluetooth.connected) {
                    bluetooth.send('BREATH?')
                    offlineTimer = 0
                } else {
                    offlineTimer += 500

                    if (offlineTimer > 3000) {
                        const handleOfflineBreath = this.changeSunriseOnBreath.bind(this)
                        handleOfflineBreath('BREATH: ', true)
                        offlineTimer = 0
                    }
                }

                if (currentChapter != chapters.relieve) {
                    clearInterval(breathInterval)
                    removeBtMessageHandler(this.changeSunriseOnBreath.bind(this))
                }
            }, 500)
        }, 1000)
    }

    changeSunriseOnBreath(data, noData = false) {
        let label = getLabelFromBtMessage(data)
        let value = getDataFromBtMessage(data)

        // Data is not from breathsensor
        if (label != 'BREATH') return

        // Update breath state
        this.relieveBreathState.currentBreathPosition = !noData
            ? value
            : this.relieveBreathState.oldBreathValue

        // Update sunrise
        if (
            (!this.relieveBreathState.hasUsedBreath &&
                this.relieveBreathState.breathIsDeep &&
                this.relieveBreathState.currentBreathPosition ==
                    this.relieveBreathState.breathPositions.in) ||
            noData
        ) {
            this.currentSunriseIndex++
            let newColor = this.SUNRISE_COLORS[this.currentSunriseIndex]
            environment.changeColor(newColor)
            this.changeSun(this.currentSunriseIndex)
            this.changeSeagull(this.currentSunriseIndex)
            progress.set(this.currentSunriseIndex)
        }

        if (this.currentSunriseIndex >= this.SUNRISE_COLORS.length - 1) {
            this.quitRelieve()
        }
    }

    //#region Sun

    changeSun(index) {
        const oldPosition = this.SUNRISE_POSITIONS[index - 1]
        const newPosition = this.SUNRISE_POSITIONS[index]
        this.changeSunPosition(oldPosition, newPosition)

        const oldScale = this.SUNRISE_SCALES[index - 1]
        const newScale = this.SUNRISE_SCALES[index]
        this.changeSunScale(oldScale, newScale)

        this.changeSunLight(index)
    }

    changeSunPosition(oldPosition, newPosition, sun = this.sun) {
        sun.setAttribute('animation__position', 'from', vect3ToString(oldPosition))
        sun.setAttribute('animation__position', 'to', vect3ToString(newPosition))
        sun.emit('move')
    }

    changeSunScale(oldScale, newScale, sun = this.sun) {
        sun.setAttribute('animation__scale', 'from', vect3ToString(oldScale))
        sun.setAttribute('animation__scale', 'to', vect3ToString(newScale))
        sun.emit('grow')
    }

    changeSunLight(index) {
        let newLightPosition = environment.DIRECTIONAL_LIGHT_HIDDEN
        newLightPosition.y = this.SUNRISE_POSITIONS[index].y + 1
        environment.changeDirectionalLightPosition(newLightPosition)

        let newColorRGB = hexToRgb(this.SUNRISE_COLORS[index > 0 ? index - 1 : index])
        let newColorString = `rgb(${newColorRGB.r}, ${newColorRGB.g}, ${newColorRGB.b})`
        environment.changeDirectionalLightColor(newColorString)
    }

    //#endregion

    //#region Seagull

    changeSeagull(index) {
        console.log(index - 2)

        if (index > 1) {
            this.showSeagull()

            const oldPosition = this.SEAGULL_POSITIONS[index - 3]
            const newPosition = this.SEAGULL_POSITIONS[index - 2]
            this.changeSeagullPosition(oldPosition, newPosition)

            const oldRotation = this.SEAGULL_ROTATIONS[index - 3]
            const newRotation = this.SEAGULL_ROTATIONS[index - 2]
            this.changeSeagullRotation(oldRotation, newRotation)
        } else this.hideSeagull()
    }

    changeSeagullPosition(oldPosition, newPosition) {
        this.seagull.setAttribute('animation__position', 'to', vect3ToString(newPosition))
        this.seagull.setAttribute('animation__position', 'from', vect3ToString(oldPosition))
        this.seagull.emit('position')
    }

    changeSeagullRotation(oldRotation, newRotation) {
        this.seagull.setAttribute('animation__rotation', 'to', vect3ToString(newRotation))
        this.seagull.setAttribute('animation__rotation', 'from', vect3ToString(oldRotation))
        this.seagull.emit('rotation')
    }

    showSeagull() {
        this.seagull.setAttribute('visible', true)
    }

    hideSeagull() {
        this.seagull.setAttribute('visible', false)
    }

    //#endregion

    quitRelieve() {
        this.sun.emit('hide')
        this.currentSunriseIndex = 0
        progress.stop()
        gameOver()

        setTimeout(() => {
            this.hideSeagull()

            environment.changeDirectionalLightPosition(environment.DIRECTIONAL_LIGHT_DEFAULT_POSITION)
            setTimeout(() => {
                showStartMenu()
            }, 2500)
        }, 2000)
    }

    startDemo = () => {
        hideAllMenus()
        environment.changeTheme(environment.THEMES.storm)
        environment.startRain()
        this.currentSunriseIndex = 0
        this.changeSunPosition(this.SUNRISE_POSITIONS[0], this.SUNRISE_POSITIONS[1])
        this.changeSeagullPosition(this.SEAGULL_POSITIONS[0], this.SEAGULL_POSITIONS[0])
        setTimeout(this.start.bind(this), 2000)
    }
}
