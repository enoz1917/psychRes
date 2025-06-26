import { NextResponse } from 'next/server';
import { saveParticipant, initDatabase } from '@/lib/db';

// Initialize the database when the API is called instead of at startup
let databaseInitialized = false;

export async function POST(request: Request) {
  try {
    // Initialize the database if not already done
    if (!databaseInitialized) {
      try {
        await initDatabase();
        databaseInitialized = true;
        console.log('Database initialized successfully');
      } catch (initError) {
        console.error('Failed to initialize database:', initError);
        return NextResponse.json(
          { success: false, error: 'Database initialization failed. Please check your connection.' },
          { status: 500 }
        );
      }
    }

    const body = await request.json();
    
    // No field validation - all fields are now optional
    // Simply extract the data with empty string defaults
    const participantData = {
      school: (body.school || '').trim(),
      studentNumber: (body.studentNumber || '').trim(),
      course: (body.course || '').trim(),
      // removed department field
    };
    
    // Log what we're saving (for debugging purposes)
    console.log('Saving participant with data:', {
      school: participantData.school || '(empty)',
      studentNumber: participantData.studentNumber || '(empty)',
      course: participantData.course || '(empty)'
    });
    
    const participantId = await saveParticipant(participantData);
    
    return NextResponse.json({ success: true, participantId });
  } catch (error: unknown) {
    console.error('Error saving participant:', error);
    // Log more details about the error if available
    if (error instanceof Error && error.stack) {
      console.error('Error stack:', error.stack);
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to save participant', 
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
} 