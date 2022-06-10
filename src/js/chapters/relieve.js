/*
    ==============
    Relieve Module
    ==============
*/

let currentSunriseIndex = 0
let sunriseColors = [
    '#202D46',
    '#454644',
    '#907F66',
    '#C89459',
    '#DCC391',
    '#CFD1C0',
    '#D7DCDB',
    '#a3d0ed',
]
let sunrisePositions = [
    { x: 0, y: -3, z: -10 },
    { x: 0, y: -3, z: -10 },
    { x: 0, y: -1.7, z: -10 },
    { x: 0, y: -0.5, z: -10 },
    { x: 0, y: 1.7, z: -10 },
    { x: 0, y: 4.8, z: -10 },
    { x: 0, y: 7.6, z: -10 },
    { x: 0, y: 12, z: -10 },
]
let sunriseScales = [
    { x: 1, y: 1, z: 1 },
    { x: 1, y: 1, z: 1 },
    { x: 1, y: 1, z: 1 },
    { x: 1.5, y: 1.5, z: 1.5 },
    { x: 2.0, y: 2.0, z: 2.0 },
    { x: 2.5, y: 2.5, z: 2.5 },
    { x: 3, y: 3, z: 3 },
    { x: 3.5, y: 3.5, z: 3.5 },
]
let relieveBreathState
let sun

const startRelieveDemo = () => {
    currentSunriseIndex = 0
    hideAllMenus()
    startRelieve()
}

const startRelieve = (
    breathMinPressure = sensorConfiguration.breathMinPressure,
    breathMaxPressure = sensorConfiguration.breathMaxPressure
) => {
    // General
    currentChapter = chapters.relieve

    // Init relieve
    relieveBreathState = new BreathState(breathMinPressure, breathMaxPressure, 500, 1000, 500)
    sun = document.getElementById('sun')
    sun.emit('show')
    environment.changeTheme(environment.Themes.sunrise)

    // Start emotion handling
    setTimeout(() => {
        handleSunrise()
    }, 2000)
}

const handleSunrise = () => {
    btDataMessageHandlers.push(changeSunriseOnBreath)

    progress.start(0, sunrisePositions.length, currentSunriseIndex, 'Haal diep en langzaam adem.')

    setTimeout(() => {
        //Set sensor request interval
        const breathInterval = setInterval(() => {
            bluetooth.send('BREATH?')

            if (currentChapter != chapters.relieve) {
                clearInterval(breathInterval)
                removeBtMessageHandler(changeSunriseOnBreath)
            }
        }, 500)
    }, 1000)
}

const changeSunriseOnBreath = (data) => {
    let label = getLabelFromBtMessage(data)
    let value = getDataFromBtMessage(data)

    // Data is not from breathsensor
    if (label != 'BREATH') return

    // Update breath state
    relieveBreathState.currentBreathPosition = value

    // Update sunrise
    if (
        !relieveBreathState.hasUsedBreath &&
        relieveBreathState.breathIsDeep
    ) {
        currentSunriseIndex++
        let newColor = sunriseColors[currentSunriseIndex]
        environment.changeColor(newColor)
        changeSunPosition(currentSunriseIndex)
        changeSunScale(currentSunriseIndex)
        progress.set(currentSunriseIndex)
    }

    if (currentSunriseIndex >= sunriseColors.length - 1) {
        quitRelieve()
        sun.emit('hide')
    }
}

const changeSunPosition = (index) => {
    let oldPosition = sunrisePositions[index - 1]
    let newPosition = sunrisePositions[index]

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

const changeSunScale = (index) => {
    let oldScale = sunriseScales[index - 1]
    let newScale = sunriseScales[index]

    sun.setAttribute('animation__scale', 'from', `${oldScale.x} ${oldScale.y} ${oldScale.z}`)
    sun.setAttribute('animation__scale', 'to', `${newScale.x} ${newScale.y} ${newScale.z}`)

    sun.emit('grow')
}

const quitRelieve = () => {
    gameOver()
    showStartMenu()
    currentSunriseIndex = 0
    progress.stop()
}
