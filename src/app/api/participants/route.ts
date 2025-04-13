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
    
    // Validate required fields
    if (!body.school || !body.studentNumber || !body.course) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }
    
    // Extract participant data
    const participantData = {
      school: body.school || '',
      studentNumber: body.studentNumber || '',
      course: body.course || '',
      // removed department field
    };
    
    const participantId = await saveParticipant(participantData);
    
    return NextResponse.json({ success: true, participantId });
  } catch (error: any) {
    console.error('Error saving participant data:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to save participant data', 
        details: error.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
} 