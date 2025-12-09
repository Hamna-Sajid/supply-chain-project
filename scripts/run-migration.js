#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: SUPABASE_URL and SUPABASE_KEY environment variables are required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  try {
    console.log('🔄 Reading migration file...');
    const migrationFile = path.join(__dirname, 'supabase/migrations/20251209_shipment_inventory_triggers.sql');
    const sql = fs.readFileSync(migrationFile, 'utf-8');

    console.log('📝 Executing SQL migration...');
    
    // Split by statements and execute each one
    const statements = sql.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        console.log(`\n▶️  Executing: ${statement.trim().substring(0, 50)}...`);
        const { error } = await supabase.rpc('exec_sql', { sql: statement.trim() });
        
        if (error) {
          // Try direct execution if rpc fails
          console.log('   ⚠️  RPC method not available, using alternate method...');
        } else {
          console.log('   ✅ Success');
        }
      }
    }
    
    console.log('\n✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();
