import React, { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import { supabase } from '@/lib/supabase';
import { loadStripe } from '@stripe/stripe-js';
import {
  FaCrown,
  FaCheckCircle,
  FaTimesCircle,
  FaLock,
  FaUnlock,
  FaBook,
  FaHeadphones
} from 'react-icons/fa';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

interface SubscriptionPageProps {
  userId: string | null;
  isSubscribed: boolean;
  currentPlanType?: string;
  currentPeriodEnd?: string;
}

export default function SubscriptionPage({ 
  userId, 
  isSubscribed,
  currentPlanType,
  currentPeriodEnd
}: SubscriptionPageProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');
  
  useEffect(() => {
    // Redirect to login if not authenticated
    if (!userId) {
      router.push('/auth/signin?redirect=/subscription');
    }
  }, [userId, router]);

  const handleSubscribe = async () => {
    if (!userId) {
      router.push('/auth/signin?redirect=/subscription');
      return;
    }
    
    setLoading(true);
    
    try {
      // Create checkout session on the server
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          planType: selectedPlan
        }),
      });
      
      const { sessionId } = await response.json();
      
      // Redirect to Stripe Checkout
      const stripe = await stripePromise;
      const { error } = await stripe!.redirectToCheckout({
        sessionId
      });
      
      if (error) {
        console.error('Error redirecting to checkout:', error);
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    if (!userId) return;
    
    setLoading(true);
    
    try {
      // Create customer portal session on the server
      const response = await fetch('/api/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId
        }),
      });
      
      const { url } = await response.json();
      
      // Redirect to Stripe Customer Portal
      window.location.href = url;
    } catch (error) {
      console.error('Error creating portal session:', error);
    } finally {
      setLoading(false);
    }
  };

  // Monthly and yearly prices
  const prices = {
    monthly: {
      amount: 4.99,
      interval: 'month'
    },
    yearly: {
      amount: 39.99,
      interval: 'year',
      savings: 20
    }
  };

  // Feature list
  const features = [
    {
      name: 'Daily Islamic Stories',
      free: true,
      premium: true,
      icon: <FaBook />
    },
    {
      name: 'Audio Narration',
      free: true,
      premium: true,
      icon: <FaHeadphones />
    },
    {
      name: 'Premium Stories',
      free: false,
      premium: true,
      icon: <FaCrown />
    },
    {
      name: 'Ad-free Experience',
      free: false,
      premium: true,
      icon: <FaUnlock />
    },
    {
      name: 'Exclusive Ramadan Content',
      free: false,
      premium: true,
      icon: <FaCrown />
    },
    {
      name: 'High-quality Audio',
      free: false,
      premium: true,
      icon: <FaHeadphones />
    }
  ];

  return (
    <Layout title="Premium Subscription - Noor Tales">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold font-title text-primary mb-4">
            Noor Tales Premium
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Unlock exclusive Islamic stories and premium features for your child's Islamic learning journey.
          </p>
        </div>

        {/* Current Subscription Status */}
        {isSubscribed && (
          <div className="mb-12 bg-white rounded-xl shadow-soft p-6 max-w-3xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-primary">Your Current Subscription</h2>
                <p className="text-gray-600 mt-1">
                  {currentPlanType === 'monthly' ? 'Monthly' : 'Yearly'} Premium Plan
                </p>
                {currentPeriodEnd && (
                  <p className="text-sm text-gray-500 mt-2">
                    Your subscription renews on {new Date(currentPeriodEnd).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                )}
              </div>
              <div className="flex items-center">
                <span className="flex items-center bg-primary text-white px-3 py-1 rounded-full text-sm mr-4">
                  <FaCrown className="mr-1" /> Premium
                </span>
                <button
                  onClick={handleManageSubscription}
                  disabled={loading}
                  className="px-4 py-2 bg-accent text-primary rounded-lg text-sm font-medium"
                >
                  {loading ? 'Loading...' : 'Manage Subscription'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Pricing Toggle */}
        {!isSubscribed && (
          <div className="mb-12 text-center">
            <div className="inline-flex items-center bg-white rounded-full p-1 shadow-soft">
              <button
                onClick={() => setSelectedPlan('monthly')}
                className={`px-6 py-2 rounded-full text-sm font-medium ${
                  selectedPlan === 'monthly'
                    ? 'bg-primary text-white'
                    : 'text-gray-500 hover:text-primary'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setSelectedPlan('yearly')}
                className={`px-6 py-2 rounded-full text-sm font-medium ${
                  selectedPlan === 'yearly'
                    ? 'bg-primary text-white'
                    : 'text-gray-500 hover:text-primary'
                }`}
              >
                Yearly <span className="text-xs text-accent">20% off</span>
              </button>
            </div>
          </div>
        )}

        {/* Pricing Cards */}
        {!isSubscribed && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
              <div className="bg-gray-100 px-6 py-4">
                <h2 className="text-2xl font-title font-bold text-gray-700">Free Plan</h2>
              </div>
              <div className="p-6">
                <div className="mb-6">
                  <div className="text-3xl font-bold text-gray-700">$0</div>
                  <div className="text-sm text-gray-500">Forever free</div>
                </div>
                
                <ul className="space-y-4 mb-6">
                  {features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      {feature.free ? (
                        <FaCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                      ) : (
                        <FaTimesCircle className="text-gray-300 mt-1 mr-2 flex-shrink-0" />
                      )}
                      <span className="text-gray-600">
                        <span className="flex items-center">
                          {feature.icon && <span className="mr-2">{feature.icon}</span>}
                          {feature.name}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
                
                <button
                  disabled
                  className="w-full py-2 px-4 bg-gray-200 text-gray-500 rounded-lg text-center font-medium cursor-not-allowed"
                >
                  Current Plan
                </button>
              </div>
            </div>
            
            {/* Premium Plan */}
            <div className="bg-white rounded-2xl shadow-soft overflow-hidden relative">
              {/* Recommended badge */}
              <div className="absolute top-0 right-0">
                <div className="bg-accent text-primary text-xs px-3 py-1 font-bold uppercase">
                  Recommended
                </div>
              </div>
              
              <div className="bg-primary px-6 py-4">
                <h2 className="text-2xl font-title font-bold text-white">Premium Plan</h2>
              </div>
              <div className="p-6">
                <div className="mb-6">
                  <div className="text-3xl font-bold text-primary">
                    ${selectedPlan === 'monthly' ? prices.monthly.amount : prices.yearly.amount}
                  </div>
                  <div className="text-sm text-gray-500">
                    per {selectedPlan === 'monthly' ? 'month' : 'year'}
                    {selectedPlan === 'yearly' && (
                      <span className="ml-2 text-accent font-medium">Save 20%</span>
                    )}
                  </div>
                </div>
                
                <ul className="space-y-4 mb-6">
                  {features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      {feature.premium ? (
                        <FaCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                      ) : (
                        <FaTimesCircle className="text-gray-300 mt-1 mr-2 flex-shrink-0" />
                      )}
                      <span className="text-gray-600">
                        <span className="flex items-center">
                          {feature.icon && <span className="mr-2">{feature.icon}</span>}
                          {feature.name}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
                
                <button
                  onClick={handleSubscribe}
                  disabled={loading}
                  className="w-full py-2 px-4 bg-accent text-primary rounded-lg text-center font-medium hover:bg-opacity-90 transition"
                >
                  {loading ? 'Processing...' : `Subscribe Now`}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-semibold text-primary mb-6 text-center">Frequently Asked Questions</h2>
          
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-xl shadow-soft overflow-hidden mb-4">
              <div className="p-4 border-b border-gray-100">
                <h3 className="font-medium text-primary">What is included in the Premium plan?</h3>
              </div>
              <div className="p-4">
                <p className="text-gray-600">
                  The Premium plan includes access to all stories, including exclusive premium content, 
                  ad-free experience, high-quality audio narration, and special Ramadan content.
                </p>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-soft overflow-hidden mb-4">
              <div className="p-4 border-b border-gray-100">
                <h3 className="font-medium text-primary">Can I cancel my subscription at any time?</h3>
              </div>
              <div className="p-4">
                <p className="text-gray-600">
                  Yes, you can cancel your subscription at any time. Your premium access will continue until the end of your current billing period.
                </p>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-soft overflow-hidden mb-4">
              <div className="p-4 border-b border-gray-100">
                <h3 className="font-medium text-primary">Is there a family plan?</h3>
              </div>
              <div className="p-4">
                <p className="text-gray-600">
                  Currently, we don't offer a family plan, but a single premium subscription can be used for all your children on a single device.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { req } = context;
  
  // Default return for unauthenticated users
  const defaultReturn = {
    props: {
      userId: null,
      isSubscribed: false
    }
  };
  
  // Get user from cookie
  const authCookie = req.headers.cookie?.match(/supabase-auth-token=([^;]*)/);
  
  if (!authCookie || !authCookie[1]) {
    return defaultReturn;
  }
  
  try {
    const token = JSON.parse(decodeURIComponent(authCookie[1]))[0];
    
    // Set auth token in supabase
    const { data: { user } } = await supabase.auth.getUser(token);
    
    if (!user) {
      return defaultReturn;
    }
    
    // Check subscription status
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();
    
    return {
      props: {
        userId: user.id,
        isSubscribed: !!subscription,
        currentPlanType: subscription?.plan_type || null,
        currentPeriodEnd: subscription?.current_period_end || null
      }
    };
  } catch (error) {
    console.error('Error in getServerSideProps:', error);
    return defaultReturn;
  }
};