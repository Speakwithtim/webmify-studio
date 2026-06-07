import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tjdcmkmxxokdglyqapay.supabase.co'
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqZGNta214eG9rZGdseXFhcGF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA3NDU1MTEsImV4cCI6MjA5NjMyMTUxMX0.ROBzVPTHLPxExVGFBfI_k_zJvsb7yvqBLM0dIJtKrC0'
const service = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqZGNta214eG9rZGdseXFhcGF5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDc0NTUxMSwiZXhwIjoyMDk2MzIxNTExfQ._IZB-nHjzW4t7CU5R85Xh7idryNddRP6T2a1q1gwqnc'

export const supabase = createClient(url, anon)
export const supabaseAdmin = createClient(url, service)
