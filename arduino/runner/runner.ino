#include <SoftwareSerial.h>

SoftwareSerial bluetooth(8, 9); //TX, RX

void initBluetooth() {
  bluetooth.begin(9600);
  Serial.begin(9600);
}

void updateSerial() {
  if (bluetooth.available()) {
    String s = "";
    char c;

    while((c = bluetooth.read()) != -1) {
      if (c != '\n') {
        s += c;
      }
      
      delay(10);
    }

    Serial.println("Received: " + s);
    
    handleMessage(s);
  }

  if (Serial.available()) {    
    bluetooth.write(Serial.read());
  }
}

void handleMessage(String message) {
  if (message == "CONNECTED?") {
    bluetooth.write("CONNECTED!");
    bluetooth.write("\n");
  }
}

void setup() {
  initBluetooth();
}

void loop() {
  updateSerial();
}
