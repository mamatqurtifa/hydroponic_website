import { getMqttClient, subscribeToTopic } from './mqtt.js';
import { query } from './db.js';

let isInitialized = false;

export async function initializeMqttHandler() {
  if (isInitialized) {
    console.log('MQTT Handler already initialized');
    return;
  }

  console.log('🚀 Initializing MQTT Handler...');

  try {
    // Subscribe to sensor data
    await subscribeToTopic(process.env.MQTT_TOPIC_SENSOR, async (data) => {
      console.log('Received sensor data:', data);
      await saveSensorData(data);
    });

    // Subscribe to debug events
    await subscribeToTopic(process.env.MQTT_TOPIC_DEBUG, async (data) => {
      console.log('Received debug event:', data);
      await saveDebugEvent(data);
    });

    isInitialized = true;
    console.log('✅ MQTT Handler initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize MQTT Handler:', error);
  }
}

async function saveSensorData(data) {
  try {
    const { temperature, humidity, waterLevel } = data;
    const waterHeight = waterLevel.height;
    const tankHeight = waterLevel.tankHeight;
    const waterPercentage = (waterHeight / tankHeight) * 100;

    await query(
      `INSERT INTO sensor_data (temperature, humidity, water_height, tank_height, water_percentage)
       VALUES (?, ?, ?, ?, ?)`,
      [temperature, humidity, waterHeight, tankHeight, waterPercentage]
    );

    // Update system status
    await query(
      `UPDATE system_status SET last_sensor_update = NOW() WHERE id = 1`
    );

    console.log('✅ Sensor data saved to database');
  } catch (error) {
    console.error('❌ Error saving sensor data:', error);
  }
}

async function saveDebugEvent(data) {
  try {
    const { event, uptime, mode, pump, ...eventData } = data;

    await query(
      `INSERT INTO debug_events (event_type, event_data, uptime, mode, pump_state)
       VALUES (?, ?, ?, ?, ?)`,
      [event, JSON.stringify(eventData), uptime, mode, pump]
    );

    // If pump state change, save to pump history
    if (event === 'PUMP_STATE_CHANGE') {
      await query(
        `INSERT INTO pump_history (pump_state, mode, water_level, threshold, reason)
         VALUES (?, ?, ?, ?, ?)`,
        [
          pump,
          mode,
          eventData.waterLevel || null,
          eventData.threshold || null,
          eventData.reason || null
        ]
      );

      // Update system status
      await query(
        `UPDATE system_status SET current_pump_state = ?, current_mode = ? WHERE id = 1`,
        [pump, mode]
      );
    }

    // If mode change, update system status
    if (event === 'MODE_CHANGE') {
      await query(
        `UPDATE system_status SET current_mode = ? WHERE id = 1`,
        [mode]
      );
    }

    console.log('✅ Debug event saved to database');
  } catch (error) {
    console.error('❌ Error saving debug event:', error);
  }
}

// Initialize on module load (for server-side)
if (typeof window === 'undefined') {
  initializeMqttHandler().catch(console.error);
}