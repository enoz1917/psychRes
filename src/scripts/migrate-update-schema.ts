import { sql } from '@/lib/db';

/**
 * Migration script to check and fix database schema inconsistencies
 * 
 * 1. Checks for the department column in participants table
 * 2. If the column still has a NOT NULL constraint, modifies it to accept NULL
 * 3. Updates any NULL department values with a placeholder
 * 
 * You can run this script with:
 * npx ts-node -r tsconfig-paths/register src/scripts/migrate-update-schema.ts
 */
async function main() {
  console.log('Starting migration to fix database schema...');
  
  try {
    console.log('Checking database schema...');
    
    // Check if department column exists and has NOT NULL constraint
    const columnCheck = await sql`
      SELECT column_name, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'participants' AND column_name = 'department';
    `;
    
    if (columnCheck.length > 0) {
      console.log('Department column found');
      
      if (columnCheck[0].is_nullable === 'NO') {
        console.log('Department column has NOT NULL constraint, updating schema...');
        
        try {
          // First update any existing NULL values with a placeholder
          await sql`
            UPDATE participants 
            SET department = 'N/A' 
            WHERE department IS NULL OR department = '';
          `;
          
          // Then modify the column to allow NULL values
          await sql`
            ALTER TABLE participants 
            ALTER COLUMN department DROP NOT NULL;
          `;
          
          console.log('Successfully modified department column to allow NULL values');
          
        } catch (alterError) {
          console.error('Error modifying department column:', alterError);
          
          // Alternative approach: drop and recreate table
          console.log('Trying alternative approach: recreating table without department constraint...');
          
          await sql`
            BEGIN;
            
            -- Create temporary table with updated schema
            CREATE TABLE participants_new (
              id SERIAL PRIMARY KEY,
              student_number TEXT NOT NULL,
              school TEXT NOT NULL,
              department TEXT,
              course TEXT NOT NULL,
              created_at TIMESTAMPTZ DEFAULT NOW()
            );
            
            -- Copy data to new table
            INSERT INTO participants_new (id, student_number, school, department, course, created_at)
            SELECT id, student_number, school, 
                   CASE WHEN department IS NULL OR department = '' THEN 'N/A' ELSE department END, 
                   course, created_at 
            FROM participants;
            
            -- Save sequence current value
            SELECT setval('participants_new_id_seq', (SELECT MAX(id) FROM participants), true);
            
            -- Drop the old table and constraints
            DROP TABLE participants CASCADE;
            
            -- Rename the new table
            ALTER TABLE participants_new RENAME TO participants;
            
            -- Recreate foreign key constraints
            ALTER TABLE results
            ADD CONSTRAINT results_participant_id_fkey
            FOREIGN KEY (participant_id) REFERENCES participants(id);
            
            ALTER TABLE demographic
            ADD CONSTRAINT fk_participant
            FOREIGN KEY (participant_id) REFERENCES participants(id)
            ON DELETE CASCADE;
            
            COMMIT;
          `;
          
          console.log('Successfully recreated participants table with updated schema');
        }
      } else {
        console.log('Department column already allows NULL values, no change needed');
      }
    } else {
      console.log('Department column not found in schema. Adding it as a nullable column...');
      
      // Add the department column if it doesn't exist
      await sql`
        ALTER TABLE participants
        ADD COLUMN department TEXT;
      `;
      
      console.log('Successfully added department column as nullable');
    }
    
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Error in migration script:', error);
    process.exit(1);
  }); 