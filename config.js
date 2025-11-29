// config.js

const supabaseUrl = window.SUPABASE_CONFIG?.url || 'https://your-project.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY || 'fallback_key';

const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

console.log('Supabase подключен!');
