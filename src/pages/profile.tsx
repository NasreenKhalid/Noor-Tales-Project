import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import { supabase } from '@/lib/supabase';
import { FaUser, FaStar, FaMedal, FaBookOpen } from 'react-icons/fa';
import Link from 'next/link';
import Image from 'next/image';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [badgeCount, setBadgeCount] = useState(0);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        console.log('Fetching user data...');
        
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        console.log('Auth user data:', user);
        
        if (!user) {
          console.log('No user found, redirecting to login');
          router.push('/auth/signin?redirect=/profile');
          return;
        }
        
        setUser(user);
        
        // Get profile
        console.log('Fetching profile for user:', user.id);
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        console.log('Profile data:', profile, 'Profile error:', profileError);
        
        if (profileError) {
          // Profile doesn't exist, try to create one
          console.log('No profile found, creating one...');
          
          const username = user.user_metadata?.username || 
                           user.email?.split('@')[0] || 
                           'User';
          
          const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .insert([
              { id: user.id, username, points: 0 }
            ])
            .select()
            .single();
          
          if (insertError) {
            console.error('Error creating profile:', insertError);
            throw new Error('Failed to create profile');
          } else {
            console.log('New profile created:', newProfile);
            setProfile(newProfile);
          }
        } else {
          console.log('Existing profile found:', profile);
          setProfile(profile);
        }
        
        // Count favorites
        const { count: favCount, error: favError } = await supabase
          .from('user_favorites')
          .select('*', { count: 'exact' })
          .eq('user_id', user.id);
        
        if (favError) {
          console.error('Error fetching favorites count:', favError);
        } else {
          setFavoriteCount(favCount || 0);
        }
        
        // Count badges
        const { count: badgeCount, error: badgeError } = await supabase
          .from('user_badges')
          .select('*', { count: 'exact' })
          .eq('user_id', user.id);
        
        if (badgeError) {
          console.error('Error fetching badge count:', badgeError);
        } else {
          setBadgeCount(badgeCount || 0);
        }
        
      } catch (error: any) {
        console.error('Error in profile page:', error);
        setError(error.message || 'Failed to load profile. Please try again later.');
      } finally {
        console.log('Setting loading to false');
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <Layout title="Profile - Noor Tales">
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <p>Loading profile...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Profile - Noor Tales">
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-4">
            {error}
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-primary text-white rounded-lg"
          >
            Try Again
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Your Profile - Noor Tales">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
          <div className="bg-primary px-6 py-4">
            <h1 className="text-2xl font-title font-bold text-white">Your Profile</h1>
          </div>
          
          <div className="p-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Profile Picture/Initial */}
              <div className="w-24 h-24 bg-accent text-primary rounded-full flex items-center justify-center text-4xl font-bold">
                {profile?.avatar_url ? (
                  <Image 
                    src={profile.avatar_url} 
                    alt={profile.username} 
                    width={96}
                    height={96}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  profile?.username?.charAt(0).toUpperCase() || 'U'
                )}
              </div>
              
              {/* Profile Info */}
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-primary mb-2 text-center md:text-left">
                  {profile?.username || 'User'}
                </h2>
                <p className="text-gray-600 mb-4 text-center md:text-left">
                  {user?.email}
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="bg-primary bg-opacity-10 p-4 rounded-lg text-center">
                    <FaStar className="mx-auto text-2xl text-accent mb-2" />
                    <div className="font-semibold">{favoriteCount}</div>
                    <div className="text-sm text-gray-600">Favorites</div>
                  </div>
                  
                  <div className="bg-primary bg-opacity-10 p-4 rounded-lg text-center">
                    <FaMedal className="mx-auto text-2xl text-accent mb-2" />
                    <div className="font-semibold">{badgeCount}</div>
                    <div className="text-sm text-gray-600">Badges</div>
                  </div>
                  
                  <div className="bg-primary bg-opacity-10 p-4 rounded-lg text-center">
                    <FaBookOpen className="mx-auto text-2xl text-accent mb-2" />
                    <div className="font-semibold">{profile?.points || 0}</div>
                    <div className="text-sm text-gray-600">Points</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex flex-col md:flex-row gap-4">
                <Link 
                  href="/favorites" 
                  className="px-4 py-2 bg-primary text-white rounded-lg text-center"
                >
                  View Favorites
                </Link>
                
                <button
                  onClick={handleSignOut}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Recently Viewed */}
        <div className="mt-8">
          <h2 className="text-2xl font-title font-bold text-primary mb-4">Recently Viewed</h2>
          <div className="bg-white rounded-xl shadow-soft p-6">
            <p className="text-gray-500 text-center">Coming soon! Track your reading history.</p>
          </div>
        </div>
        
        {/* Badges Section */}
        <div className="mt-8">
          <h2 className="text-2xl font-title font-bold text-primary mb-4">Your Badges</h2>
          {badgeCount > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Placeholder badges */}
              <div className="bg-white rounded-xl shadow-soft p-4 text-center">
                <div className="bg-accent rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                  <FaMedal className="text-primary text-2xl" />
                </div>
                <h3 className="font-medium text-primary">Story Explorer</h3>
                <p className="text-xs text-gray-500 mt-1">Read 5 stories</p>
              </div>
              {/* Add more badges here */}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-soft p-6 text-center">
              <FaMedal className="text-gray-300 text-4xl mx-auto mb-3" />
              <h3 className="font-medium text-primary mb-2">No badges yet</h3>
              <p className="text-gray-500 mb-4">Continue using Noor Tales to earn badges!</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}