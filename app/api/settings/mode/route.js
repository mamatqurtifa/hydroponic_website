import { query } from '@/lib/db';
import { publishMessage } from '@/lib/mqtt';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { mode } = await request.json();

    // Validate mode
    if (!['AUTO', 'MANUAL'].includes(mode)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid mode. Must be AUTO or MANUAL'
      }, { status: 400 });
    }

    // Publish to MQTT
    await publishMessage(process.env.MQTT_TOPIC_MODE, mode);

    // Update database
    await query(
      `UPDATE system_settings SET setting_value = ? WHERE setting_key = 'mode'`,
      [mode]
    );

    await query(
      `UPDATE system_status SET current_mode = ? WHERE id = 1`,
      [mode]
    );

    return NextResponse.json({
      success: true,
      message: `Mode changed to ${mode}`,
      data: { mode }
    });
  } catch (error) {
    console.error('Error changing mode:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to change mode',
      error: error.message
    }, { status: 500 });
  }
}