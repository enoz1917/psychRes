import { NextResponse } from 'next/server';
import { initDatabase, sql } from '@/lib/db';

export async function GET() {
  try {
    // Initialize database
    await initDatabase();
    
    console.log('Running migration to remove department column from participants table...');
    
    // First check if the column exists
    const columnExists = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'participants' AND column_name = 'department'
    `;
    
    if (columnExists.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Migration not needed - department column does not exist in participants table'
      });
    }
    
    // Remove the department column
    await sql`
      ALTER TABLE participants DROP COLUMN department
    `;
    
    return NextResponse.json({
      success: true,
      message: 'Successfully removed department column from participants table'
    });
  } catch (error: unknown) {
    console.error('Migration error:', error);
    return NextResponse.json({
      success: false,
      error: 'Migration failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
} 