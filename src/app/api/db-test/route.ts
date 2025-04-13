import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

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
    ]) as any[];
    
    const responseTime = Date.now() - testStartTime;
    
    // Additional diagnostic query
    const databaseInfo = await sql`
      SELECT 
        current_database() as database_name, 
        version() as postgres_version,
        inet_server_addr() as server_address,
        current_setting('server_version') as server_version
    `;
    
    console.log('Database connection test successful:', result);
    console.log('Database info:', databaseInfo[0]);
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      responseTime: `${responseTime}ms`,
      diagnostics: {
        serverTime: result[0]?.server_time,
        databaseName: databaseInfo[0]?.database_name,
        postgresVersion: databaseInfo[0]?.postgres_version,
        serverVersion: databaseInfo[0]?.server_version,
        serverAddress: databaseInfo[0]?.server_address
      }
    });
  } catch (error: any) {
    console.error('Database connection test failed:', error);
    
    const errorDetails = {
      message: error.message,
      name: error.name,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      code: error.code
    };
    
    return NextResponse.json({
      success: false,
      error: `Database connection failed: ${error.message || 'Unknown error'}`,
      diagnostics: errorDetails
    }, { status: 500 });
  }
} 