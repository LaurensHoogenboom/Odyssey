class Environment {
    constructor() {
        // Constants
        this.THEMES = Object.freeze({
            normal: 'normal',
            dark: 'night',
            storm: 'storm',
            scaryStorm: 'scaryStorm',
            sunrise: 'sunrise',
        })
        this.COLORS = Object.freeze({
            blueDay: '#a3d0ed',
            blueNight: '#202D46',
            blueStorm: '#1b3045',
            blueRain: '#233A48',
            redStorm: '#401F11',
            greenStorm: '#25291C',
        })
        this.FOG_DISTANCES = Object.freeze({
            normal: 20,
            fog: 10,
        })
        this.OCEANS = Object.freeze({
            normal: 'normal',
            wild: 'wild',
            scary: 'scary',
        })
        this.DIRECTIONAL_LIGHT_DEFAULT_POSITION = { x: 5, y: 3, z: 1 }
        this.DIRECTIONAL_LIGHT_HIDDEN = { x: 0, y: -5, z: -10 }
        this.DIRECTIONAL_LIGHT_DEFAULT_COLOR = `rgb(208, 234, 249)`

        // Scene
        this.scene = document.getElementById('scene')
        this.ambientLight = document.getElementById('ambient-light')
        this.directionalLight = document.getElementById('directional-light')

        // Sound
        this.thunderSound = document.getElementById('thunder-sound')
        this.rainSound = document.getElementById('rain-sound')

        // Ocean
        this.oceanWrapper = document.getElementById('ocean-wrapper')
        this.oceanNormal = document.getElementById('ocean-normal')
        this.oceanWild = document.getElementById('ocean-wild')
        this.oceanScary = document.getElementById('ocean-scary')

        // Camera
        this.cameraContainer = document.getElementById('camera-container')
    }

    setupSound() {
        this.oceanNormal.components.sound.playSound()
        this.oceanWild.components.sound.playSound()
        this.oceanScary.components.sound.playSound()
        this.rainSound.components.sound.playSound()
        this.thunderSound.components.sound.playSound()
    }

    changeTheme(theme, color) {
        if (theme == this.THEMES.normal) {
            // Color
            let sceneColor = color ? color : this.COLORS.blueDay
            this.changeColor(sceneColor)
            this.changeFog(this.FOG_DISTANCES.normal)

            // Water
            this.changeOceans(this.OCEANS.normal)

            // Light
            this.changeDirectionalLightPosition(this.DIRECTIONAL_LIGHT_DEFAULT_POSITION)
            this.changeDirectionalLightColor(this.DIRECTIONAL_LIGHT_DEFAULT_COLOR)
        }

        if (theme == this.THEMES.storm) {
            // Color
            let sceneColor = color ? color : this.COLORS.blueStorm
            this.changeColor(sceneColor)
            this.changeFog(this.FOG_DISTANCES.normal)

            // Water
            this.oceanWild.emit('show')
            this.oceanScary.emit('hide')
            this.oceanNormal.emit('hide')

            // Water
            this.changeOceans(this.OCEANS.wild)

            // Ambient light
            this.changeDirectionalLightPosition(this.DIRECTIONAL_LIGHT_DEFAULT_POSITION)
            this.changeDirectionalLightColor(this.DIRECTIONAL_LIGHT_DEFAULT_COLOR)
        }

        if (theme == this.THEMES.scaryStorm) {
            // Color
            let sceneColor = color ? color : this.COLORS.greenStorm
            this.changeColor(sceneColor)
            this.changeFog(this.FOG_DISTANCES.fog)

            // Water
            this.changeOceans(this.OCEANS.scary)

            // Light
            this.changeDirectionalLightPosition(this.DIRECTIONAL_LIGHT_DEFAULT_POSITION)
            this.changeDirectionalLightColor(this.DIRECTIONAL_LIGHT_DEFAULT_COLOR)
        }

        if (theme == this.THEMES.sunrise) {
            // Color
            let sceneColor = color ? color : this.COLORS.blueNight
            this.changeColor(sceneColor)
            this.changeFog(this.FOG_DISTANCES.normal)

            // Water
            this.changeOceans(this.OCEANS.normal)

            // Light
            this.changeDirectionalLightPosition(this.DIRECTIONAL_LIGHT_HIDDEN)
            this.changeDirectionalLightColor(this.DIRECTIONAL_LIGHT_DEFAULT_COLOR)
        }
    }

    changeColor(color, duration = 2000) {
        // Set animation attributes
        this.scene.setAttribute('animation__color', 'to', color)
        this.scene.setAttribute('animation__color', 'dur', duration)
        this.ambientLight.setAttribute('animation__color', 'to', color)
        this.ambientLight.setAttribute('animation__color', 'dur', duration)

        // Start animation
        this.scene.emit('color')
        this.ambientLight.emit('color')
    }

    changeFog(distance, duration = 2000) {
        // Set animation attributes
        this.scene.setAttribute('animation__fogDistance', 'to', distance)
        this.scene.setAttribute('animation__fogDistance', 'dur', duration)

        // Start animation
        this.scene.emit('fogDistance')
    }

    changeOceans(type, duration = 2000) {
        // Change duration
        this.oceanNormal.setAttribute('animation__hide', 'dur', duration)
        this.oceanNormal.setAttribute('animation__show', 'dur', duration)
        this.oceanNormal.setAttribute('animation__mute', 'dur', duration)
        this.oceanNormal.setAttribute('animation__play', 'dur', duration)

        this.oceanWild.setAttribute('animation__hide', 'dur', duration)
        this.oceanWild.setAttribute('animation__show', 'dur', duration)
        this.oceanWild.setAttribute('animation__mute', 'dur', duration)
        this.oceanWild.setAttribute('animation__play', 'dur', duration)

        this.oceanScary.setAttribute('animation__hide', 'dur', duration)
        this.oceanScary.setAttribute('animation__show', 'dur', duration)
        this.oceanScary.setAttribute('animation__mute', 'dur', duration)
        this.oceanScary.setAttribute('animation__play', 'dur', duration)

        // Hide all
        this.oceanNormal.emit('hide')
        this.oceanScary.emit('hide')
        this.oceanWild.emit('hide')

        // Show current
        switch (type) {
            case this.OCEANS.normal:
                this.oceanNormal.emit('show')
                break
            case this.OCEANS.wild:
                this.oceanWild.emit('show')
                break
            case this.OCEANS.scary:
                this.oceanScary.emit('show')
                break
            default:
                this.oceanNormal.emit('show')
                break
        }
    }

    changeDirectionalLightPosition(position = this.DIRECTIONAL_LIGHT_DEFAULT_POSITION, duration = 2000) {
        const to = vect3ToString(position)
        const from = this.directionalLight.getAttribute('position')

        this.directionalLight.setAttribute('animation__position', 'from', from)
        this.directionalLight.setAttribute('animation__position', 'to', to)
        this.directionalLight.setAttribute('animation__position', 'dur', duration)
        this.directionalLight.emit('move')
    }

    changeDirectionalLightColor(color, duration = 2000) {
        const to = color ? color : this.DIRECTIONAL_LIGHT_DEFAULT_COLOR
        const from = this.directionalLight.getAttribute('light').color

        this.directionalLight.setAttribute('animation__color', 'from', from)
        this.directionalLight.setAttribute('animation__color', 'to', to)
        this.directionalLight.setAttribute('animation__color', 'dur', duration)
        this.directionalLight.emit('color')
    }

    earthquake() {
        disableLookControls()

        const steps = [
            { position: { x: 0, y: 0, z: 0 }, duration: 40 },
            { position: { x: 20, y: 0, z: 0 }, duration: 60 },
            { position: { x: -10, y: 0, z: 0 }, duration: 70 },
            { position: { x: 15, y: 0, z: 0 }, duration: 100 },
            { position: { x: -15, y: 0, z: 0 }, duration: 80 },
            { position: { x: 10, y: 0, z: 0 }, duration: 100 },
            { position: { x: -5, y: 0, z: 0 }, duration: 90 },
            { position: { x: 8, y: 0, z: 0 }, duration: 120 },
            { position: { x: 3, y: 0, z: 0 }, duration: 150 },
            { position: { x: 5, y: 0, z: 0 }, duration: 120 },
            { position: { x: 0, y: 0, z: 0 }, duration: 175 },
        ]

        let cycle = 0

        const shake = () => {
            const oldPosition = cycle == 0 ? null : steps[cycle - 1].position
            const newPosition = steps[cycle].position

            this.cameraContainer.setAttribute('animation__shake', 'from', vect3ToString(oldPosition))
            this.cameraContainer.setAttribute('animation__shake', 'to', vect3ToString(newPosition))
            this.cameraContainer.setAttribute('animation__shake', 'dur', steps[cycle].duration)
            this.cameraContainer.emit('shake')

            setTimeout(() => {
                cycle++

                if (cycle < steps.length) shake()
                else enableLookControls()
            }, steps[cycle].duration)
        }

        this.cameraContainer.components.sound.playSound()
        shake()
    }

    startThunder() {
        fadeAudioIn(this.thunderSound, 4, 500)
    }

    stopThunder() {
        fadeAudioOut(this.thunderSound, 0, 500)
    }

    startRain(color = undefined) {
        if (color) this.changeColor(color)

        setTimeout(
            () => {
                this.scene.setAttribute('rain', '')
                fadeAudioIn(this.rainSound, 0.75, 500)
            },
            color ? 1000 : 0
        )
    }

    stopRain(color = undefined) {
        this.scene.removeAttribute('rain')
        fadeAudioOut(this.rainSound, 0, 500)

        setTimeout(() => {
            if (color) this.changeColor(color)
        }, 1000)
    }
}
