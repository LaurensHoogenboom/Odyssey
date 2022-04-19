window.onload=function(){
    //html elements
    let connectButton = document.getElementById("connect");
    let disconnectButton = document.getElementById("disconnect");
    let terminalContainer = document.getElementById("terminal");
    let sendForm = document.getElementById("send-form");
    let inputField = document.getElementById("input");

    //Connect to device on button click
    connectButton.addEventListener('click', () => {
        connect();
    });

    //Disconnect from device on button click
    disconnectButton.addEventListener('click', () => {
        disconnect();
    });

    //Form submit to send data
    sendForm.addEventListener('submit', (e) => {
        e.preventDefault();
        send(inputField.value);
        inputField.value = '';
        inputField.focus();
    });

    let deviceCache = null;

    //Connect to device with device chooser
    const connect = () => {
        return (
            deviceCache ? Promise.resolve(deviceCache) :
                requestBluetoothDevice()).
                then(device => connectDeviceAndCacheCharacteristic(device)).
                then(characteristic => startNotifications(characteristic)).
                catch(error => log(error));
    }

    const requestBluetoothDevice = () => {
        log("Request bluetooth device...");

        return navigator.bluetooth.requestDevice({
            filters: [{ services: [0xFFE0] }],
        }).
            then(device => {
                log(`"${device.name} bluetooth devices selected`);
                deviceCache = device;

                deviceCache.addEventListener('gattserverdisconnected', handleDisconnection);

                return deviceCache
            });
    }

    const handleDisconnection = (event) => {
        let device = event.target;

        log(`"${device.name}" bluetooth device disconnected, trying to reconnect...`);

        connectDeviceAndCacheCharacteristic(device).
            then(characteristic => startNotifications(characteristic)).
            catch(error => log(error));
    }

    // Characteristic object cache
    let characteristicCache = null;

    //Connect to device, get service and characteristic
    const connectDeviceAndCacheCharacteristic = (device) => {
        if (device.gatt.conected && characteristicCache) {
            return Promise.resolve(characteristicCache);
        }

        log('Connecting to GATT server');

        return device.gatt.connect().
            then(server => {
                log('GATT server connected, getting server...');

                return server.getPrimaryService(0xFFE0);
            }).
            then(service => {
                log('Service found, getting characteristic...');
            
                return service.getCharacteristic(0xFFE1);
            }).
            then(characteristic => {
                log('Characteristic found');

                characteristicCache = characteristic;

                return characteristicCache;
            });
    }

    //Enable characteristic changes notifications
    const startNotifications = (characteristic) => {
        log('Starting notifications...');

        return characteristic.startNotifications().
            then(() => {
                log('Notifications started');

                characteristic.addEventListener('characteristicvaluechanged', handleCharacteristicValueChanged);
            });
    }


    //output to Terminal
    const log = (data, type = '') => {
        terminalContainer.insertAdjacentHTML('beforeend',
            `<div ${type ? `class="${type}"` : ''}>${data}</div>`);
    }

    //Disconnect from device
    const disconnect = () => {
        if (deviceCache) {
            log(`Disconnectting from ${deviceCache.name} bluetooth device...`);

            deviceCache.removeEventListener('gattserverdisconnected', handleDisconnection);

            if (deviceCache.gatt.connected) {
                deviceCache.gatt.disconnect();
                log(`${deviceCache.name} bluetooth device disconnected`);
            } else {
                log(`${deviceCache.name} bluetooth device already disconnected`);
            }

            deviceCache = null;
        }

        if (characteristicCache) {
            characteristicCache.removeEventListener('characteristicvaluechanged', handleCharacteristicValueChanged);
            characteristicCache = null;
        }
    }

    // Buffer for incoming data
    let readBuffer = '';

    //Data receiving
    const handleCharacteristicValueChanged = (event) => {
        let value = new TextDecoder().decode(event.target.value);

        for (let c of value) {
            if (c === '\n') {
                let data = readBuffer.trim();
                readBuffer = '';

                if (data) {
                    receive(data);
                }
            }
            else {
                readBuffer += c;
            }
        }
    }

    const receive = (data) => {
        log(data, 'in');
    }

    //Send data to device
    const send = (data) => {
        data = String(data);

        if (!data || !characteristicCache) {
            return;
        }

        data += '\n';

        if (data.length > 20) {
            let chunks = data.match(/(.|[\r\n]){1,20}/g);

            writeToCharacterisctic(characteristicCache, chunks[0]);

            for (let i = 1; i < chunks.length; i++) {
                setTimeout(() => {
                    writeToCharacterisctic(characteristicCache, chunks[i]);
                }, i * 250);
            }
        }
        else {
            writeToCharacterisctic(characteristicCache, data);
        }

        log(data, 'out');
    }

    const writeToCharacterisctic = (characteristic, data) => {
        characteristic.writeValue(new TextEncoder().encode(data));
    }
}
