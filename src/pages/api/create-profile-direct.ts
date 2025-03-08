import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId, username } = req.body;
  
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  // Create a Supabase client with service role key
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    console.log('Creating profile for user:', userId, username);
    
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        username,
        points: 0
      });
    
    if (error) {
      console.error('Error creating profile:', error);
      return res.status(500).json({ error: error.message });
    }
    
    res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('Exception creating profile:', error);
    res.status(500).json({ error: error.message });
  }
}