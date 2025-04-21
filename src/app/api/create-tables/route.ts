import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request: Request) {
  try {
    console.log('Create tables API called');
    
    // Check if questionnaires table exists
    console.log('Checking if questionnaires table exists...');
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'questionnaires'
      ) as "exists"
    `;
    
    if (tableExists[0]?.exists) {
      console.log('Questionnaires table already exists');
      
      // Check if the table has the new columns
      const columnCheck = await sql`
        SELECT 
          EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='questionnaires' AND column_name='section2.38') as has_section2_38,
          EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='questionnaires' AND column_name='section3.15') as has_section3_15,
          EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='questionnaires' AND column_name='section4.30') as has_section4_30
      `;
      
      if (!columnCheck[0].has_section2_38) {
        console.log('Adding section2.38 column...');
        await sql`ALTER TABLE questionnaires ADD COLUMN IF NOT EXISTS "section2.38" INTEGER`;
      }
      
      if (!columnCheck[0].has_section3_15) {
        console.log('Adding section3.15 column...');
        await sql`ALTER TABLE questionnaires ADD COLUMN IF NOT EXISTS "section3.15" INTEGER`;
      }
      
      if (!columnCheck[0].has_section4_30) {
        console.log('Adding section4.30 column...');
        await sql`ALTER TABLE questionnaires ADD COLUMN IF NOT EXISTS "section4.30" INTEGER`;
      }
      
      return NextResponse.json({
        success: true,
        message: 'Table exists, checked/added new columns'
      });
    }
    
    // Create the questionnaires table
    console.log('Creating questionnaires table...');
    await sql`
      CREATE TABLE IF NOT EXISTS questionnaires (
        id SERIAL PRIMARY KEY,
        participant_id INTEGER NOT NULL REFERENCES participants(id),
        
        -- Section 1 columns (9 questions)
        "section1.1" INTEGER,
        "section1.2" INTEGER,
        "section1.3" INTEGER,
        "section1.4" INTEGER,
        "section1.5" INTEGER,
        "section1.6" INTEGER,
        "section1.7" INTEGER,
        "section1.8" INTEGER,
        "section1.9" INTEGER,
        
        -- Section 2 columns (38 questions)
        "section2.1" INTEGER,
        "section2.2" INTEGER,
        "section2.3" INTEGER,
        "section2.4" INTEGER,
        "section2.5" INTEGER,
        "section2.6" INTEGER,
        "section2.7" INTEGER,
        "section2.8" INTEGER,
        "section2.9" INTEGER,
        "section2.10" INTEGER,
        "section2.11" INTEGER,
        "section2.12" INTEGER,
        "section2.13" INTEGER,
        "section2.14" INTEGER,
        "section2.15" INTEGER,
        "section2.16" INTEGER,
        "section2.17" INTEGER,
        "section2.18" INTEGER,
        "section2.19" INTEGER,
        "section2.20" INTEGER,
        "section2.21" INTEGER,
        "section2.22" INTEGER,
        "section2.23" INTEGER,
        "section2.24" INTEGER,
        "section2.25" INTEGER,
        "section2.26" INTEGER,
        "section2.27" INTEGER,
        "section2.28" INTEGER,
        "section2.29" INTEGER,
        "section2.30" INTEGER,
        "section2.31" INTEGER,
        "section2.32" INTEGER,
        "section2.33" INTEGER,
        "section2.34" INTEGER,
        "section2.35" INTEGER,
        "section2.36" INTEGER,
        "section2.37" INTEGER,
        "section2.38" INTEGER,
        
        -- Section 3 columns (15 questions)
        "section3.1" INTEGER,
        "section3.2" INTEGER,
        "section3.3" INTEGER,
        "section3.4" INTEGER,
        "section3.5" INTEGER,
        "section3.6" INTEGER,
        "section3.7" INTEGER,
        "section3.8" INTEGER,
        "section3.9" INTEGER,
        "section3.10" INTEGER,
        "section3.11" INTEGER,
        "section3.12" INTEGER,
        "section3.13" INTEGER,
        "section3.14" INTEGER,
        "section3.15" INTEGER,
        
        -- Section 4 columns (30 questions)
        "section4.1" INTEGER,
        "section4.2" INTEGER,
        "section4.3" INTEGER,
        "section4.4" INTEGER,
        "section4.5" INTEGER,
        "section4.6" INTEGER,
        "section4.7" INTEGER,
        "section4.8" INTEGER,
        "section4.9" INTEGER,
        "section4.10" INTEGER,
        "section4.11" INTEGER,
        "section4.12" INTEGER,
        "section4.13" INTEGER,
        "section4.14" INTEGER,
        "section4.15" INTEGER,
        "section4.16" INTEGER,
        "section4.17" INTEGER,
        "section4.18" INTEGER,
        "section4.19" INTEGER,
        "section4.20" INTEGER,
        "section4.21" INTEGER,
        "section4.22" INTEGER,
        "section4.23" INTEGER,
        "section4.24" INTEGER,
        "section4.25" INTEGER,
        "section4.26" INTEGER,
        "section4.27" INTEGER,
        "section4.28" INTEGER,
        "section4.29" INTEGER,
        "section4.30" INTEGER,
        
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        UNIQUE(participant_id),
        CONSTRAINT fk_participant
          FOREIGN KEY (participant_id)
          REFERENCES participants(id)
          ON DELETE CASCADE
      )
    `;
    
    console.log('Questionnaires table created successfully');
    
    return NextResponse.json({
      success: true,
      message: 'Created questionnaires table'
    });
  } catch (error) {
    console.error('Error creating tables:', error);
    return NextResponse.json({
      success: false,
      error: String(error),
      stack: error instanceof Error ? error.stack : 'No stack trace'
    }, { status: 500 });
  }
} 