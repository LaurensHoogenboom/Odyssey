// Stresbal

let isStressballReady = false
let isBreathSensorReady = false
let sensorConfigurationStarted = false
let stressBallMaxPressure = 0
let breathMinPressure = 0
let breathMaxPressure = 0

const configureStressBal = () => {
    let progress = 0
    btDataMessageHandlers.push(changeStressBalMaxPressure)

    const configurationInterval = setInterval(() => {
        bluetooth.send('ANGER?')

        if (sensorConfigurationStarted) {
            progress += 20
            stressbalProgressFill.style.width = `${progress}%`
        }

        if (progress == 100) {
            setTimeout(() => {
                removeBtMessageHandler(changeStressBalMaxPressure)
                isStressballReady = true
                sensorConfigurationStarted = false
                showBluetoothMenu()
                console.log(`Max anger value: ${stressBallMaxPressure}`)
                clearInterval(configurationInterval)
            }, 500)
        }
    }, 1000)
}

const changeStressBalMaxPressure = (data) => {
    const label = getLabelFromBtMessage(data)
    const value = getDataFromBtMessage(data)

    if (label == 'ANGER' && value > stressBallMaxPressure) {
        stressBallMaxPressure = value
    }

    if (value > 900) {
        sensorConfigurationStarted = true
    }
}

// Breath

let maxBreathPressureProgress = 0
let minBreathPressureProgress = 0

const configureBreath = () => {
    if (maxBreathPressureProgress == 0) {
        btDataMessageHandlers.push(changeBreathMaxValue)
        changeBreathSectionInstruction('max')
        breathProgressFill.style.width = 0

        const configurationInterval = setInterval(() => {
            bluetooth.send('BREATH?')
    
            if (sensorConfigurationStarted) {
                maxBreathPressureProgress += 20
                breathProgressFill.style.width = `${maxBreathPressureProgress}%`
            }
    
            if (maxBreathPressureProgress == 100) {
                setTimeout(() => {
                    removeBtMessageHandler(changeBreathMaxValue)
                    sensorConfigurationStarted = false
                    console.log(`Max breath pressure: ${breathMaxPressure}`)
                    clearInterval(configurationInterval)
                    configureBreath();
                }, 500)
            }
        }, 1000)

        
    } else if (minBreathPressureProgress == 0) {
        btDataMessageHandlers.push(changeBreathMinValue)
        changeBreathSectionInstruction('min')
        breathProgressFill.style.width = 0

        const configurationInterval = setInterval(() => {
            bluetooth.send('BREATH?')
    
            if (sensorConfigurationStarted) {
                minBreathPressureProgress += 20
                breathProgressFill.style.width = `${minBreathPressureProgress}%`
            }
    
            if (minBreathPressureProgress == 100) {
                setTimeout(() => {
                    removeBtMessageHandler(changeBreathMinValue)
                    sensorConfigurationStarted = false
                    console.log(`Min breath pressure: ${breathMinPressure}`)
                    clearInterval(configurationInterval)
                    configureBreath();
                }, 500)
            }
        }, 1000)
    } else {
        isBreathSensorReady = true
        showBluetoothMenu()
        return
    }
}

const changeBreathMaxValue = (data) => {
    const label = getLabelFromBtMessage(data)
    const value = getDataFromBtMessage(data)

    if (label == 'BREATH' && value > breathMaxPressure) {
        breathMaxPressure = value;
    }

    if (value > 700) {
        sensorConfigurationStarted = true
    }
}

const changeBreathMinValue = (data) => {
    const label = getLabelFromBtMessage(data)
    const value = getDataFromBtMessage(data)

    if (label == 'BREATH' && value < breathMinPressure) {
        breathMaxPressure = value;
    }

    if (value < 500) {
        sensorConfigurationStarted = true
    }
}
