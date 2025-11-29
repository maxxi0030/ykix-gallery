// config.js
// Настройка Supabase (используется на всех страницах)

const supabaseUrl = 'https://spusbagzllwcijabbost.supabase.co';
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwdXNiYWd6bGx3Y2lqYWJib3N0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwMTE2MjMsImV4cCI6MjA3NzU4NzYyM30.BLECbjr1l4exB7s0xZqygd9N1p8KE4zmyGPH4Rxshnw";

const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

console.log('Supabase подключен!');
