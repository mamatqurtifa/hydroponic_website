USE hydroponic_db;

-- Insert dummy sensor data
INSERT INTO sensor_data (temperature, humidity, water_height, tank_height, water_percentage) VALUES
(28.5, 65.3, 12.4, 20, 62.0),
(29.1, 64.8, 11.9, 20, 59.5),
(28.8, 66.2, 12.1, 20, 60.5),
(29.3, 65.5, 11.5, 20, 57.5),
(28.6, 67.1, 12.8, 20, 64.0);

-- Insert dummy pump history
INSERT INTO pump_history (pump_state, mode, water_level, threshold, reason) VALUES
('ON', 'AUTO', 5.8, 6.0, NULL),
('OFF', 'AUTO', 16.2, 16.0, NULL),
('ON', 'MANUAL', NULL, NULL, NULL),
('OFF', 'MANUAL', NULL, NULL, NULL);

-- Insert dummy debug events
INSERT INTO debug_events (event_type, event_data, uptime, mode, pump_state) VALUES
('MQTT_CONNECTED', '{}', 125, 'AUTO', 'OFF'),
('PUMP_STATE_CHANGE', '{"waterLevel": 5.8, "threshold": 6.0}', 450, 'AUTO', 'ON'),
('MODE_CHANGE', '{"mode": "MANUAL"}', 250, 'MANUAL', 'OFF'),
('SENSOR_ERROR', '{"sensor": "DHT22", "reason": "read failed"}', 560, 'AUTO', 'OFF');