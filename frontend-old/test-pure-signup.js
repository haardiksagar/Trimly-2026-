import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://macacumeoaqpdifwllir.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1hY2FjdW1lb2FxcGRpZndsbGlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwMzk4NjIsImV4cCI6MjA5NzYxNTg2Mn0.mPP4_KwUUwS5MXsCvsc7eVkQpQ0tG9D47DGzSu7OYRc";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function test() {
  const emailToTest = process.argv[2] || 'test' + Date.now() + '@example.com';
  console.log("Starting pure signup test for:", emailToTest);
  try {
    const { data, error } = await supabase.auth.signUp({
      email: emailToTest,
      password: 'password123'
    });
    console.log("Data:", JSON.stringify(data, null, 2));
    console.log("Error:", error);
  } catch (e) {
    console.log("Exception:", e);
  }
}

test();
