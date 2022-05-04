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
const changeEvenvironmentTheme = (type, color = undefined) => {
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
        
        scene.emit('afraid')
        ambientLight.emit('afraid')

        // Water
        oceanNormal.emit('hide')
        oceanNormal.emit('hide')
        oceanScary.emit('show')
    }

    if (type == `${relieveFases.sunrise}`) {
        if (color) {
            scene.setAttribute('animation__sunriseColor', 'to', color)
            ambientLight.setAttribute('animation__sunrise', 'to', color)
        } else {
            scene.setAttribute('animation__sunriseColor', 'to', '#202D46')
            ambientLight.setAttribute('animation__sunrise', 'to', '#202D46')
        }

        // Fog and light
        scene.emit('sunrise')
        ambientLight.emit('sunrise')

        // Water
        oceanWild.emit('hide')
        oceanScary.emit('hide')
        oceanNormal.emit('show')
    }

    if (type == `${relieveFases.sunrise}-2`) {
        // Fog and light
        scene.emit('sunrise2')
        ambientLight.emit('sunrise2')
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
