import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request: Request) {
  try {
    console.log('Participants migration API called');
    
    // Check current table structure
    console.log('Checking current participants table structure...');
    const currentColumns = await sql`
      SELECT column_name, is_nullable, data_type
      FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'participants'
      ORDER BY ordinal_position
    `;
    
    console.log('Current participants table columns:', currentColumns);
    
    // Check if the columns are already nullable
    const schoolColumn = currentColumns.find(col => col.column_name === 'school');
    const studentNumberColumn = currentColumns.find(col => col.column_name === 'student_number');
    const courseColumn = currentColumns.find(col => col.column_name === 'course');
    
    const changes = [];
    
    // Alter columns to be nullable if they aren't already
    if (schoolColumn && schoolColumn.is_nullable === 'NO') {
      console.log('Making school column nullable...');
      await sql`ALTER TABLE participants ALTER COLUMN school DROP NOT NULL`;
      changes.push('school column made nullable');
    }
    
    if (studentNumberColumn && studentNumberColumn.is_nullable === 'NO') {
      console.log('Making student_number column nullable...');
      await sql`ALTER TABLE participants ALTER COLUMN student_number DROP NOT NULL`;
      changes.push('student_number column made nullable');
    }
    
    if (courseColumn && courseColumn.is_nullable === 'NO') {
      console.log('Making course column nullable...');
      await sql`ALTER TABLE participants ALTER COLUMN course DROP NOT NULL`;
      changes.push('course column made nullable');
    }
    
    // Get updated table structure
    const updatedColumns = await sql`
      SELECT column_name, is_nullable, data_type
      FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'participants'
      ORDER BY ordinal_position
    `;
    
    console.log('Migration completed successfully');
    
    return NextResponse.json({
      success: true,
      message: 'Participants table migration completed',
      changes: changes.length > 0 ? changes : ['No changes needed - columns were already nullable'],
      before: currentColumns,
      after: updatedColumns
    });
  } catch (error) {
    console.error('Error in participants migration:', error);
    return NextResponse.json({
      success: false,
      error: String(error),
      stack: error instanceof Error ? error.stack : 'No stack trace'
    }, { status: 500 });
  }
} 