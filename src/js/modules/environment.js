/*
    ==================
    Environment Module
    ==================
*/

// Scene
let scene
let ambientLight

// Ocean
let oceanWrapper
let oceanNormal
let oceanWild

// Setup
const setupEnvironment = () => {
    // Ocean
    oceanWrapper = document.getElementById('ocean-wrapper')
    // Scene
    scene = document.getElementById('scene')
    ambientLight = document.getElementById('ambient-light')
}

const setupSound = () => {
    oceanNormal = document.getElementById('ocean-normal')
    oceanWild = document.getElementById('ocean-wild')
    oceanNormal.components.sound.playSound()
    oceanWild.components.sound.playSound()
}

// Change
const changeEvenvironmentTheme = (type) => {
    if (type == fases.angry) {
        // Fog and light
        scene.emit('angry')
        ambientLight.emit('angry')

        // Water
        oceanNormal.emit('hide')
        oceanWild.emit('show')
    }

    if (type == fases.afraid) {
        //rood groen licht
        //flikkering
    }

    if (type == 'normal') {
        // Fog and light
        scene.emit('normal')
        ambientLight.emit('normal')

        // Water
        oceanWild.emit('hide')
        oceanNormal.emit('show')
    }
}

const shakePathAndSea = () => {}
