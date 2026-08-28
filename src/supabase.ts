import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.https://wkrrzwapqwufqmjpymiu.supabase.co;
const supabaseAnonKey =
  import.meta.env.eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrcnJ6d2FwcXd1ZnFtanB5bWl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc5MjE0MzYsImV4cCI6MjEwMzQ5NzQzNn0.ypYP_Jtz5b6XAcdnPiAOivPnoSg2V6jcxbNAVWUOZGQ;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Supabase environment variables belum diatur."
  );
}

export const supabase = createClient(
  supabaseUrl || "",
  supabaseAnonKey || ""
);
