import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const hours = parseInt(searchParams.get('hours')) || 24;
    const dataType = searchParams.get('type') || 'sensor';

    let results = {};

    if (dataType === 'sensor' || dataType === 'all') {
      const sensorData = await query(
        `SELECT 
          id,
          temperature,
          humidity,
          water_height,
          water_percentage,
          tank_height,
          DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as created_at
         FROM sensor_data 
         WHERE created_at >= DATE_SUB(NOW(), INTERVAL ${hours} HOUR)
         ORDER BY created_at ASC`
      );
      results.sensor = sensorData;
    }

    if (dataType === 'pump' || dataType === 'all') {
      const pumpData = await query(
        `SELECT 
          id,
          pump_state,
          mode,
          water_level,
          threshold,
          reason,
          DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as created_at
         FROM pump_history 
         WHERE created_at >= DATE_SUB(NOW(), INTERVAL ${hours} HOUR)
         ORDER BY created_at ASC`
      );
      results.pump = pumpData;
    }

    return NextResponse.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Error fetching history:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: error.message
    }, { status: 500 });
  }
}