import React, { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import { supabase } from '@/lib/supabase';
import type { ProphetStory } from '@/lib/supabase';
import { FaStar, FaRegStar, FaSearch, FaPrayingHands, FaLock } from 'react-icons/fa';
import { motion } from 'framer-motion';

interface ProphetStoriesPageProps {
  prophetStories: ProphetStory[];
  prophetNames: string[];
}

export default function ProphetStoriesPage({ prophetStories: initialStories, prophetNames }: ProphetStoriesPageProps) {
  const [prophetStories, setProphetStories] = useState<ProphetStory[]>(initialStories);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProphet, setSelectedProphet] = useState<string>('');
  const [user, setUser] = useState<any>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  
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
          .eq('content_type', 'prophet_story');
          
        if (data) {
          setFavorites(data.map(fav => fav.content_id));
        }
      }
    };
    
    checkUser();
  }, []);

  useEffect(() => {
    const fetchStories = async () => {
      let query = supabase
        .from('prophet_stories')
        .select('*');
      
      if (selectedProphet) {
        query = query.eq('prophet_name', selectedProphet);
      }
      
      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`);
      }
      
      const { data } = await query;
      setProphetStories(data || []);
    };
    
    fetchStories();
  }, [selectedProphet, searchQuery]);

  const toggleFavorite = async (storyId: string) => {
    if (!user) return;
    
    const isFavorite = favorites.includes(storyId);
    
    if (isFavorite) {
      // Remove from favorites
      await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('content_type', 'prophet_story')
        .eq('content_id', storyId);
        
      setFavorites(favorites.filter(id => id !== storyId));
    } else {
      // Add to favorites
      await supabase
        .from('user_favorites')
        .insert({
          user_id: user.id,
          content_type: 'prophet_story',
          content_id: storyId
        });
        
      setFavorites([...favorites, storyId]);
      
      // Record activity for points
      await supabase
        .from('user_activity')
        .insert({
          user_id: user.id,
          activity_type: 'read_prophet',
          content_id: storyId,
          points_earned: 7
        });
    }
  };

  return (
    <Layout title="Prophet Stories - Noor Tales">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold font-title text-primary mb-4">
            Prophet Stories
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Learn about the lives and teachings of the Prophets (AS) through engaging stories.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-12 bg-white rounded-xl shadow-soft p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Search Bar */}
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Search Stories
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  name="search"
                  id="search"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  placeholder="Search by title or content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            {/* Prophet Filter */}
            <div>
              <label htmlFor="prophet" className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Prophet
              </label>
              <select
                id="prophet"
                name="prophet"
                className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                value={selectedProphet}
                onChange={(e) => setSelectedProphet(e.target.value)}
              >
                <option value="">All Prophets</option>
                {prophetNames.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Stories Grid */}
        {prophetStories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {prophetStories.map((story) => (
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
                      <span className="text-primary text-opacity-50 text-xl font-medium">
                        <FaPrayingHands className="mb-2 text-3xl" />
                        {story.prophet_name}
                      </span>
                    </div>
                  )}
                  
                  {/* Prophet Name Tag */}
                  <div className="absolute top-2 left-2 bg-primary bg-opacity-90 text-white text-xs px-2 py-1 rounded-full font-medium">
                    {story.prophet_name}
                  </div>
                  
                  {/* Premium Indicator */}
                  {story.is_premium && (
                    <div className="absolute bottom-2 left-2 bg-accent text-primary text-xs px-2 py-1 rounded-full font-medium flex items-center">
                      <FaLock className="mr-1" /> Premium
                    </div>
                  )}
                  
                  {/* Favorite Button */}
                  {user && (
                    <button
                      onClick={() => toggleFavorite(story.id)}
                      className="absolute top-2 right-2 bg-white p-2 rounded-full shadow-md"
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
                    href={`/prophets/${story.id}`}
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
        ) : (
          <div className="text-center py-12 bg-white rounded-xl shadow-soft">
            <FaPrayingHands className="text-gray-300 text-5xl mx-auto mb-4" />
            <h3 className="text-xl font-medium text-primary mb-2">No stories found</h3>
            <p className="text-gray-500 mb-6">
              {searchQuery || selectedProphet
                ? "Try adjusting your search or filter to find more stories."
                : "We're currently adding more Prophet stories. Check back soon!"}
            </p>
            {(searchQuery || selectedProphet) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedProphet('');
                }}
                className="inline-block px-4 py-2 bg-primary text-white rounded-lg"
              >
                Clear Search
              </button>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  // Fetch all prophet stories
  const { data: prophetStories } = await supabase
    .from('prophet_stories')
    .select('*');
  
  // Get unique prophet names
  const prophetNames = prophetStories
    ? [...new Set(prophetStories.map(story => story.prophet_name))].sort()
    : [];
  
  return {
    props: {
      prophetStories: prophetStories || [],
      prophetNames
    }
  };
};