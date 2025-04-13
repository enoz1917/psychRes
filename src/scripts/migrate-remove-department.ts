import { sql } from '@/lib/db';

/**
 * Migration script to remove the department field from the participants table
 * Run this if you need to update an existing database
 * 
 * You can run this script with:
 * npx ts-node -r tsconfig-paths/register src/scripts/migrate-remove-department.ts
 */
async function main() {
  console.log('Starting migration to remove department field');
  
  try {
    console.log('Checking if department column exists...');
    const columnCheck = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'participants' AND column_name = 'department';
    `;
    
    if (columnCheck.length > 0) {
      console.log('Department column found, removing it...');
      
      // Create a new table without the department column
      await sql`
        BEGIN;
        
        -- Create temporary table without department
        CREATE TABLE participants_new (
          id SERIAL PRIMARY KEY,
          student_number TEXT NOT NULL,
          school TEXT NOT NULL,
          course TEXT NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
        
        -- Copy data to new table
        INSERT INTO participants_new (id, student_number, school, course, created_at)
        SELECT id, student_number, school, course, created_at FROM participants;
        
        -- Drop the old table and rename the new one
        DROP TABLE participants CASCADE;
        ALTER TABLE participants_new RENAME TO participants;
        
        -- Recreate foreign key constraint
        ALTER TABLE results
        ADD CONSTRAINT results_participant_id_fkey
        FOREIGN KEY (participant_id) REFERENCES participants(id);
        
        COMMIT;
      `;
      
      console.log('Department column successfully removed');
    } else {
      console.log('Department column does not exist, no migration needed');
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