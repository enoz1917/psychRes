import { NextResponse } from 'next/server';
import { initDatabase, sql } from '@/lib/db';

export async function GET(request: Request) {
  try {
    // Initialize database
    await initDatabase();
    
    // Get participantId from query parameters
    const { searchParams } = new URL(request.url);
    const participantId = searchParams.get('participantId');
    
    if (!participantId) {
      return NextResponse.json(
        { success: false, error: 'Participant ID is required' },
        { status: 400 }
      );
    }
    
    // Parse to number
    const participantIdNumber = parseInt(participantId, 10);
    if (isNaN(participantIdNumber)) {
      return NextResponse.json(
        { success: false, error: 'Invalid participant ID' },
        { status: 400 }
      );
    }
    
    // Check if participant exists
    const participant = await sql`
      SELECT * FROM participants WHERE id = ${participantIdNumber}
    `;
    
    // Get table structure
    const tableInfo = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'demographic'
    `;
    
    return NextResponse.json({
      success: true,
      message: 'Database test completed',
      participantExists: participant.length > 0,
      participant: participant.length > 0 ? participant[0] : null,
      demographicTableStructure: tableInfo
    });
  } catch (error: unknown) {
    console.error('Test endpoint error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Test failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
} 