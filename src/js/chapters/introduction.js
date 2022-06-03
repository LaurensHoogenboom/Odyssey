class Introduction {
    constructor(player, playerSphere, quitCallback) {
        // Add thought configuration fase?
        this.fases = Object.freeze({ player: 'player', thougts: 'thougts' })
        this.currentFase = this.fases.player

        // Player and controls
        this.hasPointedUser = false
        this.hasLookedLeft = false
        this.hasLookedRight = false

        // Thoughts and coping
        this.thoughtsHavePassed = false
        this.hasEvokedEmotions = false
        this.hasEscaped = false

        // Elements
        this.playerSphere = playerSphere
        this.player = player
        this.introThoughts = document.getElementsByClassName('intro-thought')
        this.emotiveThought = document.querySelector('.intro-emotive')

        // Functions
        this.clickedPlayerHandler = this.completePlayerIntro.bind(this)
        this.moveLeftHandler = this.completeLeftIntro.bind(this)
        this.moveRightHandler = this.completeRightIntro.bind(this)
        this.quitCallback = quitCallback
    }

    start() {
        if (currentChapter != chapters.introduction) {
            this.hasPointedUser = true
            this.hasLookedRight = true
            this.hasLookedLeft = true
            return
        }

        this.show()
    }

    show() {
        if (this.currentFase == this.fases.player) {
            if (!this.hasPointedUser) {
                setInstruction('Kijk naar de bal voor je.')
                this.playerSphere.classList.add('clickable')
                this.playerSphere.addEventListener('click', this.clickedPlayerHandler)
            } else if (!this.hasLookedLeft) {
                controls.enable()
                setInstruction('Kijk naar links om de bal naar links te sturen.')
                this.player.addEventListener('movedLeft', this.moveLeftHandler)
            } else if (!this.hasLookedRight) {
                setInstruction('Kijk naar rechts om de bal naar rechts te sturen.')
                this.player.addEventListener('movedRight', this.moveRightHandler)
            } else {
                this.currentFase = this.fases.thougts
                this.show()
            }
        } else if (this.currentFase == this.fases.thougts) {
            if (!this.thoughtsHavePassed) {
                for (let thought of this.introThoughts) {
                    thought.emit('intro')
                }

                setInstruction('Gedachten komen langs je heen...')

                setTimeout(() => {
                    this.thoughtsHavePassed = true
                    this.show()
                }, 10000)
            } else if (!this.hasEvokedEmotions) {
                setInstruction('Sommigen veroorzaken specifieke emoties...')

                setTimeout(() => {
                    setInstruction(' ')
                    environment.changeTheme(environment.Themes.storm)
                    this.emotiveThought.components.sound.playSound()
                    fadeAudioIn(this.emotiveThought, 1.5, 500)
                    this.emotiveThought.emit('intro')

                    setTimeout(() => {
                        environment.changeTheme(environment.Themes.normal)
                        this.emotiveThought.emit('outro')
                        fadeAudioOut(this.emotiveThought, 0, 500)

                        setTimeout(() => {
                            this.hasEvokedEmotions = true
                            this.show()
                        }, 3000)
                    }, 8000)
                }, 1500)
            } else if (!this.hasEscaped) {
                setInstruction('In veel gevallen kun je de confrontatie ontlopen...')

                setTimeout(() => {
                    setInstruction('Maar soms heb je geen keus.')

                    setTimeout(() => {
                        setInstruction(' ')
                        this.hasEscaped = true
                        this.show()
                    }, 4000)
                }, 4000)
            } else {
                this.quit()
            }
        }
    }

    completePlayerIntro() {
        this.playerSphere.removeEventListener('click', this.clickedPlayerHandler)
        setInstruction('Goed zo!')
        setTimeout(() => {
            this.hasPointedUser = true
            this.playerSphere.classList.remove('clickable')
            this.show()
        }, 1500)
    }

    completeLeftIntro() {
        this.player.removeEventListener('movedLeft', this.moveLeftHandler)
        setInstruction('Super!')
        setTimeout(() => {
            this.hasLookedLeft = true
            this.show()
        }, 1500)
    }

    completeRightIntro() {
        this.player.removeEventListener('movedRight', this.moveRightHandler)
        setInstruction('Goed gedaan!')
        setTimeout(() => {
            this.hasLookedRight = true
            this.show()
        }, 1500)
    }

    reset() {
        this.currentFase = this.fases.player
        this.hasPointedUser = false
        this.hasLookedRight = false
        this.hasLookedLeft = false
        this.thoughtsHavePassed = false
        this.hasEvokedEmotions = false
        this.hasEscaped = false

        controls.disable()

        for (let thought of this.introThoughts) {
            thought.setAttribute('visible', true)
        }

        this.emotiveThought.setAttribute('visible', true)
    }

    disable() {
        this.hasPointedUser = true
        this.hasLookedRight = true
        this.hasLookedLeft = true
        this.thoughtsHavePassed = true
        this.hasEvokedEmotions = true
        this.hasEscaped = true
        controls.enable()
    }

    quit() {
        currentChapter = chapters.running
        runningTime = 0

        for (let thought of this.introThoughts) {
            thought.setAttribute('visible', false)
        }

        this.emotiveThought.setAttribute('visible', false)

        setInstruction(' ')
        this.quitCallback()
    }
}
