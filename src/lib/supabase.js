
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hmndbgbjulimtbafrtit.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtbmRiZ2JqdWxpbXRiYWZydGl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYzOTIwMjcsImV4cCI6MjA2MTk2ODAyN30.zP5qbiw9SFzpRU82H5p-ZtgRKPuMn6a-hwqMHdTYhy8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
