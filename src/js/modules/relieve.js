/*
    ==============
    Relieve Module
    ==============
*/

/*
    TODO:
    1. move directional light to center
    2. sun on movement
    3. bird sounds
    4. music
    5. white out -> transition to homescreen
*/

const relieveFases = Object.freeze({ sunrise: 'sunrise', birds: 'birds' })
let currentRelieveFase
let currentSunriseIndex = 0
let sunriseColors = [
    '#202D46',
    '#454644',
    '#907F66',
    '#C89459',
    '#DCC391',
    '#CFD1C0',
    '#D7DCDB',
]
let relieveBreathState

const startRelieve = (fase = relieveFases.sunrise) => {
    // Setup chapter
    currentChapter = chapters.relieve
    currentRelieveFase = fase

    // Setup breath
    relieveBreathState = new BreathState(
        breathMinPressure,
        breathMaxPressure,
        3000,
        3250
    )

    // Change environment
    changeEvenvironmentTheme(relieveFases.sunrise)

    // Start emotion handling
    setTimeout(() => {
        if (currentRelieveFase == relieveFases.sunrise) handleSunrise()
        if (currentRelieveFase == relieveFases.birds) handleBirds()
    }, 2300)
}

const handleSunrise = () => {
    btDataMessageHandlers.push(changeSunriseOnBreath)

    //Set sensor request interval
    const breathInterval = setInterval(() => {
        bluetooth.send('BREATH?')

        if (
            currentRelieveFase != relieveFases.sunrise ||
            currentChapter != chapters.relieve
        ) {
            clearInterval(breathInterval)
            removeBtMessageHandler(changeSunriseOnBreath)
        }
    }, 250)
}

const changeSunriseOnBreath = (data) => {
    let label = getLabelFromBtMessage(data)
    let value = getDataFromBtMessage(data)

    // Data is not from breathsensor
    if (label != 'BREATH') return

    // Update breath state
    relieveBreathState.currentBreathPosition = value

    // Update sunrise
    if (!relieveBreathState.hasUsedBreath && relieveBreathState.breathIsDeep) {
        currentSunriseIndex++
        let newColor = sunriseColors[currentSunriseIndex]
        changeEvenvironmentTheme(currentRelieveFase, newColor)
        changeSunPosition()
    }

    if (currentSunriseIndex >= sunriseColors.length - 1) {
        quitRelieve()
    }
}

const changeSunPosition = () => {}

const quitRelieve = () => {
    console.log('done')

    //gameOver()
    //showStartMenu()
}

const handleBirds = () => {}
