import { supabase } from '../src/services/supabase';

async function check() {
  const { data, error } = await supabase.from('profiles').select('*').limit(1);
  console.log(JSON.stringify(data?.[0], null, 2));
}
check();
