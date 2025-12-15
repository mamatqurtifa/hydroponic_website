import { query } from '@/lib/db';
import { publishMessage } from '@/lib/mqtt';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { height } = await request.json();

    // Validate height
    const tankHeight = parseInt(height);
    if (isNaN(tankHeight) || tankHeight <= 0 || tankHeight > 100) {
      return NextResponse.json({
        success: false,
        message: 'Invalid tank height. Must be between 1 and 100 cm'
      }, { status: 400 });
    }

    // Publish to MQTT
    await publishMessage(process.env.MQTT_TOPIC_TANK_HEIGHT, tankHeight.toString());

    // Update database
    await query(
      `UPDATE system_settings SET setting_value = ? WHERE setting_key = 'tank_height'`,
      [tankHeight]
    );

    return NextResponse.json({
      success: true,
      message: `Tank height updated to ${tankHeight} cm`,
      data: { tankHeight }
    });
  } catch (error) {
    console.error('Error updating tank height:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to update tank height'
    }, { status: 500 });
  }
}