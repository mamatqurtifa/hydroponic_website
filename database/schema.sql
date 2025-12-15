-- Create Database
CREATE DATABASE IF NOT EXISTS hydroponic_db;
USE hydroponic_db;

-- Table: sensor_data
CREATE TABLE IF NOT EXISTS sensor_data (
  id INT AUTO_INCREMENT PRIMARY KEY,
  temperature DECIMAL(5,2) NOT NULL,
  humidity DECIMAL(5,2) NOT NULL,
  water_height DECIMAL(5,2) NOT NULL,
  tank_height INT NOT NULL,
  water_percentage DECIMAL(5,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: pump_history
CREATE TABLE IF NOT EXISTS pump_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pump_state ENUM('ON', 'OFF') NOT NULL,
  mode ENUM('AUTO', 'MANUAL') NOT NULL,
  water_level DECIMAL(5,2),
  threshold DECIMAL(5,2),
  reason VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: debug_events
CREATE TABLE IF NOT EXISTS debug_events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_type VARCHAR(50) NOT NULL,
  event_data JSON,
  uptime INT,
  mode VARCHAR(10),
  pump_state VARCHAR(10),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_event_type (event_type),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: system_settings
CREATE TABLE IF NOT EXISTS system_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(50) UNIQUE NOT NULL,
  setting_value VARCHAR(255) NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert default settings
INSERT INTO system_settings (setting_key, setting_value) VALUES
('mode', 'AUTO'),
('tank_height', '20'),
('debug', 'OFF')
ON DUPLICATE KEY UPDATE setting_value=setting_value;

-- Table: system_status (latest status only)
CREATE TABLE IF NOT EXISTS system_status (
  id INT PRIMARY KEY DEFAULT 1,
  mqtt_connected BOOLEAN DEFAULT FALSE,
  last_sensor_update TIMESTAMP NULL,
  current_mode VARCHAR(10) DEFAULT 'AUTO',
  current_pump_state VARCHAR(10) DEFAULT 'OFF',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CHECK (id = 1)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert default system status
INSERT INTO system_status (id) VALUES (1)
ON DUPLICATE KEY UPDATE id=id;