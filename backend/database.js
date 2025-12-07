// backend/db.config.js (
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config(); 

// Check for required keys 
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    throw new Error('Missing Supabase URL or Service Role Key in .env file.');
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

// Initialize the Supabase client using the Service Role Key
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;