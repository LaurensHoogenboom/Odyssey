class BreathState {
    constructor(
        breathMinPressure,
        breathMaxPressure,
        breathMaxTime,
        measureThreshold,
        measureInterval
    ) {
        this.breathPositions = Object.freeze({ in: 'in', out: 'out' })
        this.breathDelta = breathMaxPressure - breathMinPressure
        this._oldBreathValue = null
        this.breathMaxTime = breathMaxTime

        this.measureInterval = measureInterval
        this.measureThreshold = measureThreshold
        this.measureTime = 0

        this.oldBreathPosition = this.breathPositions.in
        this._currentBreathPosition = this.breathPositions.in
        this._breathStateTime = 0
        this._hasUsedBreath = false
        this._breathIsDeep = false
    }

    get currentBreathPosition() {
        return this._currentBreathPosition
    }

    set currentBreathPosition(value) {
        // Check if has to measure
        if (this.measureTime >= this.measureThreshold) {
            this.measureTime = 0

            // First Breath
            if (this._oldBreathValue == null) {
                this._oldBreathValue = value
                return
            }

            // Check if breath position has changed
            if (
                Math.abs(this._oldBreathValue - value) >
                0.4 * this.breathDelta
            ) {
                this._breathIsDeep = true

                if (this._oldBreathValue < value) {
                    this._currentBreathPosition = this.breathPositions.out
                } else {
                    this._currentBreathPosition = this.breathPositions.in
                }
            }

            this._oldBreathValue = value
        } else {
            this.measureTime += this.measureInterval
        }

        // Set breath statetime
        if (this._currentBreathPosition == this.oldBreathPosition) {
            this._breathStateTime += this.measureInterval

            // Used?
            if (this._breathStateTime >= this.breathMaxTime) {
                this._hasUsedBreath = true
                this._breathIsDeep = false
            }
        } else {
            this._breathStateTime = 0
            this._hasUsedBreath = false
            this.oldBreathPosition = this._currentBreathPosition
        }
    }

    get hasUsedBreath() {
        return this._hasUsedBreath
    }

    get breathIsDeep() {
        return this._breathIsDeep
    }

    get breathStateTime() {
        return this._breathStateTime
    }

    get oldBreathValue() {
        return this._oldBreathValue
    }
}
