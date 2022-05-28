class Introduction {
    constructor(player, playerSphere, quitCallback) {
        // Add thought configuration fase?
        this.fases = Object.freeze({ player: 'player', thougts: 'thougts' })
        this.currentFase = this.fases.player

        this.hasPointedUser = false
        this.hasLookedLeft = false
        this.hasLookedRight = false

        this.playerSphere = playerSphere
        this.player = player

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

    show(fases = this.fases) {
        if (this.currentFase == fases.player) {
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
                this.currentFase = fases.thougts
                this.show()
            }
        } else if (this.currentFase == fases.thougts) {
            this.quit()
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
    }

    disable() {
        this.hasPointedUser = true
        this.hasLookedRight = true
        this.hasLookedLeft = true
    }

    quit() {
        currentChapter = chapters.running
        setInstruction(' ')
        this.quitCallback()
    }
}
