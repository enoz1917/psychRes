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
        console.log('Database initialized successfully for save-results API');
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
      console.log('Received results data:', body);
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return NextResponse.json(
        { success: false, error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }
    
    // Validate that results array exists
    if (!body.results || !Array.isArray(body.results)) {
      return NextResponse.json(
        { success: false, error: 'Results array is required' },
        { status: 400 }
      );
    }
    
    const results = body.results;
    const savedResults = [];
    const errors = [];
    
    // Save each result
    for (const result of results) {
      try {
        // Validate required fields
        if (!result.participantId) {
          errors.push(`Missing participantId for result: ${JSON.stringify(result)}`);
          continue;
        }
        
        if (!result.taskType) {
          errors.push(`Missing taskType for result: ${JSON.stringify(result)}`);
          continue;
        }
        
        if (result.groupIndex === undefined) {
          errors.push(`Missing groupIndex for result: ${JSON.stringify(result)}`);
          continue;
        }
        
        if (!result.selectedWords || !Array.isArray(result.selectedWords)) {
          errors.push(`Invalid selectedWords for result: ${JSON.stringify(result)}`);
          continue;
        }
        
        // Save the result
        try {
          const resultId = await saveResult(result.participantId, {
            taskType: result.taskType,
            groupIndex: result.groupIndex,
            selectedWords: result.selectedWords,
            isTimeUp: !!result.isTimeUp
          });
          
          savedResults.push({ id: resultId, ...result });
        } catch (error) {
          // Check if this is a duplicate result error
          if (error instanceof Error && error.message.includes('duplicate key')) {
            console.log(`Result already exists for participant ${result.participantId}, task ${result.taskType}, group ${result.groupIndex}`);
            // We'll consider this a success since the data is already saved
            savedResults.push({ ...result, id: 'existing' });
          } else {
            console.error('Error saving individual result:', error);
            errors.push(`Failed to save result: ${error instanceof Error ? error.message : String(error)}`);
          }
        }
      } catch (error) {
        console.error('Error saving individual result:', error);
        errors.push(`Failed to save result: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    
    // Return response with results of the operation
    return NextResponse.json({
      success: savedResults.length > 0,
      savedCount: savedResults.length,
      errorCount: errors.length,
      errors: errors.length > 0 ? errors : undefined,
      savedResults: savedResults
    });
  } catch (error) {
    console.error('Error in save-results API:', error);
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