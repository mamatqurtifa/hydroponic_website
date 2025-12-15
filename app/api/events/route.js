import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 20;
    const eventType = searchParams.get('type');

    let sql = `SELECT * FROM debug_events`;
    const params = [];

    if (eventType) {
      sql += ` WHERE event_type = ?`;
      params.push(eventType);
    }

    sql += ` ORDER BY created_at DESC LIMIT ${limit}`; // PERBAIKAN: Langsung masukkan ke query

    const events = await query(sql, params);

    // Parse JSON event_data
    const formattedEvents = events.map(event => ({
      ...event,
      event_data: event.event_data 
        ? (typeof event.event_data === 'string' ? JSON.parse(event.event_data) : event.event_data)
        : null
    }));

    return NextResponse.json({
      success: true,
      data: formattedEvents
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: error.message
    }, { status: 500 });
  }
}