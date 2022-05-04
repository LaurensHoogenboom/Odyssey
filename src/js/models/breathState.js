class BreathState {
    constructor(breathMinPressure, breathMaxPressure, breathDeepThreshold, breathUsedThreshold) {
        this.breathPositions = Object.freeze({ in: 'in', out: 'out' })
        this.breathOutThreshold =
            breathMinPressure == 0
                ? breathMaxPressure * 0.25
                : breathMinPressure * 1.25
        this.breathInThreshold = 0.75 * breathMaxPressure
        this.breathDeepThreshold = breathDeepThreshold
        this.breathUsedThreshold = breathUsedThreshold
        this.oldBreathPosition = this.breathPositions.in
        this._currentBreathPosition = this.breathPositions.in
        this.breathStateTime = 0
        this._hasUsedBreath = false
        this._breathIsDeep = false
    }

    get currentBreathPosition() {
        return this._currentBreathPosition
    }

    set currentBreathPosition(value) {
        //Set current breath position based on value: int
        if (value > this.breathInThreshold) {
            this._currentBreathPosition = this.breathPositions.in
        } else if (value < this.breathOutThreshold) {
            this._currentBreathPosition = this.breathPositions.out
        }

        //Set breath statetime
        if (this._currentBreathPosition == this.oldBreathPosition) {
            this.breathStateTime += 250

            // Deep?
            if (this.breathStateTime >= this.breathDeepThreshold) {
                this._breathIsDeep = true
            }

            // Used?
            if (this.breathStateTime >= this.breathUsedThreshold) {
                this._hasUsedBreath = true
            }
        } else {
            this.breathStateTime = 0
            this._hasUsedBreath = false
            this._breathIsDeep = false
            this.oldBreathPosition = this._currentBreathPosition
        }
    }

    get hasUsedBreath() {
        return this._hasUsedBreath
    }

    get breathIsDeep() {
        return this._breathIsDeep
    }
}
