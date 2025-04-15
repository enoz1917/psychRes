import { NextResponse } from 'next/server';
import { initDatabase, saveQuestionnaire } from '@/lib/db';

// Initialize the database when the API is called
let databaseInitialized = false;

export async function POST(request: Request) {
  try {
    // Initialize the database if not already done
    if (!databaseInitialized) {
      try {
        const initSuccess = await initDatabase();
        if (!initSuccess) {
          throw new Error('Failed to initialize database');
        }
        databaseInitialized = true;
        console.log('Database initialized successfully for questionnaire API');
      } catch (initError) {
        console.error('Failed to initialize database:', initError);
        return NextResponse.json(
          { success: false, error: 'Database initialization failed. Please check your connection.' },
          { status: 500 }
        );
      }
    }

    // Parse request body
    let body;
    try {
      body = await request.json();
      console.log('Received questionnaire data for participant:', body.participantId);
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return NextResponse.json(
        { success: false, error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }
    
    // Validate participant ID
    if (!body.participantId) {
      return NextResponse.json(
        { success: false, error: 'Missing participantId' },
        { status: 400 }
      );
    }
    
    // Check if we're receiving an object with individual question keys (section1.1, section1.2, etc.)
    const hasIndividualQuestions = Object.keys(body).some(key => /^section\d+\.\d+$/.test(key));
    
    // Check if we're receiving the old section array format
    const hasArraySections = 
      Array.isArray(body.section1) && 
      Array.isArray(body.section2) && 
      Array.isArray(body.section3) && 
      Array.isArray(body.section4);
    
    // Prepare data for saving
    let dataToSave = body;
    
    // If we get array sections, convert to individual question format
    if (hasArraySections && !hasIndividualQuestions) {
      console.log('Converting from array sections to individual question format');
      
      // Validate section array lengths
      if (body.section1.length !== 9 || body.section2.length !== 37 || 
          body.section3.length !== 14 || body.section4.length !== 29) {
        return NextResponse.json(
          { success: false, error: 'Invalid questionnaire data structure' },
          { status: 400 }
        );
      }
      
      // Convert to individual questions
      dataToSave = { participantId: body.participantId };
      
      body.section1.forEach((value: number, index: number) => {
        dataToSave[`section1.${index + 1}`] = value;
      });
      
      body.section2.forEach((value: number, index: number) => {
        dataToSave[`section2.${index + 1}`] = value;
      });
      
      body.section3.forEach((value: number, index: number) => {
        dataToSave[`section3.${index + 1}`] = value;
      });
      
      body.section4.forEach((value: number, index: number) => {
        dataToSave[`section4.${index + 1}`] = value;
      });
    }
    // If neither format is provided, return an error
    else if (!hasArraySections && !hasIndividualQuestions) {
      return NextResponse.json(
        { success: false, error: 'Missing questionnaire sections' },
        { status: 400 }
      );
    }
    
    try {
      // Use the saveQuestionnaire function from db.ts
      const result = await saveQuestionnaire(
        body.participantId,
        dataToSave
      );
      
      // Check if there was an error
      if (result.error) {
        console.error('Error from saveQuestionnaire:', result.error);
        return NextResponse.json(
          { 
            success: false, 
            error: 'Failed to save questionnaire', 
            details: result.error 
          },
          { status: 500 }
        );
      }
      
      // Log the success, even if ID is null
      console.log('Questionnaire saved successfully, ID:', result.id || 'unknown');
      
      return NextResponse.json({
        success: true,
        questionnaireId: result.id || 'unknown',
        message: 'Questionnaire saved successfully'
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to save questionnaire', 
          details: dbError instanceof Error ? dbError.message : String(dbError) 
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Unhandled error in questionnaire API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Server error', 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve questionnaire data for a participant
export async function GET(request: Request) {
  try {
    // Initialize the database if not already done
    if (!databaseInitialized) {
      try {
        const initSuccess = await initDatabase();
        if (!initSuccess) {
          throw new Error('Failed to initialize database');
        }
        databaseInitialized = true;
        console.log('Database initialized successfully for questionnaire API');
      } catch (initError) {
        console.error('Failed to initialize database:', initError);
        return NextResponse.json(
          { success: false, error: 'Database initialization failed. Please check your connection.' },
          { status: 500 }
        );
      }
    }
    
    // Get participant ID from URL
    const url = new URL(request.url);
    const participantId = url.searchParams.get('participantId');
    
    if (!participantId) {
      return NextResponse.json(
        { success: false, error: 'Missing participantId parameter' },
        { status: 400 }
      );
    }
    
    try {
      // Use the getQuestionnaireByParticipantId function from db.ts
      const result = await import('@/lib/db').then(db => 
        db.getQuestionnaireByParticipantId(parseInt(participantId, 10))
      );
      
      if (!result) {
        return NextResponse.json(
          { success: false, error: `No questionnaire found for participant ${participantId}` },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        success: true,
        questionnaire: result
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to retrieve questionnaire', 
          details: dbError instanceof Error ? dbError.message : String(dbError) 
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Unhandled error in questionnaire API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Server error', 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
} 