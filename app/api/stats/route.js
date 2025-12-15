import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    // Get statistics
    const stats = await query(`
      SELECT 
        COUNT(*) as total_readings,
        AVG(temperature) as avg_temperature,
        MIN(temperature) as min_temperature,
        MAX(temperature) as max_temperature,
        AVG(humidity) as avg_humidity,
        MIN(humidity) as min_humidity,
        MAX(humidity) as max_humidity,
        AVG(water_percentage) as avg_water_level,
        MIN(water_percentage) as min_water_level,
        MAX(water_percentage) as max_water_level
      FROM sensor_data
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
    `);

    const pumpStats = await query(`
      SELECT 
        pump_state,
        COUNT(*) as count,
        SUM(CASE WHEN mode = 'AUTO' THEN 1 ELSE 0 END) as auto_count,
        SUM(CASE WHEN mode = 'MANUAL' THEN 1 ELSE 0 END) as manual_count
      FROM pump_history
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
      GROUP BY pump_state
    `);

    const eventStats = await query(`
      SELECT 
        event_type,
        COUNT(*) as count
      FROM debug_events
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
      GROUP BY event_type
      ORDER BY count DESC
      LIMIT 10
    `);

    return NextResponse.json({
      success: true,
      data: {
        sensor: stats[0] || {},
        pump: pumpStats || [],
        events: eventStats || []
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: error.message
    }, { status: 500 });
  }
}