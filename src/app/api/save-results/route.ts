import { NextResponse } from 'next/server';
import { saveResult, initDatabase } from '@/lib/db';

// Initialize the database when the API is called
let databaseInitialized = false;

// Set a longer timeout for Vercel serverless functions
export const config = {
  maxDuration: 60, // Extend to 60 seconds
};

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
      console.log('Received results data with', body.results?.length || 0, 'results');
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
    
    // Process results in smaller batches to avoid timeouts
    const batchSize = 10;
    const batches = [];
    
    for (let i = 0; i < results.length; i += batchSize) {
      batches.push(results.slice(i, i + batchSize));
    }
    
    console.log(`Processing ${results.length} results in ${batches.length} batches`);
    
    // Process each batch
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      console.log(`Processing batch ${batchIndex + 1} of ${batches.length} with ${batch.length} results`);
      
      // Define the result type
      interface ResultItem {
        participantId: number;
        taskType: string;
        groupIndex: number;
        selectedWords: string[];
        isTimeUp?: boolean;
        [key: string]: any;
      }
      
      // Save each result in the batch using Promise.all for parallel processing
      const batchPromises = batch.map(async (result: ResultItem) => {
        try {
          // Validate required fields
          if (!result.participantId) {
            return { error: `Missing participantId for result: ${JSON.stringify(result)}` };
          }
          
          if (!result.taskType) {
            return { error: `Missing taskType for result: ${JSON.stringify(result)}` };
          }
          
          if (result.groupIndex === undefined) {
            return { error: `Missing groupIndex for result: ${JSON.stringify(result)}` };
          }
          
          if (!result.selectedWords || !Array.isArray(result.selectedWords)) {
            return { error: `Invalid selectedWords for result: ${JSON.stringify(result)}` };
          }
          
          // Save the result
          try {
            const resultId = await saveResult(result.participantId, {
              taskType: result.taskType,
              groupIndex: result.groupIndex,
              selectedWords: result.selectedWords,
              isTimeUp: !!result.isTimeUp
            });
            
            return { success: true, id: resultId, ...result };
          } catch (error) {
            // Check if this is a duplicate result error
            if (error instanceof Error && error.message.includes('duplicate key')) {
              console.log(`Result already exists for participant ${result.participantId}, task ${result.taskType}, group ${result.groupIndex}`);
              // We'll consider this a success since the data is already saved
              return { success: true, id: 'existing', ...result };
            } else {
              console.error('Error saving individual result:', error);
              return { error: `Failed to save result: ${error instanceof Error ? error.message : String(error)}` };
            }
          }
        } catch (error) {
          console.error('Error saving individual result:', error);
          return { error: `Failed to save result: ${error instanceof Error ? error.message : String(error)}` };
        }
      });
      
      const batchResults = await Promise.all(batchPromises);
      
      // Process batch results
      for (const result of batchResults) {
        if (result.error) {
          errors.push(result.error);
        } else if (result.success) {
          savedResults.push(result);
        }
      }
    }
    
    // Return response with results of the operation
    return NextResponse.json({
      success: savedResults.length > 0,
      savedCount: savedResults.length,
      errorCount: errors.length,
      errors: errors.length > 0 ? errors : undefined,
      savedResults: savedResults.length > 0 ? { count: savedResults.length } : undefined
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