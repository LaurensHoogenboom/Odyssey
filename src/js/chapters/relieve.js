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
        this.sunriseColors = [
            '#202D46',
            '#454644',
            '#907F66',
            '#C89459',
            '#DCC391',
            '#CFD1C0',
            '#D7DCDB',
            '#a3d0ed',
        ]
        this.sunrisePositions = [
            { x: 0, y: -3, z: -10 },
            { x: 0, y: -3, z: -10 },
            { x: 0, y: -1.7, z: -10 },
            { x: 0, y: -0.5, z: -10 },
            { x: 0, y: 1.7, z: -10 },
            { x: 0, y: 4.8, z: -10 },
            { x: 0, y: 7.6, z: -10 },
            { x: 0, y: 12, z: -10 },
        ]
        this.sunriseScales = [
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
        environment.changeTheme(environment.Themes.sunrise)
        this.sun.emit('show')

        // Start sunrise handling
        setTimeout(() => {
            this.handleSunrise()
        }, 2000)
    }

    handleSunrise() {
        btDataMessageHandlers.push(this.changeSunriseOnBreath.bind(this))
        progress.start(0, this.sunrisePositions.length, this.currentSunriseIndex, 'Haal diep en langzaam adem.')

        setTimeout(() => {
            //Set sensor request interval
            const breathInterval = setInterval(() => {
                if (bluetooth.connected) bluetooth.send('BREATH?')
                else setTimeout(this.changeSunriseOnBreath.bind(this, 'BREATH: ', true), 2000)

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
                this.relieveBreathState.currentBreathPosition == this.relieveBreathState.breathPositions.in) ||
            noData
        ) {
            this.currentSunriseIndex++
            let newColor = this.sunriseColors[this.currentSunriseIndex]
            environment.changeColor(newColor)
            this.changeSunPosition(this.currentSunriseIndex)
            this.changeSunScale(this.currentSunriseIndex)
            progress.set(this.currentSunriseIndex)
        }

        if (this.currentSunriseIndex >= this.sunriseColors.length - 1) {
            this.quitRelieve()
        }
    }

    changeSunPosition(index, sun = this.sun) {
        let oldPosition = this.sunrisePositions[index - 1]
        let newPosition = this.sunrisePositions[index]
    
        sun.setAttribute('animation__position', 'from', `${oldPosition.x} ${oldPosition.y} ${oldPosition.z}`)
        sun.setAttribute('animation__position', 'to', `${newPosition.x} ${newPosition.y} ${newPosition.z}`)
        sun.emit('move')
    }

    changeSunScale(index, sun = this.sun) {
        let oldScale = this.sunriseScales[index - 1]
        let newScale = this.sunriseScales[index]
    
        sun.setAttribute('animation__scale', 'from', `${oldScale.x} ${oldScale.y} ${oldScale.z}`)
        sun.setAttribute('animation__scale', 'to', `${newScale.x} ${newScale.y} ${newScale.z}`)
        sun.emit('grow')
    }

    quitRelieve() {
        this.sun.emit('hide')
        this.currentSunriseIndex = 0
        progress.stop()
        gameOver()
        showStartMenu()
    }

    startDemo = () => {
        hideAllMenus()
        this.currentSunriseIndex = 0
        this.start()
    }
}








