// backend/test.js

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path'; 
import { fileURLToPath } from 'url';

// Resolve directory path for dotenv
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ 
    path: path.resolve(__dirname, '.env') 
}); 

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY; 

if (!supabaseUrl || !supabaseKey) {
    console.error("FATAL: SUPABASE_URL or SUPABASE_SERVICE_KEY is missing in backend/.env");
    process.exit(1);
}

// Use the Service Role Key for full server-side access
const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log("Testing Supabase connection...");
  
  try {
    // 💡 FIX 1: Use the Admin API to query auth.users (Recommended for backend)
    const { data: users, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) {
        throw authError; // Throw error to be caught below
    }

    console.log("Connected successfully and Auth access is confirmed!");
    console.log(`Connection URL: ${supabaseUrl}`);
    console.log(`Total users in auth system: ${users.users.length}`);

  } catch (error) {
    console.error("Connection failed (Auth Query Error):", error.message);
    
    // FIX 2: If the Admin API fails, try querying your custom SCM tables
    // Query your custom 'Users' table from the ERD instead of the protected Auth table.
    console.log("\nAttempting to query custom SCM Users table...");
    try {
        const { data: scmUsers, error: scmError } = await supabase
            .from("Users") // <-- Query YOUR custom Users table
            .select("user_id, role")
            .limit(1);

        if (scmError) throw scmError;

        console.log(" Custom SCM 'Users' table access confirmed!");
        console.log(`Sample SCM User data:`, scmUsers);
        
    } catch (scmError) {
        console.error("Connection failed on custom 'Users' table:", scmError.message);
    }
  }
}

testConnection();