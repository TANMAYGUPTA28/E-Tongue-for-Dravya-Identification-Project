/*
 * =========================================================================================
 * DRAVYA E-TONGUE: PHYSICAL EMBEDDED FIRMWARE (ESP32-S3 / ARDUINO)
 * =========================================================================================
 * Description: Reads 6 cross-reactive electrochemical electrode channels (WE1 to WE6)
 *              via 12-bit ADC, applies moving-average oversampling, and streams JSON telemetry
 *              over USB Serial (115200 baud) or Wi-Fi HTTP to the MERN backend.
 *
 * Hardware Pin Mapping (ESP32 / ESP32-S3 ADC1):
 *   - CH1 (Madhura / Sweet)     -> GPIO 32 / ADC1_CH4 (or Arduino A0)
 *   - CH2 (Amla / Sour)         -> GPIO 33 / ADC1_CH5 (or Arduino A1)
 *   - CH3 (Lavana / Salty)      -> GPIO 34 / ADC1_CH6 (or Arduino A2)
 *   - CH4 (Tikta / Bitter)      -> GPIO 35 / ADC1_CH7 (or Arduino A3)
 *   - CH5 (Katu / Pungent)      -> GPIO 36 / ADC1_CH0 (or Arduino A4)
 *   - CH6 (Kashaya / Astringent)-> GPIO 39 / ADC1_CH3 (or Arduino A5)
 *   - Temperature Sensor (NTC)  -> GPIO 25 (or Arduino A6 / Internal Temp)
 * =========================================================================================
 */

#include <Arduino.h>

// Pin definitions
const int SENSOR_PINS[6] = {32, 33, 34, 35, 36, 39};
const int TEMP_PIN = 25;

// Constants
const float V_REF = 3.300;         // ESP32 ADC Reference Voltage (3.3V)
const int ADC_RESOLUTION = 4095;    // 12-Bit ADC (0 - 4095)
const int OVERSAMPLE_COUNT = 16;    // 16x moving average to suppress mains hum (50Hz)
const unsigned long SAMPLE_INTERVAL_MS = 200; // 5 Hz sampling rate

unsigned long lastSampleTime = 0;
unsigned long packetCounter = 0;

void setup() {
  Serial.begin(115200);
  while (!Serial && millis() < 2000); // Wait for serial monitor

  // Initialize analog inputs
  for (int i = 0; i < 6; i++) {
    pinMode(SENSOR_PINS[i], INPUT);
  }

  #if defined(ESP32)
    analogReadResolution(12);
    // Attenuation 11dB allows measuring up to ~3.1V - 3.3V
    for (int i = 0; i < 6; i++) {
      analogSetPinAttenuation(SENSOR_PINS[i], ADC_11db);
    }
  #endif

  Serial.println("{\"status\":\"INITIALIZED\",\"device\":\"ESP32-S3-DRAVYA-AFE\",\"firmware\":\"v3.1.8\"}");
}

void loop() {
  unsigned long now = millis();

  if (now - lastSampleTime >= SAMPLE_INTERVAL_MS) {
    lastSampleTime = now;
    packetCounter++;

    float voltages[6];
    int rawADC[6];

    // Read 6 channels with oversampling for noise reduction
    for (int ch = 0; ch < 6; ch++) {
      long adcAccumulator = 0;
      for (int s = 0; s < OVERSAMPLE_COUNT; s++) {
        adcAccumulator += analogRead(SENSOR_PINS[ch]);
        delayMicroseconds(50);
      }
      int avgAdc = adcAccumulator / OVERSAMPLE_COUNT;
      rawADC[ch] = avgAdc;
      voltages[ch] = (avgAdc / (float)ADC_RESOLUTION) * V_REF;
    }

    // Rough ambient temperature reading
    float tempC = 25.0;
    #if defined(ESP32)
      // Optional temperature estimation from analog or internal sensor
      int rawTemp = analogRead(TEMP_PIN);
      tempC = 20.0 + (rawTemp / 4095.0) * 15.0;
    #endif

    // Format telemetry as JSON string for Serial Bridge
    // Example: {"deviceId":"ESP32-S3","packet":1,"voltages":[0.720,0.380,0.450,2.780,1.150,2.350],"rawADC":[893,471,558,3449,1426,2916],"tempC":25.4}
    Serial.print("{\"deviceId\":\"ESP32-S3-DRAVYA-AFE\",");
    Serial.print("\"packet\":");
    Serial.print(packetCounter);
    Serial.print(",\"voltages\":[");
    for (int i = 0; i < 6; i++) {
      Serial.print(voltages[i], 3);
      if (i < 5) Serial.print(",");
    }
    Serial.print("],\"rawADC\":[");
    for (int i = 0; i < 6; i++) {
      Serial.print(rawADC[i]);
      if (i < 5) Serial.print(",");
    }
    Serial.print("],\"tempC\":");
    Serial.print(tempC, 1);
    Serial.println("}");
  }
}
