import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

// Define result type
interface ConnectionTestResult {
  connection_test: number;
  server_time: Date;
}

interface DatabaseInfoResult {
  database_name: string;
  postgres_version: string;
  server_address: string;
  server_version: string;
}

// Add error interface
interface DatabaseError extends Error {
  code?: string;
}

export async function GET() {
  try {
    console.log('Testing database connection...');
    
    // Test basic connection with timeout
    const testStartTime = Date.now();
    const result = await Promise.race([
      sql`SELECT 1 as connection_test, now() as server_time`,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout after 5000ms')), 5000)
      )
    ]) as ConnectionTestResult[];
    
    const responseTime = Date.now() - testStartTime;
    
    // Additional diagnostic query
    const databaseInfo = await sql`
      SELECT 
        current_database() as database_name, 
        version() as postgres_version,
        inet_server_addr() as server_address,
        current_setting('server_version') as server_version
    ` as DatabaseInfoResult[];
    
    console.log('Database connection test successful:', result);
    console.log('Database info:', databaseInfo[0]);
    
    return NextResponse.json({
      success: true,
      connection: {
        test: result[0].connection_test === 1,
        responseTime: `${responseTime}ms`,
        serverTime: result[0].server_time
      },
      database: databaseInfo[0]
    });
  } catch (error: unknown) {
    console.error('Database connection test failed:', error);
    
    const errorDetails = {
      message: error instanceof Error ? error.message : 'Unknown error',
      name: error instanceof Error ? error.name : 'Unknown',
      stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined,
      code: error instanceof Error && 'code' in error ? (error as DatabaseError).code : undefined
    };
    
    return NextResponse.json({
      success: false,
      error: `Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      diagnostics: errorDetails
    }, { status: 500 });
  }
} 