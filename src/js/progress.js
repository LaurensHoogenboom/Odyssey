class Progress {
    constructor() {
        this.cursor = document.getElementById('cursor-mobile')
        this.filling = document.getElementById('cursor-fill')
        this.min = 0
        this.max = 0
    }

    start(min, max, current, instruction) {
        this.cursor.emit('startProgress')
        this.min = min
        this.max = max
        this.set(current, 1000)

        setTimeout(() => {
            this.filling.setAttribute('visible', true)
            setInstruction(instruction ? instruction : ' ')

            setTimeout(() => {
                hideInstruction()
            }, 5000)
        }, 1000)
    }

    stop() {
        hideInstruction()
        this.set(this.max)

        setTimeout(() => {
            this.filling.setAttribute('visible', true)
            this.cursor.emit('stopProgress')
        }, 500)
    }

    set(current, duration = 500) {
        const value = scale(current, [this.min, this.max], [0, 360])
        const to = typeof value == 'number' && Math.ceil(value) > 1 ? Math.ceil(value) : 1
        const from = this.filling.getAttribute('geometry').thetaLength

        this.filling.setAttribute('animation__fill', 'to', to)
        this.filling.setAttribute('animation__fill', 'from', from)
        this.filling.setAttribute('animation__fill', 'dur', duration)
        this.filling.emit('fill')
    }
}
