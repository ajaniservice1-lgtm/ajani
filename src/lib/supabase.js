import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://nbrwiiwrhetiwhbvdmaq.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5icndpaXdyaGV0aXdoYnZkbWFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4NzMwNTUsImV4cCI6MjA3NzQ0OTA1NX0.uWpOcBHuqpN8uywM5knwyoibgoL2Svgvuby3OIrL81Q";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
