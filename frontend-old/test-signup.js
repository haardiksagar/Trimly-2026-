import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || "https://macacumeoaqpdifwllir.supabase.co",
  process.env.VITE_SUPABASE_ANON_KEY || ""
);

async function test() {
  console.log("Starting signup test...");
  try {
    const { data, error } = await supabase.auth.signUp({
      email: 'test' + Date.now() + '@example.com',
      password: 'password123'
    });
    console.log("Data:", JSON.stringify(data, null, 2));
    console.log("Error:", error);
  } catch (e) {
    console.log("Exception:", e);
  }
}

test();
