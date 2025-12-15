'use client';

import { useState, useEffect } from 'react';
import { Activity, Droplets, Thermometer, Wind, Power, Database, Wifi } from 'lucide-react';
import MetricCard from '@/components/MetricCard';
import WaterLevelGauge from '@/components/WaterLevelGauge';
import ControlPanel from '@/components/ControlPanel';
import RecentEvents from '@/components/RecentEvents';
import StatusIndicator from '@/components/StatusIndicator';
import HistoryChart from '@/components/HistoryChart';

export default function DashboardPage() {
  const [sensorData, setSensorData] = useState({
    temperature: 0,
    humidity: 0,
    water_height: 0,
    tank_height: 20,
    water_percentage: 0,
    created_at: null
  });

  const [systemStatus, setSystemStatus] = useState({
    current_mode: 'AUTO',
    current_pump_state: 'OFF',
    mqtt_connected: false,
    db_connected: false,
    last_sensor_update: null,
    settings: {
      mode: 'AUTO',
      tank_height: '20',
      debug: 'OFF'
    }
  });

  const [events, setEvents] = useState([]);
  const [historyData, setHistoryData] = useState({
    sensor: [],
    pump: []
  });
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Fetch sensor data
  const fetchSensorData = async () => {
    try {
      const response = await fetch('/api/sensor-data');
      const result = await response.json();
      
      if (result.success && result.data) {
        // Pastikan semua nilai adalah number
        setSensorData({
          temperature: parseFloat(result.data.temperature) || 0,
          humidity: parseFloat(result.data.humidity) || 0,
          water_height: parseFloat(result.data.water_height) || 0,
          tank_height: parseInt(result.data.tank_height) || 20,
          water_percentage: parseFloat(result.data.water_percentage) || 0,
          created_at: result.data.created_at
        });
        setLastUpdate(new Date());
        setIsDataLoaded(true);
      }
    } catch (error) {
      console.error('Error fetching sensor data:', error);
    }
  };

  // Fetch system status
  const fetchSystemStatus = async () => {
    try {
      const response = await fetch('/api/system-status');
      const result = await response.json();
      
      if (result.success && result.data) {
        setSystemStatus({
          current_mode: result.data.current_mode || 'AUTO',
          current_pump_state: result.data.current_pump_state || 'OFF',
          mqtt_connected: result.data.mqtt_connected || false,
          db_connected: true,
          last_sensor_update: result.data.last_sensor_update,
          settings: {
            mode: result.data.settings?.mode || 'AUTO',
            tank_height: result.data.settings?.tank_height || '20',
            debug: result.data.settings?.debug || 'OFF'
          }
        });
      }
    } catch (error) {
      console.error('Error fetching system status:', error);
    }
  };

  // Fetch recent events
  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events?limit=10');
      const result = await response.json();
      
      if (result.success && result.data) {
        setEvents(result.data);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  // Fetch history data
  const fetchHistory = async () => {
    try {
      const response = await fetch('/api/history?hours=24&type=all');
      const result = await response.json();
      
      if (result.success && result.data) {
        setHistoryData({
          sensor: result.data.sensor || [],
          pump: result.data.pump || []
        });
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  // Initial load
  useEffect(() => {
    fetchSensorData();
    fetchSystemStatus();
    fetchEvents();
    fetchHistory();

    // Polling every 5 seconds for sensor data
    const sensorInterval = setInterval(fetchSensorData, 5000);
    
    // Polling every 3 seconds for system status
    const statusInterval = setInterval(fetchSystemStatus, 3000);
    
    // Polling every 10 seconds for events
    const eventsInterval = setInterval(fetchEvents, 10000);
    
    // Polling every 30 seconds for history
    const historyInterval = setInterval(fetchHistory, 30000);

    return () => {
      clearInterval(sensorInterval);
      clearInterval(statusInterval);
      clearInterval(eventsInterval);
      clearInterval(historyInterval);
    };
  }, []);

  // Handle mode change
  const handleModeChange = async (newMode) => {
    setLoading(true);
    try {
      const response = await fetch('/api/settings/mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: newMode })
      });
      
      const result = await response.json();
      
      if (result.success) {
        await fetchSystemStatus();
        await fetchEvents();
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Error changing mode:', error);
      alert('Failed to change mode');
    }
    setLoading(false);
  };

  // Handle pump toggle
  const handlePumpToggle = async () => {
    if (systemStatus.current_mode === 'AUTO') {
      alert('Cannot control pump in AUTO mode');
      return;
    }

    setLoading(true);
    const newState = systemStatus.current_pump_state === 'ON' ? 'OFF' : 'ON';
    
    try {
      const response = await fetch('/api/pump/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state: newState })
      });
      
      const result = await response.json();
      
      if (result.success) {
        await fetchSystemStatus();
        await fetchEvents();
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Error toggling pump:', error);
      alert('Failed to toggle pump');
    }
    setLoading(false);
  };

  // Handle tank height change
  const handleTankHeightChange = async (height) => {
    if (!height || height < 1 || height > 100) return;

    setLoading(true);
    try {
      const response = await fetch('/api/settings/tank-height', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ height: parseInt(height) })
      });
      
      const result = await response.json();
      
      if (result.success) {
        await fetchSystemStatus();
        await fetchEvents();
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Error updating tank height:', error);
      alert('Failed to update tank height');
    }
    setLoading(false);
  };

  // Handle debug toggle
  const handleDebugToggle = async (debugMode) => {
    setLoading(true);
    try {
      const response = await fetch('/api/settings/debug', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ debug: debugMode })
      });
      
      const result = await response.json();
      
      if (result.success) {
        await fetchSystemStatus();
        await fetchEvents();
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Error changing debug mode:', error);
      alert('Failed to change debug mode');
    }
    setLoading(false);
  };

  // Determine status colors - dengan validasi
  const getTemperatureStatus = () => {
    const temp = parseFloat(sensorData.temperature) || 0;
    if (temp >= 20 && temp <= 30) return 'good';
    if (temp > 30 && temp <= 35) return 'warning';
    return 'critical';
  };

  const getHumidityStatus = () => {
    const humidity = parseFloat(sensorData.humidity) || 0;
    if (humidity >= 50 && humidity <= 70) return 'good';
    if (humidity >= 40 && humidity <= 80) return 'warning';
    return 'critical';
  };

  const getWaterLevelStatus = () => {
    const percentage = parseFloat(sensorData.water_percentage) || 0;
    if (percentage >= 80) return 'good';
    if (percentage >= 30) return 'warning';
    return 'critical';
  };

  // Helper function untuk format angka dengan aman
  const formatNumber = (value, decimals = 1) => {
    const num = parseFloat(value);
    return isNaN(num) ? '0.0' : num.toFixed(decimals);
  };

  // Show loading state jika data belum dimuat
  if (!isDataLoaded) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Smart Hydroponic System
          </h1>
          <p className="text-gray-600">Real-time monitoring and control dashboard</p>
        </div>

        {/* Connection Status */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-wrap gap-6 items-center">
            <StatusIndicator 
              label="MQTT" 
              status={systemStatus.mqtt_connected} 
              icon={Wifi} 
            />
            <StatusIndicator 
              label="Database" 
              status={true} 
              icon={Database} 
            />
            <div className="ml-auto flex items-center gap-2">
              <Activity className="text-green-500" />
              <span className="text-sm text-gray-700">
                Last update: {lastUpdate.toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <MetricCard
            icon={Thermometer}
            label="Temperature"
            value={formatNumber(sensorData.temperature, 1)}
            unit="°C"
            status={getTemperatureStatus()}
          />
          <MetricCard
            icon={Wind}
            label="Humidity"
            value={formatNumber(sensorData.humidity, 1)}
            unit="%"
            status={getHumidityStatus()}
          />
          <MetricCard
            icon={Droplets}
            label="Water Level"
            value={formatNumber(sensorData.water_percentage, 0)}
            unit="%"
            status={getWaterLevelStatus()}
          />
          <MetricCard
            icon={Power}
            label="Pump Status"
            value={systemStatus.current_pump_state || 'OFF'}
            unit=""
            status={systemStatus.current_pump_state === 'ON' ? 'good' : 'warning'}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-1">
            <WaterLevelGauge
              height={parseFloat(sensorData.water_height) || 0}
              tankHeight={parseInt(sensorData.tank_height) || 20}
            />
          </div>
          
          <div className="lg:col-span-1">
            <ControlPanel
              mode={systemStatus.current_mode}
              pumpState={systemStatus.current_pump_state === 'ON'}
              tankHeight={systemStatus.settings.tank_height}
              debug={systemStatus.settings.debug}
              onModeChange={handleModeChange}
              onPumpToggle={handlePumpToggle}
              onTankHeightChange={handleTankHeightChange}
              onDebugToggle={handleDebugToggle}
              disabled={loading}
            />
          </div>

          <div className="lg:col-span-1">
            <RecentEvents events={events} />
          </div>
        </div>

        {/* History Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <HistoryChart
            data={historyData.sensor || []}
            dataKey="temperature"
            title="Temperature History (24h)"
            color="text-red-500"
            unit="°C"
          />
          <HistoryChart
            data={historyData.sensor || []}
            dataKey="humidity"
            title="Humidity History (24h)"
            color="text-blue-500"
            unit="%"
          />
          <HistoryChart
            data={historyData.sensor || []}
            dataKey="water_percentage"
            title="Water Level History (24h)"
            color="text-cyan-500"
            unit="%"
          />
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Pump Activity (24h)</h3>
            <div className="space-y-3">
              {historyData.pump && historyData.pump.length > 0 ? (
                historyData.pump.slice(0, 5).map((activity, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <span className={`font-medium ${activity.pump_state === 'ON' ? 'text-green-600' : 'text-red-600'}`}>
                        {activity.pump_state}
                      </span>
                      <span className="text-sm text-gray-600 ml-2">({activity.mode})</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(activity.created_at).toLocaleString('id-ID')}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm text-center py-4">No pump activity recorded</p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>Smart Hydroponic Controller v3 - Powered by ESP32 & Next.js</p>
        </div>
      </div>
    </div>
  );
}