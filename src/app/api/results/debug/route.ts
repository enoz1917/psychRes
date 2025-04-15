import { NextResponse } from 'next/server';
import { initDatabase } from '@/lib/db';

export async function POST(request: Request) {
  try {
    // Initialize database
    await initDatabase();
    
    // Get the body of the request
    const body = await request.json();
    
    // Return detailed information about the request
    return NextResponse.json({
      success: true,
      receivedData: body,
      validation: {
        hasParticipantId: !!body.participantId,
        participantIdType: typeof body.participantId,
        participantIdValue: body.participantId,
        hasTaskType: !!body.taskType,
        taskTypeValue: body.taskType,
        hasGroupIndex: body.groupIndex !== undefined,
        groupIndexType: typeof body.groupIndex,
        groupIndexValue: body.groupIndex,
        hasSelectedWords: !!body.selectedWords,
        selectedWordsIsArray: Array.isArray(body.selectedWords),
        selectedWordsLength: body.selectedWords ? body.selectedWords.length : 0,
        selectedWordsValue: body.selectedWords
      }
    });
  } catch (error: unknown) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Debug failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: process.env.NODE_ENV !== 'production' && error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
} 