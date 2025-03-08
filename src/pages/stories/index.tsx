import React, { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import Layout from '@/components/layout/Layout';
import { supabase } from '@/lib/supabase';
import type { Story } from '@/lib/supabase';
import { FaStar, FaRegStar, FaLock, FaCalendarAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';

interface StoriesPageProps {
  stories: Story[];
  totalCount: number;
}

export default function StoriesPage({ stories: initialStories, totalCount }: StoriesPageProps) {
  const [stories, setStories] = useState<Story[]>(initialStories);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [user, setUser] = useState<any>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  
  const PER_PAGE = 9;
  const totalPages = Math.ceil(totalCount / PER_PAGE);

  useEffect(() => {
    // Check current auth status
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      // If user is logged in, fetch their favorites
      if (user) {
        const { data } = await supabase
          .from('user_favorites')
          .select('content_id')
          .eq('user_id', user.id)
          .eq('content_type', 'story');
          
        if (data) {
          setFavorites(data.map(fav => fav.content_id));
        }
      }
    };
    
    checkUser();
  }, []);

  const loadMore = async () => {
    if (page >= totalPages) return;
    
    setLoading(true);
    const nextPage = page + 1;
    
    try {
      const { data } = await supabase
        .from('stories')
        .select('*')
        .order('publish_date', { ascending: false })
        .range(nextPage * PER_PAGE - PER_PAGE, nextPage * PER_PAGE - 1);
      
      if (data) {
        setStories([...stories, ...data]);
        setPage(nextPage);
      }
    } catch (error) {
      console.error('Error loading more stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (storyId: string) => {
    if (!user) return;
    
    const isFavorite = favorites.includes(storyId);
    
    if (isFavorite) {
      // Remove from favorites
      await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('content_type', 'story')
        .eq('content_id', storyId);
        
      setFavorites(favorites.filter(id => id !== storyId));
    } else {
      // Add to favorites
      await supabase
        .from('user_favorites')
        .insert({
          user_id: user.id,
          content_type: 'story',
          content_id: storyId
        });
        
      setFavorites([...favorites, storyId]);
      
      // Record activity for points
      await supabase
        .from('user_activity')
        .insert({
          user_id: user.id,
          activity_type: 'watch_story',
          content_id: storyId,
          points_earned: 10
        });
    }
  };

  return (
    <Layout title="Islamic Stories Library - Noor Tales">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold font-title text-primary mb-4">
            Islamic Stories
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Explore our collection of daily Islamic stories designed to inspire and educate children about the beautiful values of Islam.
          </p>
        </div>

        {/* Stories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.map((story) => (
            <motion.div
              key={story.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl shadow-soft overflow-hidden"
            >
              <div className="relative h-48">
                {story.thumbnail_url ? (
                  <Image
                    src={story.thumbnail_url}
                    fill
                    alt={story.title}
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-primary bg-opacity-20 flex items-center justify-center">
                    <span className="text-primary text-opacity-50 text-xl font-medium">Noor Tales</span>
                  </div>
                )}
                
                {/* Premium Indicator */}
                {story.is_premium && (
                  <div className="absolute top-2 left-2 bg-accent text-primary text-xs px-2 py-1 rounded-full font-medium flex items-center">
                    <FaLock className="mr-1" /> Premium
                  </div>
                )}
                
                {/* Date */}
                <div className="absolute bottom-2 left-2 bg-white bg-opacity-90 text-xs px-2 py-1 rounded-full font-medium flex items-center">
                  <FaCalendarAlt className="mr-1 text-primary" /> 
                  {new Date(story.publish_date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                  })}
                </div>
                
                {/* Favorite Button */}
                {user && (
                  <button
                    onClick={() => toggleFavorite(story.id)}
                    className="absolute top-2 right-2 bg-white bg-opacity-90 p-2 rounded-full shadow"
                  >
                    {favorites.includes(story.id) ? (
                      <FaStar className="text-accent" />
                    ) : (
                      <FaRegStar className="text-gray-400" />
                    )}
                  </button>
                )}
              </div>
              
              <div className="p-4">
                <h3 className="text-lg font-semibold text-primary mb-2 truncate">
                  {story.title}
                </h3>
                <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                  {story.content.substring(0, 120)}...
                </p>
                <Link
                  href={`/stories/${story.id}`}
                  className={`inline-block px-4 py-2 rounded-lg text-sm font-medium ${
                    story.is_premium
                      ? 'bg-accent text-primary'
                      : 'bg-primary text-white'
                  }`}
                >
                  Read Story
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Load More Button */}
        {page < totalPages && (
          <div className="text-center mt-12">
            <button
              onClick={loadMore}
              disabled={loading}
              className="px-6 py-3 bg-primary text-white rounded-lg shadow-sm hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              {loading ? 'Loading...' : 'Load More Stories'}
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  // Fetch initial stories
  const { data: stories, count } = await supabase
    .from('stories')
    .select('*', { count: 'exact' })
    .order('publish_date', { ascending: false })
    .range(0, 8);
  
  return {
    props: {
      stories: stories || [],
      totalCount: count || 0
    }
  };
};
