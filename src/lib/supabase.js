import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://nbrwiiwrhetiwhbvdmaq.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5icndpaXdyaGV0aXdoYnZkbWFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4NzMwNTUsImV4cCI6MjA3NzQ0OTA1NX0.uWpOcBHuqpN8uywM5knwyoibgoL2Svgvuby3OIrL81Q";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    detectSessionInUrl: true,
    autoRefreshToken: true,
  },
});
