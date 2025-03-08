import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

type ResponseData = {
  sessionId?: string;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const { userId, planType = 'monthly' } = req.body;
  
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }
  
  try {
    // Fetch user from Supabase
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (userError || !userData) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Get user email from auth
    const { data: { user } } = await supabase.auth.admin.getUserById(userId);
    
    if (!user?.email) {
      return res.status(400).json({ error: 'User email not found' });
    }
    
    // Define price IDs for monthly and yearly plans
    // These should match your Stripe product price IDs
    const priceIds = {
      monthly: process.env.STRIPE_PRICE_MONTHLY || 'price_monthly',
      yearly: process.env.STRIPE_PRICE_YEARLY || 'price_yearly'
    };
    
    // Check if user already has a Stripe customer ID
    let stripeCustomerId: string;
    
    const { data: existingSubscription } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .single();
    
    if (existingSubscription?.stripe_customer_id) {
      stripeCustomerId = existingSubscription.stripe_customer_id;
    } else {
      // Create a new Stripe customer
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          userId
        }
      });
      
      stripeCustomerId = customer.id;
    }
    
    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      line_items: [
        {
          price: priceIds[planType as keyof typeof priceIds],
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${req.headers.origin}/subscription?success=true`,
      cancel_url: `${req.headers.origin}/subscription?canceled=true`,
      metadata: {
        userId,
        planType
      }
    });
    
    res.status(200).json({ sessionId: session.id });
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: error.message });
  }
}