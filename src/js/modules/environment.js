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
let oceanScary

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
    oceanScary = document.getElementById('ocean-scary')
    oceanNormal.components.sound.playSound()
    oceanWild.components.sound.playSound()
    oceanScary.components.sound.playSound()
}

// Change
const changeEvenvironmentTheme = (type) => {
    if (type == fases.angry) {
        // Fog and light
        scene.emit('angry')
        ambientLight.emit('angry')

        // Water
        oceanNormal.emit('hide')
        oceanScary.emit('hide')
        oceanWild.emit('show')
    }

    if (type == fases.afraid) {
        // Fog and light
        scene.emit('afraid')
        ambientLight.emit('afraid')

        // Water
        oceanNormal.emit('hide')
        oceanNormal.emit('hide')
        oceanScary.emit('show')
    }

    if (type == 'normal') {
        // Fog and light
        scene.emit('normal')
        ambientLight.emit('normal')

        // Water
        oceanWild.emit('hide')
        oceanScary.emit('hide')
        oceanNormal.emit('show')
    }
}

const shakePathAndSea = () => {}
