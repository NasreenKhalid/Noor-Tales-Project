import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// Create a Supabase client with service role key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('API environment check:');
console.log('Supabase URL available:', !!supabaseUrl);
console.log('Service Role Key available:', !!serviceRoleKey);

const supabase = createClient(
  supabaseUrl!,
  serviceRoleKey!
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log('Create profile API called with method:', req.method);
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  console.log('Request body:', JSON.stringify(req.body));
  const { userId, username, email } = req.body;

  if (!userId) {
    console.error('Missing required userId in request');
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    // Skip checking if user exists - assume it exists
    console.log('Attempting to create profile for user ID:', userId);

    // Temporarily disable RLS for this operation
    // Note: You need to have enabled "Postgres Extensions" in your Supabase project
    await supabase.rpc('disable_rls');

    // Create the profile
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        username: username || email?.split('@')[0] || 'User',
        points: 0
      })
      .select();

    // Re-enable RLS
    await supabase.rpc('enable_rls');

    if (error) {
      console.error('Profile creation error:', error);
      return res.status(500).json({ error: error.message });
    }

    console.log('Profile created successfully:', data);
    res.status(200).json({ success: true, profile: data });
  } catch (error: any) {
    console.error('Unexpected error in create-profile API:', error);
    res.status(500).json({ error: error.message });
  }
}