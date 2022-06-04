class Environment {
    constructor() {
        // Constants
        this.Themes = Object.freeze({
            normal: 'normal',
            dark: 'night',
            storm: 'storm',
            scaryStorm: 'scaryStorm',
            sunrise: 'sunrise',
        })
        this.Events = Object.freeze({
            lightning: 'lightning',
            earthquake: 'earthquake',
            fog: 'fog',
        })
        this.FieldOfViews = Object.freeze({
            normal: 80,
            narrow: 60,
        })
        this.Colors = Object.freeze({
            blueDay: '#a3d0ed',
            blueNight: '#202D46',
            blueStorm: '#1b3045',
            redStorm: '#401F11',
            greenStorm: '#25291C',
        })
        this.FogDistances = Object.freeze({
            normal: 20,
            fog: 7,
        })
        this.Oceans = Object.freeze({
            normal: 'normal',
            wild: 'wild',
            scary: 'scary',
        })

        // Scene
        this.scene = document.getElementById('scene')
        this.sky = document.getElementById('sky')
        this.ambientLight = document.getElementById('ambient-light')

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
        this.sky.components.sound.playSound()
    }

    changeTheme(theme, color) {
        if (theme == this.Themes.normal) {
            // Color
            let sceneColor = color ? color : this.Colors.blueDay
            this.changeColor(sceneColor)
            this.changeFog(this.FogDistances.normal)

            // Water
            this.changeOceans(this.Oceans.normal)
        }

        if (theme == this.Themes.storm) {
            // Color
            let sceneColor = color ? color : this.Colors.blueStorm
            this.changeColor(sceneColor)
            this.changeFog(this.FogDistances.normal)

            // Water
            this.oceanWild.emit('show')
            this.oceanScary.emit('hide')
            this.oceanNormal.emit('hide')

            // Water
            this.changeOceans(this.Oceans.wild)
        }

        if (theme == this.Themes.scaryStorm) {
            // Color
            let sceneColor = color ? color : this.Colors.greenStorm
            this.changeColor(sceneColor)
            this.changeFog(this.FogDistances.fog)

            // Water
            this.changeOceans(this.Oceans.scary)
        }

        if (theme == this.Themes.sunrise) {
            // Color
            let sceneColor = color ? color : this.Colors.blueNight
            this.changeColor(sceneColor)
            this.changeFog(this.FogDistances.normal)

            // Water
            this.changeOceans(this.Oceans.normal)
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
            case this.Oceans.normal:
                this.oceanNormal.emit('show')
                break
            case this.Oceans.wild:
                this.oceanWild.emit('show')
                break
            case this.Oceans.scary:
                this.oceanScary.emit('show')
                break
            default:
                this.oceanNormal.emit('show')
                break
        }
    }

    changeFieldOfView() {}

    changeAmbientLightPosition() {}

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
            const oldPositionString = oldPosition
                ? `${oldPosition.x} ${oldPosition.y} ${oldPosition.z}`
                : null
            const newPosition = steps[cycle].position
            const newPositionString = `${newPosition.x} ${newPosition.y} ${newPosition.z}`

            this.cameraContainer.setAttribute('animation__shake', 'from', oldPositionString)
            this.cameraContainer.setAttribute('animation__shake', 'to', newPositionString)
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

    startRain() {
        this.scene.setAttribute('rain', '')
    }

    stopRain() {
        this.scene.removeAttribute('rain')
    }
}
