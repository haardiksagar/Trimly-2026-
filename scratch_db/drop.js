const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgres://postgres:zWPugs%2F%23c5eKqfR@db.macacumeoaqpdifwllir.supabase.co:5432/postgres'
});

async function run() {
  try {
    await client.connect();
    await client.query(`
      DO $$ 
      DECLARE 
          constraint_name text; 
      BEGIN 
          SELECT conname INTO constraint_name 
          FROM pg_constraint 
          WHERE conrelid = 'url_mapping_data'::regclass 
            AND contype = 'u' 
            AND conkey = (SELECT array_agg(attnum) FROM pg_attribute WHERE attrelid = 'url_mapping_data'::regclass AND attname = 'original_url'); 
       
          IF constraint_name IS NOT NULL THEN 
              EXECUTE 'ALTER TABLE url_mapping_data DROP CONSTRAINT ' || constraint_name; 
              RAISE NOTICE 'Dropped constraint %', constraint_name;
          ELSE
              RAISE NOTICE 'No unique constraint found on original_url';
          END IF; 
      END $$;
    `);
    console.log("Database update successful!");
  } catch (e) {
    console.error("Error:", e);
  } finally {
    await client.end();
  }
}
run();
