import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password, username } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  // Create a Supabase client with service role key
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    // Check if the user exists by trying to list users with a filter
    console.log('Checking if email exists:', email);
    
    // List users with filter
    const { data, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      console.error('Error checking existing users:', error);
      return res.status(500).json({ error: 'Error checking if email exists' });
    }
    
    // Check if any user has this email
    const existingUser = data?.users?.find(u => u.email === email);
    
    if (existingUser) {
      console.log('User already exists with this email');
      return res.status(400).json({ error: 'Email is already registered' });
    }
    
    // Continue with user creation since the email is not taken
    console.log('Email is available, creating new user');
    
    // Create the user with the username in user_metadata
    const { data: { user }, error: signUpError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        username: username
      }
    });

    if (signUpError) {
      console.error('User creation error:', signUpError);
      return res.status(400).json({ error: signUpError.message });
    }

    if (!user) {
      return res.status(500).json({ error: 'Failed to create user' });
    }

    console.log('User created successfully:', user.id);
    console.log('User metadata:', user.user_metadata);

    // Create profile using upsert to handle potential duplicates
    console.log('Creating profile for user:', user.id);
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        username: username, // Directly use the provided username
        points: 0
      });

    if (profileError) {
      console.error('Error creating profile:', profileError);
      // Continue anyway, profile creation can be retried later
    } else {
      console.log('Profile created successfully');
    }

    // Instead of trying to create a session on the server side,
    // just return the user information and let the client handle sign-in
    res.status(200).json({ 
      success: true, 
      user: {
        id: user.id,
        email: user.email,
        username: username
      }
    });
  } catch (error: any) {
    console.error('Exception in sign-up process:', error);
    res.status(500).json({ error: error.message });
  }
}