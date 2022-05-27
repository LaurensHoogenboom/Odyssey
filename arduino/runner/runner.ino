#include <SoftwareSerial.h>

SoftwareSerial bluetooth(9, 8); //TX, RX

const int angerPressurePin = A0;
const int breathPressurePin = A1;

int angerPressure = 0;
int breathPressure = 0;

void initSerial() {
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

void sendMessage(String message) {
  char messageArray[message.length() + 1];
  for (int i = 0; i < sizeof(messageArray); i++) {
    messageArray[i] = message[i];
  } 

  bluetooth.write(messageArray);
  bluetooth.write("\n");
}

void handleMessage(String message) {
  String reply = "";
  
  if (message == "CONNECTED?") {
    reply = "CONNECTED!";
  } 
  else if (message == "ANGER?") {
    reply = "ANGER: " + String(angerPressure);
  }
  else if (message == "BREATH?") {
    reply = "BREATH: " + String(breathPressure);
  }

  sendMessage(reply);
}

void readSensorData() {
  angerPressure = analogRead(angerPressurePin);
  breathPressure = analogRead(breathPressurePin);

  // Debug pressure sensor data

  //String angerLabel = "Anger Pressure: ";
  //String breathLabel = ", Breath Pressure: ";

  //Serial.print(angerLabel + angerPressure);
  //Serial.println(breathLabel + breathPressure);
}

void setup() {
  initSerial();
}

void loop() {
  readSensorData();
  delay(20);
  updateSerial();
  delay(20);
}
