import { query } from '@/lib/db';
import { publishMessage } from '@/lib/mqtt';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { debug } = await request.json();

    // Validate debug
    if (!['ON', 'OFF'].includes(debug)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid debug value. Must be ON or OFF'
      }, { status: 400 });
    }

    // Publish to MQTT
    await publishMessage(process.env.MQTT_TOPIC_DEBUG_SETTING, debug);

    // Update database
    await query(
      `UPDATE system_settings SET setting_value = ? WHERE setting_key = 'debug'`,
      [debug]
    );

    return NextResponse.json({
      success: true,
      message: `Debug mode ${debug}`,
      data: { debug }
    });
  } catch (error) {
    console.error('Error changing debug mode:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to change debug mode'
    }, { status: 500 });
  }
}