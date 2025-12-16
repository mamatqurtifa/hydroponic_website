import { initializeMqttHandler } from '@/lib/mqttHandler';
import { NextResponse } from 'next/server';

let isInitialized = false;

export async function GET() {
  try {
    if (!isInitialized) {
      console.log('🚀 Starting MQTT Handler initialization...');
      await initializeMqttHandler();
      isInitialized = true;
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'MQTT Handler initialized',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ MQTT Init error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
