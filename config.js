// config.js

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'fallback-url'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'fallback-key'

const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

console.log('Supabase подключен!');
