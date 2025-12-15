import { query } from '@/lib/db';
import { isConnected } from '@/lib/mqtt';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    // Get system status
    const status = await query(
      `SELECT * FROM system_status WHERE id = 1`
    );

    // Get current settings
    const settings = await query(
      `SELECT setting_key, setting_value FROM system_settings`
    );

    const settingsObj = {};
    settings.forEach(setting => {
      settingsObj[setting.setting_key] = setting.setting_value;
    });

    const mqttConnected = isConnected();

    return NextResponse.json({
      success: true,
      data: {
        mqtt_connected: mqttConnected,
        last_sensor_update: status[0]?.last_sensor_update,
        current_mode: status[0]?.current_mode || settingsObj.mode,
        current_pump_state: status[0]?.current_pump_state || 'OFF',
        settings: settingsObj
      }
    });
  } catch (error) {
    console.error('Error fetching system status:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}