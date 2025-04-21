import { neon, neonConfig } from '@neondatabase/serverless';
import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get the database URL from the environment
const databaseUrl = process.env.NEON_DATABASE_URL;

if (!databaseUrl) {
  console.error('NEON_DATABASE_URL is not defined in environment variables');
  throw new Error('NEON_DATABASE_URL is not defined in environment variables');
}

// Log that we have a DB URL (without revealing the actual URL)
console.log('Database URL is configured:', databaseUrl.substring(0, 20) + '...');

// Configure Neon for serverless environments
neonConfig.fetchConnectionCache = true;

// Create a SQL executor function
export const sql = neon(databaseUrl);

// For more complex operations, create a connection pool
export const pool = new Pool({
  connectionString: databaseUrl,
});

let databaseInitialized = false;

// Database initialization function
export async function initDatabase() {
  if (databaseInitialized) {
    console.log('Database already initialized, skipping...');
    return true;
  }

  console.log('Initializing database...');
  
  if (!databaseUrl) {
    console.error('No database URL provided - running in offline mode');
    return false;
  }

  try {
    // Test connection with a timeout
    const testConnection = async () => {
      try {
        const result = await sql`SELECT 1 as connection_test`;
        return result;
      } catch (error) {
        console.error('Connection test failed:', error);
        return null;
      }
    };

    const result = await testConnection();
    if (!result) {
      console.error('Could not establish database connection');
      return false;
    }

    console.log('Database connection successful');
    
    try {
      // Create participants table
      console.log('Creating participants table...');
      await sql`
        CREATE TABLE IF NOT EXISTS participants (
          id SERIAL PRIMARY KEY,
          student_number TEXT NOT NULL,
          school TEXT NOT NULL,
          course TEXT NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW()
        )
      `;
      console.log('Participants table ready');

      // Create demographic table
      console.log('Creating demographic table...');
      await sql`
        CREATE TABLE IF NOT EXISTS demographic (
          id SERIAL PRIMARY KEY,
          participant_id INTEGER NOT NULL REFERENCES participants(id),
          gender TEXT,
          age TEXT,
          education TEXT,
          department TEXT,
          year TEXT,
          marital_status TEXT,
          employment_status TEXT,
          living_with TEXT[],
          longest_residence TEXT,
          current_social_status TEXT,
          childhood_social_status TEXT,
          monthly_income TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          CONSTRAINT fk_participant
            FOREIGN KEY (participant_id)
            REFERENCES participants(id)
            ON DELETE CASCADE
        )
      `;
      console.log('Demographic table ready');

      // Create results table
      console.log('Creating results table...');
      try {
        await sql`
          CREATE TABLE IF NOT EXISTS results (
            id SERIAL PRIMARY KEY,
            participant_id INTEGER NOT NULL REFERENCES participants(id),
            task_type TEXT NOT NULL,
            group_index INTEGER NOT NULL,
            selected_words TEXT[] NOT NULL,
            is_time_up BOOLEAN NOT NULL DEFAULT FALSE,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            CONSTRAINT fk_participant
              FOREIGN KEY (participant_id)
              REFERENCES participants(id)
              ON DELETE CASCADE
          )
        `;
        console.log('Results table created successfully');

        // Remove the unique constraint if it exists
        try {
          await sql`
            DO $$ 
            BEGIN 
              IF EXISTS (
                SELECT 1 
                FROM pg_constraint 
                WHERE conname = 'unique_participant_task_group'
              ) THEN
                ALTER TABLE results 
                DROP CONSTRAINT unique_participant_task_group;
                RAISE NOTICE 'Removed unique constraint from results table';
              ELSE
                RAISE NOTICE 'No unique constraint found on results table';
              END IF;
            END $$;
          `;
          console.log('Unique constraint check/removal completed');
        } catch (constraintError) {
          console.error('Error while removing unique constraint:', constraintError);
          // Continue anyway as the constraint might not exist
        }
      } catch (resultsError) {
        console.error('Error creating results table:', resultsError);
        throw resultsError;
      }

      // Create questionnaires table
      console.log('Creating questionnaires table...');
      try {
        // First drop the old table if it exists
        await sql`
          DROP TABLE IF EXISTS questionnaires CASCADE
        `;
        console.log('Dropped old questionnaires table if it existed');
        
        // Create new questionnaires table with individual columns
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
            
            -- Section 2 columns (37 questions)
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
            
            -- Section 3 columns (14 questions)
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
            
            -- Section 4 columns (29 questions)
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
            
            created_at TIMESTAMP NOT NULL DEFAULT NOW(),
            UNIQUE(participant_id),
            CONSTRAINT fk_participant
              FOREIGN KEY (participant_id)
              REFERENCES participants(id)
              ON DELETE CASCADE
          )
        `;
        console.log('Questionnaires table created successfully with individual columns');
      } catch (questionnairesError) {
        console.error('Error creating questionnaires table:', questionnairesError);
        throw questionnairesError;
      }

      databaseInitialized = true;
      console.log('Database initialization complete');
      return true;
    } catch (error) {
      console.error('Error creating tables:', error);
      return false;
    }
  } catch (error) {
    console.error('Database initialization failed:', error);
    return false;
  }
}

// Function to save participant data and return the ID
export async function saveParticipant(participantData: {
  school: string;
  studentNumber: string;
  course: string;
  department?: string; // keep for backward compatibility
}) {
  console.log('Saving participant data:', {
    studentNumber: participantData.studentNumber,
    school: participantData.school,
    course: participantData.course
  });
  
  try {
    const result = await sql`
      INSERT INTO participants (
        student_number, 
        school, 
        course
      ) 
      VALUES (
        ${participantData.studentNumber}, 
        ${participantData.school},
        ${participantData.course}
      )
      RETURNING id
    `;
    
    console.log('Participant saved successfully, ID:', result[0]?.id);
    
    if (!result[0] || !result[0].id) {
      throw new Error('Failed to get ID after saving participant');
    }
    
    return result[0].id;
  } catch (error) {
    console.error('Error saving participant data:', error);
    throw new Error(`Failed to save participant: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Function to save result data
export async function saveResult(
  participantId: number,
  result: {
    taskType: string;
    groupIndex: number;
    selectedWords: string[];
    isTimeUp: boolean;
  }
) {
  console.log(`Attempting to save result for participant ${participantId}:`, {
    taskType: result.taskType,
    groupIndex: result.groupIndex,
    selectedWords: result.selectedWords,
    isTimeUp: result.isTimeUp
  });
  
  try {
    // First verify the participant exists
    const participant = await sql`
      SELECT id FROM participants WHERE id = ${participantId}
    `;
    
    if (participant.length === 0) {
      throw new Error(`Participant with ID ${participantId} not found`);
    }
    
    console.log('Participant verified, proceeding with save...');
    
    const insertResult = await sql`
      INSERT INTO results (
        participant_id,
        task_type,
        group_index,
        selected_words,
        is_time_up
      )
      VALUES (
        ${participantId},
        ${result.taskType},
        ${result.groupIndex},
        ${result.selectedWords},
        ${result.isTimeUp}
      )
      RETURNING id
    `;
    
    if (!insertResult[0]?.id) {
      throw new Error('Failed to get ID after saving result');
    }
    
    console.log(`Result saved successfully, ID: ${insertResult[0].id}`);
    return insertResult[0].id;
  } catch (error) {
    console.error('Error saving result data:', error);
    if (error instanceof Error) {
      console.error('Error stack:', error.stack);
    }
    throw new Error(`Failed to save result: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Function to get participant data by student number
export async function getParticipantByStudentNumber(studentNumber: string) {
  try {
    const result = await sql`
      SELECT * FROM participants
      WHERE student_number = ${studentNumber}
      ORDER BY created_at DESC
      LIMIT 1
    `;
    
    return result[0] || null;
  } catch (error) {
    console.error('Error getting participant data:', error);
    throw error;
  }
}

// Function to get results by participant ID
export async function getResultsByParticipantId(participantId: number) {
  try {
    const results = await sql`
      SELECT * FROM results
      WHERE participant_id = ${participantId}
      ORDER BY group_index ASC
    `;
    
    return results;
  } catch (error) {
    console.error('Error getting results data:', error);
    throw error;
  }
}

// Function to save demographic data and return the ID
export async function saveDemographic(
  participantId: number,
  demographicData: {
    gender: string;
    age: string;
    education: string;
    department: string;
    year: string;
    maritalStatus: string;
    employmentStatus: string;
    livingWith: string[];
    longestResidence: string;
    currentSocialStatus: string;
    childhoodSocialStatus: string;
    monthlyIncome: string;
  }
) {
  console.log('Saving demographic data for participant:', participantId);
  console.log('Demographic data to save:', JSON.stringify(demographicData, null, 2));
  
  try {
    // Check if entry already exists
    const existing = await sql`
      SELECT id FROM demographic
      WHERE participant_id = ${participantId}
    `;
    
    console.log('Existing demographic record:', existing);
    
    // If exists, update it
    if (existing.length > 0) {
      console.log('Updating existing demographic data');
      try {
        const result = await sql`
          UPDATE demographic
          SET
            gender = ${demographicData.gender},
            age = ${demographicData.age},
            education = ${demographicData.education},
            department = ${demographicData.department},
            year = ${demographicData.year},
            marital_status = ${demographicData.maritalStatus},
            employment_status = ${demographicData.employmentStatus},
            living_with = ${demographicData.livingWith},
            longest_residence = ${demographicData.longestResidence},
            current_social_status = ${demographicData.currentSocialStatus},
            childhood_social_status = ${demographicData.childhoodSocialStatus},
            monthly_income = ${demographicData.monthlyIncome},
            created_at = NOW()
          WHERE participant_id = ${participantId}
          RETURNING id
        `;
        
        console.log('Demographic data updated successfully, ID:', result[0]?.id);
        return result[0]?.id;
      } catch (updateError) {
        console.error('Error updating demographic data:', updateError);
        throw updateError;
      }
    }
    
    // Otherwise insert new record
    console.log('Inserting new demographic record');
    try {
      const result = await sql`
        INSERT INTO demographic (
          participant_id,
          gender,
          age,
          education,
          department,
          year,
          marital_status,
          employment_status,
          living_with,
          longest_residence,
          current_social_status,
          childhood_social_status,
          monthly_income
        ) 
        VALUES (
          ${participantId},
          ${demographicData.gender},
          ${demographicData.age},
          ${demographicData.education},
          ${demographicData.department},
          ${demographicData.year},
          ${demographicData.maritalStatus},
          ${demographicData.employmentStatus},
          ${demographicData.livingWith},
          ${demographicData.longestResidence},
          ${demographicData.currentSocialStatus},
          ${demographicData.childhoodSocialStatus},
          ${demographicData.monthlyIncome}
        )
        RETURNING id
      `;
      
      console.log('Demographic data saved successfully, ID:', result[0]?.id);
      
      if (!result[0] || !result[0].id) {
        throw new Error('Failed to get ID after saving demographic data');
      }
      
      return result[0].id;
    } catch (insertError) {
      console.error('Error inserting demographic data:', insertError);
      throw insertError;
    }
  } catch (error) {
    console.error('Error saving demographic data:', error);
    throw new Error(`Failed to save demographic data: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Function to get demographic data by participant ID
export async function getDemographicByParticipantId(participantId: number) {
  await initDatabase();
  try {
    const demographic = await sql`
      SELECT * FROM demographic WHERE participant_id = ${participantId}
    `;
    // Return the first result if it exists
    return demographic && demographic.length > 0 ? demographic[0] : null;
  } catch (error) {
    console.error('Error getting demographic by participant ID:', error);
    throw error;
  }
}

export async function saveQuestionnaire(
  participantId: number,
  questionData: Record<string, number>
) {
  await initDatabase();
  console.log('Saving questionnaire for participant:', participantId);
  
  try {
    // Prepare columns and values for SQL query
    const setValues: any[] = [];
    const columnAssignments: string[] = [];
    
    // Process all question data
    Object.entries(questionData).forEach(([key, value]) => {
      if (key !== 'participantId') { // Skip participantId field
        const columnName = `"${key}"`; // Wrap column name in quotes for SQL safety
        setValues.push(value);
        columnAssignments.push(`${columnName} = $${setValues.length}`);
      }
    });
    
    // Log what we're about to save
    console.log(`Saving questionnaire with ${setValues.length} values for participant ${participantId}`);
    
    // Check if a record already exists for this participant
    const existingRecord = await sql`
      SELECT id FROM questionnaires WHERE participant_id = ${participantId}
    `;
    
    let result;
    
    if (existingRecord && existingRecord.length > 0) {
      // Update existing record
      console.log(`Updating existing questionnaire for participant ${participantId}`);
      
      // Build the update query
      const updateQuery = `
        UPDATE questionnaires
        SET ${columnAssignments.join(', ')}, created_at = NOW()
        WHERE participant_id = $${setValues.length + 1}
        RETURNING id, participant_id, created_at
      `;
      
      // Execute the query
      result = await pool.query(updateQuery, [...setValues, participantId]);
      console.log(`Questionnaire updated successfully, ID: ${result.rows[0]?.id}`);
    } else {
      // Insert new record
      console.log(`Creating new questionnaire record for participant ${participantId}`);
      
      // Build column names and placeholders for INSERT
      const columnNames: string[] = ['participant_id'];
      const placeholders: string[] = ['$1'];
      const insertValues: any[] = [participantId];
      
      // Add all question data
      Object.entries(questionData).forEach(([key, value], index) => {
        if (key !== 'participantId') {
          columnNames.push(`"${key}"`);
          placeholders.push(`$${insertValues.length + 1}`);
          insertValues.push(value);
        }
      });
      
      // Build the insert query
      const insertQuery = `
        INSERT INTO questionnaires (${columnNames.join(', ')})
        VALUES (${placeholders.join(', ')})
        RETURNING id, participant_id, created_at
      `;
      
      // Execute the query
      result = await pool.query(insertQuery, insertValues);
      console.log(`New questionnaire created successfully, ID: ${result.rows[0]?.id}`);
    }
    
    if (!result.rows[0] || !result.rows[0].id) {
      throw new Error('Failed to get ID after saving questionnaire');
    }
    
    return result.rows[0];
  } catch (error) {
    console.error('Error saving questionnaire:', error);
    if (error instanceof Error && error.stack) {
      console.error('Error stack:', error.stack);
    }
    
    // Return a fallback object instead of throwing
    return { 
      id: null, 
      participant_id: participantId,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

export async function getQuestionnaireByParticipantId(participantId: number) {
  await initDatabase();
  try {
    const questionnaire = await sql`
      SELECT * FROM questionnaires 
      WHERE participant_id = ${participantId}
    `;
    
    // Return the result if it exists
    if (questionnaire && questionnaire.length > 0) {
      const result = questionnaire[0];
      
      // Convert the individual question columns back to section arrays for compatibility
      const section1 = [];
      const section2 = [];
      const section3 = [];
      const section4 = [];
      
      for (let i = 1; i <= 9; i++) {
        section1.push(result[`section1.${i}`] || 0);
      }
      
      for (let i = 1; i <= 37; i++) {
        section2.push(result[`section2.${i}`] || 0);
      }
      
      for (let i = 1; i <= 14; i++) {
        section3.push(result[`section3.${i}`] || 0);
      }
      
      for (let i = 1; i <= 29; i++) {
        section4.push(result[`section4.${i}`] || 0);
      }
      
      // Return both the individual questions and the section arrays
      return {
        ...result,
        section1,
        section2,
        section3,
        section4
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting questionnaire by participant ID:', error);
    throw error;
  }
} 