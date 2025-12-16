import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    console.log('\n📡 API Request: GET /api/sensor-data');
    console.log('Time:', new Date().toISOString());
    
    // Get latest sensor data
    const latestData = await query(
      `SELECT * FROM sensor_data 
       ORDER BY created_at DESC 
       LIMIT 1`
    );

    console.log('Query result count:', latestData.length);
    
    if (latestData.length === 0) {
      console.log('⚠️ No sensor data found in database');
      return NextResponse.json({
        success: true,
        data: {
          temperature: 0,
          humidity: 0,
          water_height: 0,
          tank_height: 20,
          water_percentage: 0,
          created_at: new Date()
        }
      });
    }

    console.log('✅ Latest sensor data:');
    console.log('   - Temperature:', latestData[0].temperature, '°C');
    console.log('   - Humidity:', latestData[0].humidity, '%');
    console.log('   - Water:', latestData[0].water_percentage, '%');
    console.log('   - Created at:', latestData[0].created_at);
    console.log('');

    return NextResponse.json({
      success: true,
      data: latestData[0]
    });
  } catch (error) {
    console.error('❌ Error fetching sensor data:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: error.message
    }, { status: 500 });
  }
}