import { NextResponse } from 'next/server';
import { saveResult, initDatabase } from '@/lib/db';

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
        console.log('Database initialized successfully for results API');
      } catch (initError) {
        console.error('Failed to initialize database:', initError);
        return NextResponse.json(
          { success: false, error: 'Database initialization failed. Please check your connection.' },
          { status: 500 }
        );
      }
    }

    let body;
    
    try {
      body = await request.json();
      console.log('Received result data:', body);
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return NextResponse.json(
        { success: false, error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }
    
    // Data validation - collect all validation errors
    const validationErrors = [];
    
    if (!body.participantId) {
      validationErrors.push('Missing participantId');
    } else if (typeof body.participantId !== 'number') {
      validationErrors.push(`Invalid participantId: expected number, got ${typeof body.participantId}`);
    }
    
    if (!body.taskType) {
      validationErrors.push('Missing taskType');
    }
    
    if (body.groupIndex === undefined) {
      validationErrors.push('Missing groupIndex');
    } else if (typeof body.groupIndex !== 'number') {
      validationErrors.push(`Invalid groupIndex: expected number, got ${typeof body.groupIndex}`);
    }
    
    // Validate selectedWords is an array
    if (!body.selectedWords) {
      validationErrors.push('Missing selectedWords');
    } else if (!Array.isArray(body.selectedWords)) {
      validationErrors.push('selectedWords must be an array');
    }
    
    // Return all validation errors if any
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed',
          details: validationErrors,
          receivedData: body
        },
        { status: 400 }
      );
    }
    
    // Ensure selectedWords is an array (defensive coding)
    const selectedWords = Array.isArray(body.selectedWords) ? body.selectedWords : [];
    
    // Ensure isTimeUp is a boolean
    const isTimeUp = !!body.isTimeUp;
    
    // Save result data
    try {
      console.log('Saving result with data:', {
        participantId: body.participantId,
        taskType: body.taskType,
        groupIndex: body.groupIndex,
        selectedWords: selectedWords,
        isTimeUp: isTimeUp
      });
      
      const resultId = await saveResult(body.participantId, {
        taskType: body.taskType,
        groupIndex: body.groupIndex,
        selectedWords: selectedWords,
        isTimeUp: isTimeUp
      });
      
      return NextResponse.json({ 
        success: true, 
        resultId,
        message: 'Result saved successfully' 
      });
    } catch (saveError: any) {
      console.error('Error in saveResult function:', saveError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Database operation failed', 
          details: saveError.message || 'Unknown database error',
          stack: process.env.NODE_ENV !== 'production' ? saveError.stack : undefined
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error saving result:', error);
    if (error.stack) {
      console.error('Error stack:', error.stack);
    }
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to save result', 
        details: error.message || 'Unknown error',
        stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
} 