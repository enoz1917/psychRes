import { NextResponse } from 'next/server';
import { sql, initDatabase } from '@/lib/db';

interface Column {
  column_name: string;
  data_type: string;
}

export async function GET(request: Request) {
  try {
    console.log('DB check API called');
    
    // Initialize the database
    console.log('Initializing database...');
    const initResult = await initDatabase();
    console.log('Database initialization result:', initResult);
    
    // Check connection
    console.log('Testing database connection...');
    const connectionTest = await sql`SELECT 1 as connection_test`;
    console.log('Connection test result:', connectionTest);
    
    // Get list of tables
    console.log('Getting list of tables...');
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    console.log('Tables in database:', tables.map(t => t.table_name));
    
    // Check if questionnaires table exists
    console.log('Checking if questionnaires table exists...');
    const questionnairesTable = await sql`
      SELECT EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'questionnaires'
      ) as exists
    `;
    console.log('Questionnaires table exists:', questionnairesTable[0]?.exists);
    
    // If the questionnaires table exists, check its columns
    let columns: Column[] = [];
    if (questionnairesTable[0]?.exists) {
      console.log('Getting questionnaires table columns...');
      const columnResults = await sql`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'questionnaires'
        ORDER BY ordinal_position
      `;
      
      // Convert the SQL result to the Column[] type
      columns = columnResults.map(row => ({
        column_name: row.column_name,
        data_type: row.data_type
      }));
      
      console.log('Questionnaires table has', columns.length, 'columns');
      
      // Check for specific section columns
      const sectionColumns = await sql`
        SELECT 
          COUNT(*) FILTER (WHERE column_name LIKE 'section1.%') as section1_count,
          COUNT(*) FILTER (WHERE column_name LIKE 'section2.%') as section2_count,
          COUNT(*) FILTER (WHERE column_name LIKE 'section3.%') as section3_count,
          COUNT(*) FILTER (WHERE column_name LIKE 'section4.%') as section4_count
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'questionnaires'
      `;
      
      console.log('Section column counts:', sectionColumns[0]);
    }
    
    // Return all the diagnostic information
    return NextResponse.json({
      success: true,
      diagnostics: {
        databaseInitialized: initResult,
        connectionTest: connectionTest[0],
        tables: tables.map(t => t.table_name),
        questionnairesTable: {
          exists: questionnairesTable[0]?.exists,
          columnCount: columns.length,
          columns: columns.map(c => ({ name: c.column_name, type: c.data_type }))
        }
      }
    });
  } catch (error) {
    console.error('Error in DB check API:', error);
    return NextResponse.json({
      success: false,
      error: String(error),
      stack: error instanceof Error ? error.stack : 'No stack trace'
    }, { status: 500 });
  }
} 