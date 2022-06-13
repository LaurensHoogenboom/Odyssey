/*
    Bluetooth controller for HM-10 and similar BLE devices
    ======================================================

    Based on this tutorial: 
    https://loginov-rocks.medium.com/how-to-make-a-web-app-for-your-own-bluetooth-low-energy-device-arduino-2af8d16fdbe8
    
    The code is rewritten to fit the project.
*/ 

class BluetoothController {
    constructor(handleReceivedData) {
        // Html elements
        this.connectButton = document.getElementById('connect')
        this.disconnectButton = document.getElementById('disconnect')
        this.terminalContainer = document.getElementById('terminal')
        this.sendForm = document.getElementById('send-form')
        this.inputField = document.getElementById('input')

        // Cache
        this.deviceCache = null
        this.characteristicCache = null
        this.readBuffer = ''

        // Receive callback method
        this.handleReceivedData = handleReceivedData

        // Set UI
        this.connectButton.innerText = "Verbinden"

        // Init eventlisteners
        this.bindEventListeners()

        // Connected
        this.connected = false;
    }

    bindEventListeners() {
        let self = this

        // Connect to device on button click
        this.connectButton.addEventListener('click', () => {
            this.connectButton.innerText = "Verbinden..."

            this.connect().then(() => {
                this.send('CONNECTED?')
            })
        })

        // Disconnect from device on button click
        this.disconnectButton.addEventListener('click', () => {
            self.disconnect()
        })

        // Form submit to send data
        this.sendForm.addEventListener('submit', (e) => {
            e.preventDefault()
            this.send(this.inputField.value)
            this.inputField.value = ''
            this.inputField.focus()
        })
    }

    // Connect to device with device chooser
    connect() {
        return (
            this.deviceCache
                ? Promise.resolve(this.deviceCache)
                : this.requestBluetoothDevice()
        )
            .then((device) => this.connectDeviceAndCacheCharacteristic(device))
            .then((characteristic) => this.startNotifications(characteristic))
            .catch((error) => this.log(error))
    }

    requestBluetoothDevice() {
        let self = this
        this.log('Request bluetooth device...')

        return navigator.bluetooth
            .requestDevice({
                filters: [{ services: [0xffe0] }],
            })
            .then((device) => {
                this.log(`"${device.name} bluetooth devices selected`)
                this.deviceCache = device

                this.deviceCache.addEventListener('gattserverdisconnected', (e) =>
                    this.handleDisconnection(e, self)
                )

                return this.deviceCache
            })
    }

    handleDisconnection(event, self) {
        let device = event.target

        this.connected = false;

        self.log(`"${device.name}" bluetooth device disconnected, trying to reconnect...`)

        self.connectDeviceAndCacheCharacteristic(device)
            .then((characteristic) => self.startNotifications(characteristic))
            .catch((error) => self.log(error))
    }

    // Connect to device, get service and characteristic
    connectDeviceAndCacheCharacteristic(device) {
        if (device.gatt.conected && this.characteristicCache) {
            return Promise.resolve(this.characteristicCache)
        }

        this.log('Connecting to GATT server')

        return device.gatt
            .connect()
            .then((server) => {
                this.log('GATT server connected, getting server...')

                return server.getPrimaryService(0xffe0)
            })
            .then((service) => {
                this.log('Service found, getting characteristic...')

                return service.getCharacteristic(0xffe1)
            })
            .then((characteristic) => {
                this.log('Characteristic found')

                this.connected = true;
                this.characteristicCache = characteristic

                return this.characteristicCache
            })
    }

    // Enable characteristic changes notifications
    startNotifications(characteristic) {
        this.log('Starting notifications...')

        return characteristic.startNotifications().then(() => {
            this.log('Notifications started')
            let self = this
            characteristic.addEventListener('characteristicvaluechanged', (event) =>
                this.handleCharacteristicValueChanged(event, self)
            )
        })
    }

    // Output to Terminal
    log(data, type = '') {
        this.terminalContainer.insertAdjacentHTML(
            'beforeend',
            `<div ${type ? `class="${type}"` : ''}>${data}</div>`
        )
    }

    // Disconnect from device
    disconnect() {
        this.connected = false;

        if (this.deviceCache) {
            this.log(`Disconnectting from ${this.deviceCache.name} bluetooth device...`)

            this.deviceCache.removeEventListener(
                'gattserverdisconnected',
                this.handleDisconnection
            )

            if (this.deviceCache.gatt.connected) {
                this.deviceCache.gatt.disconnect()
                this.log(`${this.deviceCache.name} bluetooth device disconnected`)
            } else {
                this.log(`${this.deviceCache.name} bluetooth device already disconnected`)
            }

            this.deviceCache = null
        }

        if (this.characteristicCache) {
            this.characteristicCache.removeEventListener(
                'characteristicvaluechanged',
                (event) => this.handleCharacteristicValueChanged(event, self)
            )
            this.characteristicCache = null
        }
    }

    // Data receiving
    handleCharacteristicValueChanged(event, self) {
        let value = new TextDecoder().decode(event.target.value)

        for (let c of value) {
            if (c === '\n') {
                let data = self.readBuffer.trim()
                self.readBuffer = ''

                if (data) {
                    self.receive(data)
                }
            } else {
                self.readBuffer += c
            }
        }
    }

    receive(data) {
        console.log(data)
        this.log(data, 'in')
        if (this.handleReceivedData) this.handleReceivedData(data)
    }

    // Send data to device
    send(data) {
        data = String(data)

        if (!data || !this.characteristicCache) {
            return
        }

        data += '\n'

        if (data.length > 20) {
            let chunks = data.match(/(.|[\r\n]){1,20}/g)

            this.writeToCharacterisctic(this.characteristicCache, chunks[0])

            for (let i = 1; i < chunks.length; i++) {
                setTimeout(() => {
                    this.writeToCharacterisctic(this.characteristicCache, chunks[i])
                }, i * 250)
            }
        } else {
            this.writeToCharacterisctic(this.characteristicCache, data)
        }

        this.log(data, 'out')
    }

    writeToCharacterisctic = (characteristic, data) => {
        console.log(this.connected)

        if (this.connected) characteristic.writeValue(new TextEncoder().encode(data))
    }
}
