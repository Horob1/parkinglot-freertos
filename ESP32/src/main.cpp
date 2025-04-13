// Dependency
#include <Arduino.h>
#include <WiFi.h>
#include <WiFiMulti.h>
#include <WiFiClientSecure.h>
#include <WebSocketsClient.h>
#include <ArduinoJson.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <MFRC522.h>
#include "esp_task_wdt.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "freertos/timers.h"
#include <ESP32Servo.h>
#include <SPI.h>
#define WDT_TIMEOUT 10 // Thời gian tối đa (giây) trước khi WDT reset ESP32

// TaskHandle_t
TaskHandle_t WiFiTaskHandle;
TaskHandle_t WebSocketTaskHandle;
TaskHandle_t UpdateSlotTaskHandle;
TaskHandle_t RFIDInTaskHandle;
TaskHandle_t ServoInTaskHandle;
TaskHandle_t RFIDOutTaskHandle;
TaskHandle_t ServoOutTaskHandle;
TaskHandle_t ProfilerTaskHandle;
TaskHandle_t SendStatsTaskHandle;

Servo servo1;
Servo servo2;

#define SERVO_1 26
#define SERVO_2 27

#define IR_1 35
#define IR_2 12
#define IR_IN 14
#define IR_OUT 15

// Chân kết nối RFID #1
#define SS_1 5   // SDA của RC522 #1
#define RST_1 32 // RST của RC522 #1

// Chân kết nối RFID #2
#define SS_2 4   // SDA của RC522 #2
#define RST_2 33 // RST của RC522 #2

MFRC522 rfidIn(SS_1, RST_1);
MFRC522 rfidOut(SS_2, RST_2);

// Buzzer
#define BUZZER_PIN 25

void buzz()
{
  digitalWrite(BUZZER_PIN, HIGH);
  delay(500);
  digitalWrite(BUZZER_PIN, LOW);
}

// LCD 20x4
#define SDA_LCD 21
#define SCL_LCD 22

LiquidCrystal_I2C lcd(0x27, 20, 4);

// Tạo Timer FreeRTOS
TimerHandle_t lcdClearTimer;

void clearLCD(TimerHandle_t xTimer)
{
  lcd.clear(); // Xóa màn hình LCD
}

const String WS_SERVER = "parkinglot-freertos.onrender.com";
const int WS_PORT = 443;

WiFiMulti WiFiMulti;
WebSocketsClient webSocket;

SemaphoreHandle_t bs_in;
SemaphoreHandle_t bs_out;

void hexdump(const void *mem, uint32_t len, uint8_t cols = 16)
{
  const uint8_t *src = (const uint8_t *)mem;
  Serial.printf("\n[HEXDUMP] Address: 0x%08X len: 0x%X (%d)", (ptrdiff_t)src, len, len);
  for (uint32_t i = 0; i < len; i++)
  {
    if (i % cols == 0)
    {
      Serial.printf("\n[0x%08X] 0x%08X: ", (ptrdiff_t)src, i);
    }
    Serial.printf("%02X ", *src);
    src++;
  }
  Serial.printf("\n");
}

void handleServerResponse(const char *message)
{
  DynamicJsonDocument doc(200);
  DeserializationError error = deserializeJson(doc, message);
  if (error)
  {
    Serial.println("[WebSocket] JSON Parsing Error!");
    return;
  }

  String type = doc["type"];
  if (type == "check-in-success")
  {
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Welcome! Have a nice day!");
    xTimerReset(lcdClearTimer, 0);
    xSemaphoreGive(bs_in);
  }
  else if (type == "error")
  {
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Error: ");
    if (doc.containsKey("message"))
    {
      lcd.print(doc["message"].as<const char *>());
    }
    else
    {
      lcd.print("No message");
    }
    xTimerReset(lcdClearTimer, 0);
  }
  else if (type == "check-out-success")
  {
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Thank you for using our service!");
    lcd.setCursor(0, 1);
    lcd.print("Your bill: ");
    lcd.setCursor(0, 2);
    if (doc.containsKey("bill"))
    {
      lcd.print(doc["bill"].as<const char *>());
    }
    else
    {
      lcd.print("No bill");
    }
    lcd.print(" VND");
    lcd.setCursor(0, 3);
    lcd.print("Have a nice day!");
    xTimerReset(lcdClearTimer, 0);
    xSemaphoreGive(bs_out);
  }
}

void webSocketEvent(WStype_t type, uint8_t *payload, size_t length)
{
  switch (type)
  {
  case WStype_DISCONNECTED:
    Serial.println("[WebSocket] Disconnected!");
    break;

  case WStype_CONNECTED:
    webSocket.sendTXT("{\"type\": \"auth\", \"clientType\": \"esp\"}");
    break;

  case WStype_TEXT:
    Serial.printf("[WebSocket] Received: %s\n", payload);
    handleServerResponse(reinterpret_cast<const char *>(payload)); // Xử lý phản hồi từ server
    break;

  case WStype_BIN:
    hexdump(payload, length);
    break;

  default:
    break;
  }
}

// Task để kết nối WiFi
unsigned long loopCountWiFi = 0, totalTimeWiFi = 0;
void WiFiTask(void *pvParameters)
{
  Serial.println("[WiFiTask] Connecting to WiFi...");
  WiFiMulti.addAP("HOROB1", "mancityvodich");
  WiFiMulti.addAP("Tam Nguyen", "mancityvodich");
  WiFiMulti.addAP("Duy 84", "123456789");

  while (WiFiMulti.run() != WL_CONNECTED)
  {
    Serial.print(".");
    vTaskDelay(pdMS_TO_TICKS(500));
  }

  Serial.println("\n[WiFiTask] WiFi Connected!");

  esp_task_wdt_add(NULL);
  while (true)
  {
    unsigned long start = millis();

    if (WiFi.status() != WL_CONNECTED)
    {
      Serial.println("[WiFiTask] WiFi Disconnected! Reconnecting...");

      uint8_t retry = 0;
      while (WiFiMulti.run() != WL_CONNECTED && retry < 10)
      {
        retry++;
        vTaskDelay(pdMS_TO_TICKS(1000));
      }
    }

    unsigned long duration = millis() - start;
    totalTimeWiFi += duration;
    loopCountWiFi++;

    esp_task_wdt_reset();
    vTaskDelay(pdMS_TO_TICKS(5000));
  }
}

// Task để quản lý WebSocket
unsigned long loopCountWS = 0, totalTimeWS = 0;
void WebSocketTask(void *pvParameters)
{
  while (WiFi.status() != WL_CONNECTED)
  {
    vTaskDelay(pdMS_TO_TICKS(500));
  }

  webSocket.beginSSL(WS_SERVER, WS_PORT, "/ws");
  webSocket.onEvent(webSocketEvent);
  webSocket.setReconnectInterval(5000);

  esp_task_wdt_add(NULL);
  while (true)
  {
    unsigned long start = millis();

    webSocket.loop();

    if (WiFi.status() != WL_CONNECTED)
    {
      Serial.println("[WebSocketTask] WiFi lost! Stopping WebSocket...");
      webSocket.disconnect();
      while (WiFi.status() != WL_CONNECTED)
      {
        vTaskDelay(pdMS_TO_TICKS(500));
      }
      Serial.println("[WebSocketTask] Reconnecting WebSocket...");
      webSocket.beginSSL(WS_SERVER, WS_PORT, "/ws");
      webSocket.onEvent(webSocketEvent);
      webSocket.setReconnectInterval(5000);
    }

    unsigned long duration = millis() - start;
    totalTimeWS += duration;
    loopCountWS++;

    esp_task_wdt_reset();
    vTaskDelay(pdMS_TO_TICKS(100));
  }
}

void TaskProfiler(void *pvParameters)
{
  esp_task_wdt_add(NULL);
  while (true)
  {
    esp_task_wdt_reset();
    Serial.println("========== [TASK PROFILER] ==========");

    // In thông tin CPU sử dụng và Stack còn lại
    TaskHandle_t taskHandles[] = {
        xTaskGetHandle("WiFiTask"),
        xTaskGetHandle("WebSocketTask"),
        xTaskGetHandle("UpdateSlotTask"),
        xTaskGetHandle("RFIDInTask"),
        xTaskGetHandle("ServoInTask"),
        xTaskGetHandle("RFIDOutTask"),
        xTaskGetHandle("ServoOutTask")};

    const char *taskNames[] = {
        "WiFiTask",
        "WebSocketTask",
        "UpdateSlotTask",
        "RFIDInTask",
        "ServoInTask",
        "RFIDOutTask",
        "ServoOutTask"};

    for (int i = 0; i < sizeof(taskHandles) / sizeof(taskHandles[0]); i++)
    {
      if (taskHandles[i] != NULL)
      {
        UBaseType_t stackHighWaterMark = uxTaskGetStackHighWaterMark(taskHandles[i]);
        Serial.printf("Task: %-15s | Min Stack Left: %5u bytes\n", taskNames[i], stackHighWaterMark * sizeof(StackType_t));
      }
      else
      {
        Serial.printf("Task: %-15s | Not running\n", taskNames[i]);
      }
    }

    uint32_t totalHeap = ESP.getHeapSize();
    uint32_t freeHeap = ESP.getFreeHeap();
    uint32_t usedHeap = totalHeap - freeHeap;
    uint32_t minFreeHeap = ESP.getMinFreeHeap();

    Serial.println("------------ [MEMORY] ------------");
    Serial.printf("Total Heap:       %u bytes\n", totalHeap);
    Serial.printf("Free Heap:        %u bytes\n", freeHeap);
    Serial.printf("Used Heap:        %u bytes\n", usedHeap);
    Serial.printf("Min Free Ever:    %u bytes\n", minFreeHeap);
    Serial.println("==================================\n");

    vTaskDelay(pdMS_TO_TICKS(5000)); // Mỗi 5 giây log 1 lần
  }
}

int readStableIR(int pin)
{
  int count = 0;
  int value = digitalRead(pin);
  for (int i = 0; i < 10 && count < 8; i++)
  {
    if (digitalRead(pin) == value)
      count++;
    vTaskDelay(pdMS_TO_TICKS(10));
  }
  if (count >= 8)
    return value;
  return !value;
}
// Task update slot
unsigned long loopCountSlot = 0, totalTimeSlot = 0;
void UpdateSlotTask(void *pvParameters)
{
  esp_task_wdt_add(NULL);
  int time = 0;
  char payload[64];
  int slot_1 = 0, slot_2 = 0;
  int newSlot_1 = readStableIR(IR_1);
  int newSlot_2 = readStableIR(IR_2);

  while (true)
  {
    unsigned long start = millis(); // Bắt đầu đo thời gian

    esp_task_wdt_reset();
    int newTime = millis();
    newSlot_1 = readStableIR(IR_1);
    newSlot_2 = readStableIR(IR_2);

    if ((slot_1 != newSlot_1 || slot_2 != newSlot_2) && newTime - time > 1000)
    {
      time = newTime;
      slot_1 = newSlot_1;
      slot_2 = newSlot_2;

      snprintf(payload, sizeof(payload),
               "{\"type\":\"update-slot\",\"slot_1\":%d,\"slot_2\":%d}",
               slot_1, slot_2);
      webSocket.sendTXT(payload);
    }

    unsigned long duration = millis() - start;
    totalTimeSlot += duration;
    loopCountSlot++;

    vTaskDelay(pdMS_TO_TICKS(100));
  }
}

// Biến cục bộ quản lý task
unsigned long loopCountIn = 0, totalTimeIn = 0;
unsigned long loopCountOut = 0, totalTimeOut = 0;
unsigned long loopCountServoIn = 0, totalTimeServoIn = 0;
unsigned long loopCountServoOut = 0, totalTimeServoOut = 0;
// Hàm dùng chung gửi WebSocket UID
void sendUIDEvent(const char *type, MFRC522 &reader, char *uid, char *payload)
{
  for (byte i = 0; i < reader.uid.size; i++)
  {
    sprintf(&uid[i * 2], "%02X", reader.uid.uidByte[i]);
  }
  snprintf(payload, 64, "{\"type\":\"%s\",\"uid\":\"%s\"}", type, uid);
  webSocket.sendTXT(payload);
}

// Task quản lý RFID IN
void RFIDInTask(void *pvParameters)
{
  esp_task_wdt_add(NULL);
  char uid[32] = {0};
  char payload[64];

  while (true)
  {
    unsigned long start = millis();

    esp_task_wdt_reset();
    if (rfidIn.PICC_IsNewCardPresent() && rfidIn.PICC_ReadCardSerial() && digitalRead(IR_IN) == LOW)
    {
      uid[0] = '\0';
      for (byte i = 0; i < rfidIn.uid.size; i++)
      {
        sprintf(uid + strlen(uid), "%02X", rfidIn.uid.uidByte[i]);
      }
      snprintf(payload, sizeof(payload), "{\"type\":\"check-in\",\"uid\":\"%s\"}", uid);
      webSocket.sendTXT(payload);
      rfidIn.PICC_HaltA();
      buzz();
    }

    unsigned long duration = millis() - start;
    totalTimeIn += duration;
    loopCountIn++;

    vTaskDelay(pdMS_TO_TICKS(100));
  }
}

// Task quản lý RFID OUT
void RFIDOutTask(void *pvParameters)
{
  esp_task_wdt_add(NULL);
  char uid[32] = {0};
  char payload[64];

  while (true)
  {
    unsigned long start = millis();

    esp_task_wdt_reset();
    if (rfidOut.PICC_IsNewCardPresent() && rfidOut.PICC_ReadCardSerial() && digitalRead(IR_OUT) == LOW)
    {
      uid[0] = '\0';
      for (byte i = 0; i < rfidOut.uid.size; i++)
      {
        sprintf(uid + strlen(uid), "%02X", rfidOut.uid.uidByte[i]);
      }
      snprintf(payload, sizeof(payload), "{\"type\":\"check-out\",\"uid\":\"%s\"}", uid);
      webSocket.sendTXT(payload);
      rfidOut.PICC_HaltA();
      buzz();
    }

    unsigned long duration = millis() - start;
    totalTimeOut += duration;
    loopCountOut++;

    vTaskDelay(pdMS_TO_TICKS(100));
  }
}

// Task điều khiển servo vào
void ServoInTask(void *pvParameters)
{
  esp_task_wdt_add(NULL);

  while (true)
  {
    unsigned long start = millis();

    esp_task_wdt_reset();
    if (xSemaphoreTake(bs_in, pdMS_TO_TICKS(100)) == pdTRUE && digitalRead(IR_IN) == LOW)
    {
      servo1.write(90);
      while (digitalRead(IR_IN) == LOW)
      {
        esp_task_wdt_reset();
        vTaskDelay(pdMS_TO_TICKS(100));
      }
      vTaskDelay(pdMS_TO_TICKS(100));
      servo1.write(180);
    }

    unsigned long duration = millis() - start;
    totalTimeServoIn += duration;
    loopCountServoIn++;

    vTaskDelay(pdMS_TO_TICKS(100));
  }
}

// Task điều khiển servo ra
void ServoOutTask(void *pvParameters)
{
  esp_task_wdt_add(NULL);

  while (true)
  {
    unsigned long start = millis();

    esp_task_wdt_reset();
    if (xSemaphoreTake(bs_out, pdMS_TO_TICKS(100)) == pdTRUE && digitalRead(IR_OUT) == LOW)
    {
      servo2.write(90);
      while (digitalRead(IR_OUT) == LOW)
      {
        esp_task_wdt_reset();
        vTaskDelay(pdMS_TO_TICKS(100));
      }
      vTaskDelay(pdMS_TO_TICKS(100));
      servo2.write(180);
    }

    unsigned long duration = millis() - start;
    totalTimeServoOut += duration;
    loopCountServoOut++;

    vTaskDelay(pdMS_TO_TICKS(100));
  }
}

void SendStatsTask(void *pvParameters)
{
  esp_task_wdt_add(NULL);
  char statsPayload[256];

  while (true)
  {
    esp_task_wdt_reset();
    if (webSocket.isConnected())
    {
      // Tính thời gian trung bình
      float avgIn = loopCountIn ? (float)totalTimeIn / loopCountIn : 0;
      float avgOut = loopCountOut ? (float)totalTimeOut / loopCountOut : 0;
      float avgServoIn = loopCountServoIn ? (float)totalTimeServoIn / loopCountServoIn : 0;
      float avgServoOut = loopCountServoOut ? (float)totalTimeServoOut / loopCountServoOut : 0;
      float avgWiFi = loopCountWiFi ? (float)totalTimeWiFi / loopCountWiFi : 0;
      float avgWS = loopCountWS ? (float)totalTimeWS / loopCountWS : 0;
      float avgSlot = loopCountSlot ? (float)totalTimeSlot / loopCountSlot : 0;

      // Tạo JSON payload
      snprintf(statsPayload, sizeof(statsPayload),
               "{\"type\":\"task-stats\","
               "\"avg_rfid_in\":%.2f,"
               "\"avg_rfid_out\":%.2f,"
               "\"avg_servo_in\":%.2f,"
               "\"avg_servo_out\":%.2f,"
               "\"avg_wifi\":%.2f,"
               "\"avg_ws\":%.2f,"
               "\"avg_slot\":%.2f}",
               avgIn, avgOut, avgServoIn, avgServoOut, avgWiFi, avgWS, avgSlot);

      // Gửi qua WebSocket
      webSocket.sendTXT(statsPayload);

      // Reset biến để đo tiếp vòng sau
      loopCountIn = loopCountOut = loopCountServoIn = loopCountServoOut = 0;
      loopCountWiFi = loopCountWS = loopCountSlot = 0;

      totalTimeIn = totalTimeOut = totalTimeServoIn = totalTimeServoOut = 0;
      totalTimeWiFi = totalTimeWS = totalTimeSlot = 0;

      Serial.println("[SendStatsTask] Sent stats to WebSocket");
    }
    // Gửi mỗi 5 giây
    vTaskDelay(pdMS_TO_TICKS(5000));
  }
}

void setup()
{
  Serial.begin(115200);
  Serial.setDebugOutput(true);
  Serial.println("\n[SETUP] Starting ESP32 with FreeRTOS...");
  pinMode(BUZZER_PIN, OUTPUT);
  Wire.begin(SDA_LCD, SCL_LCD); // SDA = GPIO21, SCL = GPIO22
  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("ESP32 with FreeRTOS");
  lcd.setCursor(0, 1);
  lcd.print("Parking lot project.");

  SPI.begin();
  rfidIn.PCD_Init();
  rfidOut.PCD_Init();

  lcdClearTimer = xTimerCreate("lcdClearTimer", pdMS_TO_TICKS(5000), pdFALSE, NULL, clearLCD);
  // xTimerReset(lcdClearTimer, 0); dùng cái này để reset timer nhé
  servo1.attach(SERVO_1);
  servo2.attach(SERVO_2);
  servo1.write(180);
  servo2.write(180);
  // Task watchdog
  esp_task_wdt_init(WDT_TIMEOUT, true);

  // Semaphore
  bs_in = xSemaphoreCreateBinary();
  bs_out = xSemaphoreCreateBinary();
  while (bs_in == NULL || bs_out == NULL)
  {
    Serial.println("[SETUP] Semaphore creation failed!");
    delay(1000);
  }

  // Core 0
  xTaskCreatePinnedToCore(WiFiTask, "WiFiTask", 4096, NULL, 1, &WiFiTaskHandle, 0);
  xTaskCreatePinnedToCore(WebSocketTask, "WebSocketTask", 8192, NULL, 3, &WebSocketTaskHandle, 0);
  xTaskCreatePinnedToCore(UpdateSlotTask, "UpdateSlotTask", 4096, NULL, 2, &UpdateSlotTaskHandle, 0);
  xTaskCreatePinnedToCore(RFIDInTask, "RFIDInTask", 4096, NULL, 3, &RFIDInTaskHandle, 0);
  xTaskCreatePinnedToCore(ServoInTask, "ServoInTask", 4096, NULL, 2, &ServoInTaskHandle, 0);

  // Core 1
  xTaskCreatePinnedToCore(RFIDOutTask, "RFIDOutTask", 4096, NULL, 3, &RFIDOutTaskHandle, 1);
  xTaskCreatePinnedToCore(ServoOutTask, "ServoOutTask", 4096, NULL, 2, &ServoOutTaskHandle, 1);
  xTaskCreatePinnedToCore(TaskProfiler, "ProfilerTask", 4096, NULL, 1, &ProfilerTaskHandle, 1);
  xTaskCreatePinnedToCore(SendStatsTask, "SendStatsTask", 4096, NULL, 1, &SendStatsTaskHandle, 1);

  pinMode(IR_1, INPUT);
  pinMode(IR_2, INPUT);
  pinMode(IR_IN, INPUT);
  pinMode(IR_OUT, INPUT);
}

void loop() {}