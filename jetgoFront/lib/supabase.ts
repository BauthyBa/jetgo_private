import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://pamidjksvzshakzkrtdy.supabase.co"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhbWlkamtzdnpzaGFremtydGR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY5ODM3MjQsImV4cCI6MjA1MjU1OTcyNH0.bvO5xGqJYa9MjUWC8N1LlBdWQFd9H4C8M0EEYL9Y-6I"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Función para verificar si Supabase está configurado
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey && supabaseUrl !== "" && supabaseAnonKey !== "")
}
