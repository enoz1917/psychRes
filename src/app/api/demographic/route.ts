import { NextResponse } from 'next/server';
import { saveDemographic, initDatabase, getDemographicByParticipantId } from '@/lib/db';

// Initialize the database when the API is called
let databaseInitialized = false;

// Add error interface
interface DatabaseError extends Error {
  code?: string;
  cause?: unknown;
  stack?: string;
}

export async function POST(request: Request) {
  try {
    // Initialize the database if not already done
    if (!databaseInitialized) {
      try {
        await initDatabase();
        databaseInitialized = true;
        console.log('Database initialized successfully');
        
        // Check table structure
        try {
          const { sql } = await import('@/lib/db');
          const tableInfo = await sql`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'demographic'
          `;
          console.log('Demographic table structure:', JSON.stringify(tableInfo, null, 2));
        } catch (schemaError) {
          console.error('Error checking table schema:', schemaError);
        }
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
    if (!body.participantId) {
      return NextResponse.json(
        { success: false, error: 'Participant ID is required' },
        { status: 400 }
      );
    }
    
    // Extract participant ID and demographic data
    const participantId = body.participantId;
    const demographicData = {
      gender: body.gender || '',
      age: body.age || '',
      education: body.education || '',
      department: body.department || '',
      year: body.year || '',
      maritalStatus: body.maritalStatus || '',
      employmentStatus: body.employmentStatus || '',
      livingWith: body.livingWith || [],
      longestResidence: body.longestResidence || '',
      currentSocialStatus: body.currentSocialStatus || '',
      childhoodSocialStatus: body.childhoodSocialStatus || '',
      monthlyIncome: body.monthlyIncome || ''
    };
    
    // Save demographic data
    const demographicId = await saveDemographic(participantId, demographicData);
    
    return NextResponse.json({ 
      success: true, 
      demographicId,
      message: 'Demographic data saved successfully' 
    });
  } catch (error: unknown) {
    console.error('Error saving demographic data:', error);
    // Log more details about the error
    if (error instanceof Error && error.stack) {
      console.error('Error stack:', error.stack);
    }
    if (error instanceof Error && 'cause' in error) {
      console.error('Error cause:', (error as DatabaseError).cause);
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to save demographic data', 
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: process.env.NODE_ENV !== 'production' && error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
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

    // Get demographic data for the participant
    const demographic = await getDemographicByParticipantId(participantIdNumber);
    
    return NextResponse.json({ 
      success: true, 
      demographic: demographic ? {
        gender: demographic.gender,
        age: demographic.age,
        education: demographic.education,
        department: demographic.department,
        year: demographic.year,
        maritalStatus: demographic.marital_status,
        employmentStatus: demographic.employment_status,
        livingWith: demographic.living_with,
        longestResidence: demographic.longest_residence,
        currentSocialStatus: demographic.current_social_status,
        childhoodSocialStatus: demographic.childhood_social_status,
        monthlyIncome: demographic.monthly_income,
      } : null
    });
  } catch (error: unknown) {
    console.error('Error getting demographic data:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get demographic data', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 