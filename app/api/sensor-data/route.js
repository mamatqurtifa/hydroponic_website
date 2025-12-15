import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    // Get latest sensor data
    const latestData = await query(
      `SELECT * FROM sensor_data 
       ORDER BY created_at DESC 
       LIMIT 1`
    );

    if (latestData.length === 0) {
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

    return NextResponse.json({
      success: true,
      data: latestData[0]
    });
  } catch (error) {
    console.error('Error fetching sensor data:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: error.message
    }, { status: 500 });
  }
}