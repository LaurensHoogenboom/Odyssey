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
        this.SUNRISE_COLORS = [
            '#202D46',
            '#454644',
            '#907F66',
            '#C89459',
            '#DCC391',
            '#D3DFCB',
            '#CAE0DA',
            '#a3d0ed',
        ]
        this.SUNRISE_POSITIONS = [
            { x: 0, y: -3, z: -10 },
            { x: 0, y: -3, z: -10 },
            { x: 0, y: -1.7, z: -10 },
            { x: 0, y: -0.5, z: -10 },
            { x: 0, y: 1.7, z: -10 },
            { x: 0, y: 4.8, z: -10 },
            { x: 0, y: 7.6, z: -10 },
            { x: 0, y: 12, z: -10 },
        ]
        this.SUNRISE_SCALES = [
            { x: 1, y: 1, z: 1 },
            { x: 1, y: 1, z: 1 },
            { x: 1, y: 1, z: 1 },
            { x: 1.5, y: 1.5, z: 1.5 },
            { x: 2.0, y: 2.0, z: 2.0 },
            { x: 2.5, y: 2.5, z: 2.5 },
            { x: 3, y: 3, z: 3 },
            { x: 3.5, y: 3.5, z: 3.5 },
        ]
        this.sun = document.getElementById('sun')
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
                console.log(offlineTimer)

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
            this.changeSunPosition(this.currentSunriseIndex)
            this.changeSunScale(this.currentSunriseIndex)
            this.changeSunLight(this.currentSunriseIndex)
            progress.set(this.currentSunriseIndex)
        }

        if (this.currentSunriseIndex >= this.SUNRISE_COLORS.length - 1) {
            this.quitRelieve()
        }
    }

    changeSunPosition(index, sun = this.sun) {
        let oldPosition = this.SUNRISE_POSITIONS[index - 1]
        let newPosition = this.SUNRISE_POSITIONS[index]

        sun.setAttribute(
            'animation__position',
            'from',
            `${oldPosition.x} ${oldPosition.y} ${oldPosition.z}`
        )
        sun.setAttribute(
            'animation__position',
            'to',
            `${newPosition.x} ${newPosition.y} ${newPosition.z}`
        )
        sun.emit('move')
    }

    changeSunScale(index, sun = this.sun) {
        let oldScale = this.SUNRISE_SCALES[index - 1]
        let newScale = this.SUNRISE_SCALES[index]

        sun.setAttribute('animation__scale', 'from', `${oldScale.x} ${oldScale.y} ${oldScale.z}`)
        sun.setAttribute('animation__scale', 'to', `${newScale.x} ${newScale.y} ${newScale.z}`)
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

    quitRelieve() {
        this.sun.emit('hide')
        this.currentSunriseIndex = 0
        progress.stop()
        gameOver()

        setTimeout(() => {
            environment.changeDirectionalLightPosition(environment.DIRECTIONAL_LIGHT_DEFAULT_POSITION)
            
            setTimeout(() => {
                showStartMenu()
            }, 3000);
        }, 2000)
    }

    startDemo = () => {
        hideAllMenus()
        environment.changeTheme(environment.THEMES.storm)
        environment.startRain()
        this.currentSunriseIndex = 0
        this.changeSunPosition(1)
        setTimeout(this.start.bind(this), 2000)
    }
}
