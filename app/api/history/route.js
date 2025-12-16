import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    console.log('\n📊 API Request: GET /api/history');
    const { searchParams } = new URL(request.url);
    const hours = parseInt(searchParams.get('hours')) || 24;
    const dataType = searchParams.get('type') || 'sensor';

    console.log('   Hours:', hours);
    console.log('   Type:', dataType);

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
          created_at
         FROM sensor_data 
         WHERE created_at >= DATE_SUB(NOW(), INTERVAL ${hours} HOUR)
         ORDER BY created_at ASC`
      );
      console.log('   Sensor data count:', sensorData.length);
      if (sensorData.length > 0) {
        console.log('   First record:', sensorData[0]);
        console.log('   Last record:', sensorData[sensorData.length - 1]);
      }
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
          created_at
         FROM pump_history 
         WHERE created_at >= DATE_SUB(NOW(), INTERVAL ${hours} HOUR)
         ORDER BY created_at ASC`
      );
      console.log('   Pump data count:', pumpData.length);
      results.pump = pumpData;
    }

    console.log('✅ History data fetched\n');

    return NextResponse.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('❌ Error fetching history:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: error.message
    }, { status: 500 });
  }
}