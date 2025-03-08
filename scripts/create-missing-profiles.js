const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function createMissingProfiles() {
  try {
    // Temporarily disable RLS
    console.log('Disabling RLS...');
    try {
      const { error: rpcError } = await supabase.rpc('disable_rls_for_profiles');
      if (rpcError) {
        console.log('RPC failed, trying SQL directly');
        await supabase.from('_temp').select('disable_rls_manually()');
      }
    } catch (e) {
      console.error('Could not disable RLS:', e);
      // Continue anyway
    }

    // Fetch all users
    console.log('Fetching users...');
    try {
      const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
      
      if (usersError) {
        console.error('Error fetching users:', usersError);
        return;
      }

      console.log(`Found ${users.length} users`);

      // For each user, check if they have a profile
      for (const user of users) {
        console.log(`Checking profile for user ${user.id}...`);
        
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single();
        
        // If no profile, create one
        if (error && error.code === 'PGRST116') {
          console.log(`Creating profile for user ${user.id}...`);
          
          const username = user.user_metadata?.username || 
                          user.email?.split('@')[0] || 
                          'User';
          
          const { data, error: insertError } = await supabase
            .from('profiles')
            .insert([
              { 
                id: user.id, 
                username, 
                points: 0 
              }
            ]);
          
          if (insertError) {
            console.error(`Error creating profile for ${user.id}:`, insertError);
          } else {
            console.log(`Successfully created profile for ${user.id}`);
          }
        } else {
          console.log(`Profile already exists for ${user.id}`);
        }
      }
    } catch (error) {
      console.error('Error processing users:', error);
    }
    
    // Re-enable RLS
    console.log('Re-enabling RLS...');
    try {
      const { error: rpcError } = await supabase.rpc('enable_rls_for_profiles');
      if (rpcError) {
        console.log('RPC failed, trying SQL directly');
        await supabase.from('_temp').select('enable_rls_manually()');
      }
    } catch (e) {
      console.error('Could not re-enable RLS:', e);
    }

    console.log('Done!');
  } catch (error) {
    console.error('Error in script:', error);
  }
}

createMissingProfiles();