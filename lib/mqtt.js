import mqtt from 'mqtt';

let client = null;
let reconnectTimer = null;

export function getMqttClient() {
  if (!client) {
    const options = {
      username: process.env.MQTT_USERNAME,
      password: process.env.MQTT_PASSWORD,
      port: process.env.MQTT_PORT || 1883,
      reconnectPeriod: 5000,
      connectTimeout: 30000,
      clean: true,
      clientId: `hydroponic-web-${Math.random().toString(16).substr(2, 8)}`
    };

    client = mqtt.connect(process.env.MQTT_BROKER, options);

    client.on('connect', () => {
      console.log('✅ MQTT Connected');
      if (reconnectTimer) {
        clearInterval(reconnectTimer);
        reconnectTimer = null;
      }
    });

    client.on('error', (error) => {
      console.error('❌ MQTT Error:', error.message);
    });

    client.on('disconnect', () => {
      console.log('⚠️ MQTT Disconnected');
    });

    client.on('reconnect', () => {
      console.log('🔄 MQTT Reconnecting...');
    });

    client.on('offline', () => {
      console.log('📡 MQTT Offline');
    });
  }

  return client;
}

export function publishMessage(topic, message, options = {}) {
  const client = getMqttClient();
  
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('MQTT connection timeout'));
    }, 10000); // 10 second timeout

    const attemptPublish = () => {
      if (!client.connected) {
        // Wait for connection
        console.log('⏳ Waiting for MQTT connection...');
        client.once('connect', () => {
          clearTimeout(timeout);
          doPublish();
        });
      } else {
        clearTimeout(timeout);
        doPublish();
      }
    };

    const doPublish = () => {
      const payload = typeof message === 'object' ? JSON.stringify(message) : message;
      
      client.publish(topic, payload, { qos: 1, retain: false, ...options }, (error) => {
        if (error) {
          console.error('Publish error:', error);
          reject(error);
        } else {
          console.log(`📤 Published to ${topic}:`, payload);
          resolve();
        }
      });
    };

    attemptPublish();
  });
}

export function subscribeToTopic(topic, callback) {
  const client = getMqttClient();
  
  return new Promise((resolve, reject) => {
    client.subscribe(topic, { qos: 1 }, (error) => {
      if (error) {
        console.error('Subscribe error:', error);
        reject(error);
      } else {
        console.log(`📥 Subscribed to ${topic}`);
        
        client.on('message', (receivedTopic, message) => {
          if (receivedTopic === topic) {
            try {
              const payload = message.toString();
              const data = JSON.parse(payload);
              callback(data);
            } catch (e) {
              callback(message.toString());
            }
          }
        });
        
        resolve();
      }
    });
  });
}

export function isConnected() {
  return client ? client.connected : false;
}