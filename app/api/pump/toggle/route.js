import { query } from '@/lib/db';
import { publishMessage } from '@/lib/mqtt';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { state } = await request.json();

    // Validate state
    if (!['ON', 'OFF'].includes(state)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid pump state. Must be ON or OFF'
      }, { status: 400 });
    }

    // Check if mode is MANUAL
    const settings = await query(
      `SELECT setting_value FROM system_settings WHERE setting_key = 'mode'`
    );

    const currentMode = settings[0]?.setting_value;

    if (currentMode === 'AUTO') {
      return NextResponse.json({
        success: false,
        message: 'Cannot control pump in AUTO mode'
      }, { status: 400 });
    }

    // Publish to MQTT
    await publishMessage(process.env.MQTT_TOPIC_PUMP, state);

    // Update system status
    await query(
      `UPDATE system_status SET current_pump_state = ? WHERE id = 1`,
      [state]
    );

    return NextResponse.json({
      success: true,
      message: `Pump turned ${state}`,
      data: { pump_state: state }
    });
  } catch (error) {
    console.error('Error toggling pump:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to toggle pump'
    }, { status: 500 });
  }
}