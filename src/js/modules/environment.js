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
let oceans
let oceanNormalSound
let oceanWildSound

// Setup
const setupEnvironment = () => {
    // Ocean
    oceanWrapper = document.getElementById('ocean-wrapper')
    oceans = document.getElementsByClassName('ocean')
    // Scene
    scene = document.getElementById('scene')
    ambientLight = document.getElementById('ambient-light')
}

const setupSound = () => {
    oceanNormalSound = document.getElementById('sea-normal-sound')
    oceanWildSound = document.getElementById('sea-wild-sound')
    oceanNormalSound.components.sound.playSound()
    oceanWildSound.components.sound.playSound()
}

// Change
const changeEvenvironmentTheme = (type) => {
    if (type == fases.angry) {
        // Fog and light
        scene.emit('angry')
        ambientLight.emit('angry')

        // Sound
        fadeAudioOut(oceanNormalSound, 0, 2)
        fadeAudioIn(oceanWildSound, 0.3, 2)
    }

    if (type == 'normal') {
        // Fog and light
        scene.emit('normal')
        ambientLight.emit('normal')

        // Sound
        fadeAudioOut(oceanWildSound, 0, 2)
        fadeAudioIn(oceanNormalSound, 0.3, 2)
    }
}

const shakePathAndSea = () => {}
