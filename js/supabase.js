// js/supabase.js

// === À REMPLIR PAR L'UTILISATEUR ===
const SUPABASE_URL = 'https://hebdhboglxwhcomuahxo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhlYmRoYm9nbHh3aGNvbXVhaHhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExNDcyMjYsImV4cCI6MjA5NjcyMzIyNn0.iY7QF_lCrhrlLtCnUN2VbMjQLcyWvfS3NDQC2svHZdc';
// ====================================

// Initialisation du client Supabase
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
