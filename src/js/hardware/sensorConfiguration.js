class SensorConfiguration {
    constructor() {
        this.beltPutOn = false
        this.sensorConfigurationStarted = false

        //Stressbal
        this.isStressballReady = false
        this.isBreathSensorReady = false
        this.stressBallMaxPressure = 0

        //Breath
        this.breathNormalValue = 0
        this.breathMinPressure = []
        this.breathMaxPressure = []
        this.breathConfigureModes = Object.freeze({ max: 'max', min: 'min' })
    }

    //#region Stressball

    configureStressBal() {
        let progress = 0
        btDataMessageHandlers.push(this.changeStressBallMaxPressure.bind(this))

        const configurationInterval = setInterval(() => {
            bluetooth.send('ANGER?')

            if (this.sensorConfigurationStarted) {
                progress += 20
                stressbalProgressFill.style.width = `${progress}%`
            }

            if (progress == 100) {
                setTimeout(() => {
                    clearInterval(configurationInterval)
                    removeBtMessageHandler(
                        this.changeStressBallMaxPressure.bind(this)
                    )
                    this.isStressballReady = true
                    this.sensorConfigurationStarted = false
                    showBluetoothMenu()
                    console.log(
                        `Max anger value: ${this.stressBallMaxPressure}`
                    )
                }, 250)
            }
        }, 1000)
    }

    changeStressBallMaxPressure(data) {
        const label = getLabelFromBtMessage(data)
        const value = getDataFromBtMessage(data)

        if (label == 'ANGER' && value > this.stressBallMaxPressure) {
            this.stressBallMaxPressure = value
        }

        if (value > 750) {
            this.sensorConfigurationStarted = true
        }
    }

    //#endregion

    //#region Breath

    changeBreathNormalValue(data) {
        const label = getLabelFromBtMessage(data)
        const value = getDataFromBtMessage(data)

        if (label != 'BREATH') return

        this.breathNormalValue = value
        this.beltPutOn = true
        console.log(`Breath normal value: ${this.breathNormalValue}`)
        showBluetoothMenu()
    }

    configureBreath(mode = this.breathConfigureModes.max) {
        let maxBreathPressureProgress = 0
        let minBreathPressureProgress = 0

        if (mode == this.breathConfigureModes.max) {
            btDataMessageHandlers.push(this.changeBreathMaxValue.bind(this))
            changeBreathSectionInstruction('max')
            breathProgressFill.style.width = 0

            const configurationInterval = setInterval(() => {
                bluetooth.send('BREATH?')

                if (this.sensorConfigurationStarted) {
                    maxBreathPressureProgress += 20
                    breathProgressFill.style.width = `${maxBreathPressureProgress}%`
                }

                if (maxBreathPressureProgress == 100) {
                    setTimeout(() => {
                        clearInterval(configurationInterval)

                        this.breathMaxPressure = parseInt(
                            calculateAverageFromArray(this.breathMaxPressure)
                        )

                        removeBtMessageHandler(
                            this.changeBreathMaxValue.bind(this)
                        )
                        this.sensorConfigurationStarted = false
                        console.log(
                            `Max breath pressure: ${this.breathMaxPressure}`
                        )
                        
                        this.configureBreath(this.breathConfigureModes.min)
                    }, 250)
                }
            }, 1000)
        } else if (mode == this.breathConfigureModes.min) {
            btDataMessageHandlers.push(this.changeBreathMinValue.bind(this))
            changeBreathSectionInstruction('min')
            breathProgressFill.style.width = 0

            const configurationInterval = setInterval(() => {
                bluetooth.send('BREATH?')

                if (this.sensorConfigurationStarted) {
                    minBreathPressureProgress += 20
                    breathProgressFill.style.width = `${minBreathPressureProgress}%`
                }

                if (minBreathPressureProgress == 100) {
                    setTimeout(() => {
                        clearInterval(configurationInterval)

                        this.breathMinPressure = parseInt(
                            calculateAverageFromArray(this.breathMinPressure)
                        )

                        removeBtMessageHandler(
                            this.changeBreathMinValue.bind(this)
                        )
                        this.sensorConfigurationStarted = false
                        console.log(
                            `Min breath pressure: ${this.breathMinPressure}`
                        )
                        
                        this.quitBreathConfiguration()
                    }, 250)
                }
            }, 1000)
        }
    }

    changeBreathMaxValue(data) {
        const label = getLabelFromBtMessage(data)
        const value = getDataFromBtMessage(data)

        console.log(data)

        if (label != 'BREATH') return

        if (value > this.breathNormalValue * 1.2) {
            this.sensorConfigurationStarted = true
            this.breathMaxPressure.push(value)
        } else {
            this.sensorConfigurationStarted = false
        }
    }

    changeBreathMinValue(data) {
        const label = getLabelFromBtMessage(data)
        const value = getDataFromBtMessage(data)

        if (label != 'BREATH') return

        if (value <= this.breathNormalValue) {
            this.sensorConfigurationStarted = true
            this.breathMinPressure.push(value)
        } else {
            this.sensorConfigurationStarted = false
        }
    }

    quitBreathConfiguration() {
        this.isBreathSensorReady = true
        console.log(`Breath delta: ${this.breathMaxPressure - this.breathMinPressure}`)
        showBluetoothMenu()
        return
    }

    //#endregion
}
