class BreathState {
    constructor(
        breathMinPressure,
        breathMaxPressure,
        breathDeepThreshold,
        breathUsedThreshold
    ) {
        this.breathPositions = Object.freeze({ in: 'in', out: 'out' })
        this.breathDelta = breathMaxPressure - breathMinPressure
        this.oldBreathValue = 0

        this.breathOutThreshold =
            breathMinPressure == 0
                ? breathMaxPressure * 0.25
                : breathMinPressure * 1.25

        this.breathInThreshold = 0.75 * breathMaxPressure
        this.breathDeepThreshold = breathDeepThreshold
        this.breathUsedThreshold = breathUsedThreshold
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
        // First Breath
        if (this.oldBreathValue == 0) {
            this.oldBreathValue = value
            return
        }

        if (Math.abs(this.oldBreathValue - value) > 0.25 * this.breathDelta) {
            console.log('Breath position changed')

            if (this.oldBreathValue < value) {
                this._currentBreathPosition = this.breathPositions.out;
            } else {
                this._currentBreathPosition = this.breathPositions.in;
            }
        }

        this.oldBreathValue = value

        //Set breath statetime
        if (this._currentBreathPosition == this.oldBreathPosition) {
            this._breathStateTime += 250

            // Deep?
            if (this._breathStateTime >= this.breathDeepThreshold) {
                this._breathIsDeep = true
            }

            // Used?
            if (this._breathStateTime >= this.breathUsedThreshold) {
                this._hasUsedBreath = true
            }
        } else {
            this._breathStateTime = 0
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

    get breathStateTime() {
        return this._breathStateTime
    }
}
