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
    console.log('📡 Subscribing to MQTT topics...');
    console.log('   - Sensor topic:', process.env.MQTT_TOPIC_SENSOR);
    console.log('   - Debug topic:', process.env.MQTT_TOPIC_DEBUG);
    
    // Subscribe to sensor data
    await subscribeToTopic(process.env.MQTT_TOPIC_SENSOR, async (data) => {
      console.log('\n📊 ===== SENSOR DATA RECEIVED =====');
      console.log('Timestamp:', new Date().toISOString());
      console.log('Raw data:', JSON.stringify(data, null, 2));
      await saveSensorData(data);
      console.log('===================================\n');
    });

    // Subscribe to debug events
    await subscribeToTopic(process.env.MQTT_TOPIC_DEBUG, async (data) => {
      console.log('\n🐛 ===== DEBUG EVENT RECEIVED =====');
      console.log('Timestamp:', new Date().toISOString());
      console.log('Raw data:', JSON.stringify(data, null, 2));
      await saveDebugEvent(data);
      console.log('===================================\n');
    });

    isInitialized = true;
    console.log('✅ MQTT Handler initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize MQTT Handler:', error);
  }
}

async function saveSensorData(data) {
  try {
    console.log('💾 Saving sensor data to database...');
    const { temperature, humidity, waterLevel } = data;
    
    if (!waterLevel) {
      console.error('❌ Missing waterLevel in data:', data);
      return;
    }
    
    const waterHeight = waterLevel.height;
    const tankHeight = waterLevel.tankHeight;
    const waterPercentage = (waterHeight / tankHeight) * 100;

    console.log('   Temperature:', temperature, '°C');
    console.log('   Humidity:', humidity, '%');
    console.log('   Water Height:', waterHeight, 'cm');
    console.log('   Tank Height:', tankHeight, 'cm');
    console.log('   Water Percentage:', waterPercentage.toFixed(1), '%');

    const result = await query(
      `INSERT INTO sensor_data (temperature, humidity, water_height, tank_height, water_percentage)
       VALUES (?, ?, ?, ?, ?)`,
      [temperature, humidity, waterHeight, tankHeight, waterPercentage]
    );

    console.log('   Insert ID:', result.insertId);

    // Update system status
    await query(
      `UPDATE system_status SET last_sensor_update = NOW() WHERE id = 1`
    );

    console.log('✅ Sensor data saved to database successfully');
  } catch (error) {
    console.error('❌ Error saving sensor data:', error);
    console.error('   Error details:', error.message);
    console.error('   Stack:', error.stack);
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

// Auto-initialize on server-side (delayed to ensure environment is ready)
if (typeof window === 'undefined') {
  console.log('⏰ Scheduling MQTT Handler initialization...');
  setTimeout(() => {
    console.log('🚀 Starting delayed MQTT Handler initialization...');
    initializeMqttHandler().catch((error) => {
      console.error('❌ Auto-init failed:', error);
      console.log('💡 Tip: Call /api/mqtt-init to manually initialize');
    });
  }, 2000); // Wait 2 seconds for environment to be ready
}