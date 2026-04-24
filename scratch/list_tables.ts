import { supabase } from '../src/services/supabase';

async function listTables() {
  // We can't query information_schema directly via PostgREST usually unless enabled.
  // Let's try to just select from a table that might exist.
  const tables = ['categories', 'transactions', 'savings_goals', 'savings_deposits'];
  for (const t of tables) {
    const { error } = await supabase.from(t).select('id').limit(1);
    console.log(`Table ${t}: ${error ? 'Error ' + error.message : 'Exists'}`);
  }
}
listTables();
