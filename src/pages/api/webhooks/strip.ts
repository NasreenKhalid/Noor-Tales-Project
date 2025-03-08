import { NextApiRequest, NextApiResponse } from 'next';
import { buffer } from 'micro';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabase';

// Disable the default body parser
export const config = {
  api: {
    bodyParser: false,
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).end('Method Not Allowed');
  }
  
  try {
    const buf = await buffer(req);
    const sig = req.headers['stripe-signature'] as string;
    
    let event: Stripe.Event;
    
    try {
      event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
    } catch (err: any) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    
    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentSucceeded(invoice);
        break;
      }
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
    
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Error handling webhook:', error);
    res.status(500).end('Server Error');
  }
}

// Handle checkout session completed
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const planType = session.metadata?.planType || 'monthly';
  
  if (!userId) {
    console.error('No userId found in session metadata');
    return;
  }
  
  // Get subscription details
  const subscription = await stripe.subscriptions.retrieve(
    session.subscription as string
  );
  
  // Store subscription in database
  await supabase.from('subscriptions').upsert({
    user_id: userId,
    stripe_customer_id: session.customer as string,
    stripe_subscription_id: subscription.id,
    status: subscription.status,
    plan_type: planType,
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    updated_at: new Date().toISOString()
  });
}

// Handle invoice payment succeeded
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  if (!invoice.subscription) return;
  
  // Get subscription details
  const subscription = await stripe.subscriptions.retrieve(
    invoice.subscription as string
  );
  
  // Get customer metadata to find userId
  const customer = await stripe.customers.retrieve(
    invoice.customer as string
  ) as Stripe.Customer;
  
  const userId = customer.metadata.userId;
  
  if (!userId) {
    console.error('No userId found in customer metadata');
    return;
  }
  
  // Update subscription in database
  await supabase.from('subscriptions').upsert({
    user_id: userId,
    stripe_customer_id: invoice.customer as string,
    stripe_subscription_id: subscription.id,
    status: subscription.status,
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    updated_at: new Date().toISOString()
  });
}

// Handle subscription updated
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  // Get customer metadata to find userId
  const customer = await stripe.customers.retrieve(
    subscription.customer as string
  ) as Stripe.Customer;
  
  const userId = customer.metadata.userId;
  
  if (!userId) {
    console.error('No userId found in customer metadata');
    return;
  }
  
  // Get plan type
  const planType = subscription.items.data[0].price.lookup_key || 'monthly';
  
  // Update subscription in database
  await supabase.from('subscriptions').upsert({
    user_id: userId,
    stripe_customer_id: subscription.customer as string,
    stripe_subscription_id: subscription.id,
    status: subscription.status,
    plan_type: planType,
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    updated_at: new Date().toISOString()
  });
}

// Handle subscription deleted
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  // Get customer metadata to find userId
  const customer = await stripe.customers.retrieve(
    subscription.customer as string
  ) as Stripe.Customer;
  
  const userId = customer.metadata.userId;
  
  if (!userId) {
    console.error('No userId found in customer metadata');
    return;
  }
  
  // Update subscription status in database
  await supabase.from('subscriptions').update({
    status: subscription.status,
    updated_at: new Date().toISOString()
  }).eq('stripe_subscription_id', subscription.id);
}