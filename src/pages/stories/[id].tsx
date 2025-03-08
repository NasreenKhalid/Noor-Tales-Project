import React, { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import { supabase } from '@/lib/supabase';
import { FaStar, FaRegStar, FaPlay, FaPause, FaLock, FaArrowLeft } from 'react-icons/fa';
import ReactAudioPlayer from 'react-audio-player';

interface Story {
  id: string;
  title: string;
  content: string;
  moral_lesson: string;
  audio_url: string | null;
  thumbnail_url: string | null;
  category: string;
  publish_date: string;
  is_premium: boolean;
}

interface StoryDetailPageProps {
  story: Story | null;
  isUserPremium: boolean;
}

export default function StoryDetailPage({ story, isUserPremium }: StoryDetailPageProps) {
  const router = useRouter();
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check current auth status
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      // If user is logged in, check if story is favorited
      if (user && story) {
        const { data } = await supabase
          .from('user_favorites')
          .select('*')
          .eq('user_id', user.id)
          .eq('content_type', 'story')
          .eq('content_id', story.id)
          .single();
          
        setIsFavorite(!!data);
      }
    };
    
    checkUser();
  }, [story]);

  const toggleFavorite = async () => {
    if (!user || !story) return;
    
    if (isFavorite) {
      // Remove from favorites
      await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('content_type', 'story')
        .eq('content_id', story.id);
    } else {
      // Add to favorites
      await supabase
        .from('user_favorites')
        .insert({
          user_id: user.id,
          content_type: 'story',
          content_id: story.id
        });
      
      // Record activity for points
      await supabase
        .from('user_activity')
        .insert({
          user_id: user.id,
          activity_type: 'watch_story',
          content_id: story.id,
          points_earned: 10
        });
    }
    
    setIsFavorite(!isFavorite);
  };

  // Handle premium content access
  const isPremiumLocked = story?.is_premium && !isUserPremium;

  if (!story) {
    return (
      <Layout title="Story Not Found - Noor Tales">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-primary mb-4">Story Not Found</h1>
            <p className="text-lg text-gray-600 mb-8">
              We couldn't find the story you're looking for.
            </p>
            <Link
              href="/stories"
              className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg"
            >
              <FaArrowLeft className="mr-2" /> Back to Stories
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`${story.title} - Noor Tales`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back button */}
        <div className="mb-6">
          <Link
            href="/stories"
            className="inline-flex items-center text-primary hover:text-primary-dark"
          >
            <FaArrowLeft className="mr-2" /> Back to Stories
          </Link>
        </div>

        {/* Story Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-title text-primary mb-2">
            {story.title}
          </h1>
          <div className="flex items-center text-sm text-gray-500">
            <span className="mr-4">
              Published: {new Date(story.publish_date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
            {story.is_premium && (
              <span className="bg-accent text-primary text-xs px-2 py-1 rounded-full font-medium flex items-center">
                <FaLock className="mr-1" /> Premium
              </span>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-soft overflow-hidden mb-8">
          {/* Story Thumbnail */}
          <div className="relative w-full h-64 md:h-80">
            {story.thumbnail_url ? (
              <Image
                src={story.thumbnail_url}
                alt={story.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-primary bg-opacity-20 flex items-center justify-center">
                <span className="text-primary text-opacity-50 text-2xl font-medium">Noor Tales</span>
              </div>
            )}
            
            {/* Premium Overlay */}
            {isPremiumLocked && (
              <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center text-white p-6">
                <FaLock className="text-4xl mb-4" />
                <h3 className="text-xl font-bold mb-2">Premium Content</h3>
                <p className="text-center mb-4">
                  This story is only available to premium subscribers.
                </p>
                <Link
                  href="/subscription"
                  className="px-6 py-2 bg-accent text-primary rounded-lg font-medium"
                >
                  Upgrade to Premium
                </Link>
              </div>
            )}
            
            {/* Audio Play Button */}
            {!isPremiumLocked && story.audio_url && (
              <button
                onClick={() => setIsAudioPlaying(!isAudioPlaying)}
                className="absolute bottom-4 right-4 bg-accent text-primary p-3 rounded-full shadow-md"
              >
                {isAudioPlaying ? <FaPause /> : <FaPlay />}
              </button>
            )}
            
            {/* Favorite Button */}
            {user && !isPremiumLocked && (
              <button
                onClick={toggleFavorite}
                className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-md"
              >
                {isFavorite ? (
                  <FaStar className="text-accent text-xl" />
                ) : (
                  <FaRegStar className="text-gray-400 text-xl" />
                )}
              </button>
            )}
          </div>
          
          {/* Hidden Audio Player */}
          {!isPremiumLocked && story.audio_url && (
            <div className="hidden">
              <ReactAudioPlayer
                src={story.audio_url}
                autoPlay={isAudioPlaying}
                controls
                onPlay={() => setIsAudioPlaying(true)}
                onPause={() => setIsAudioPlaying(false)}
                onEnded={() => setIsAudioPlaying(false)}
              />
            </div>
          )}
          
          {/* Story Content */}
          {!isPremiumLocked && (
            <div className="p-6">
              <div className="prose prose-lg max-w-none">
                {story.content.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-4 text-gray-600">
                    {paragraph}
                  </p>
                ))}
                
                <div className="bg-primary bg-opacity-10 p-6 rounded-lg mt-8">
                  <h4 className="font-semibold text-primary text-lg mb-2">Moral Lesson:</h4>
                  <p className="text-gray-700">{story.moral_lesson}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Related Content */}
        {!isPremiumLocked && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-primary mb-4">
              You Might Also Like
            </h2>
            <div className="bg-white rounded-xl shadow-soft p-6">
              <p className="text-center text-gray-500">Related stories coming soon!</p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params as { id: string };
  
  // Fetch the story
  const { data: story, error } = await supabase
    .from('stories')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching story:', error);
    return {
      props: {
        story: null,
        isUserPremium: false
      }
    };
  }
  
  // Check if user is premium - in a real implementation, you'd check the user's subscription
  // For now, we'll just set it to false
  const isUserPremium = false;
  
  return {
    props: {
      story,
      isUserPremium
    }
  };
}