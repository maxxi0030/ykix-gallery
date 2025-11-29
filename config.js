// config.js

const supabaseUrl = '{{ .Env.VITE_SUPABASE_URL }}'
const supabaseKey = '{{ .Env.VITE_SUPABASE_ANON_KEY }}'

const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

console.log('Supabase подключен!');
