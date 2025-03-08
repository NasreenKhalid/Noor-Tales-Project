import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import Image from 'next/image';
import { FaStar, FaBook } from 'react-icons/fa';

export default function FavoritesPage() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchFavorites = async () => {
      setLoading(true);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // Redirect to login if not authenticated
        router.push('/auth/signin?redirect=/favorites');
        return;
      }
      
      setUser(user);
      
      // Get user's favorites
      const { data: favoriteIds } = await supabase
        .from('user_favorites')
        .select('content_id')
        .eq('user_id', user.id)
        .eq('content_type', 'story');
      
      if (!favoriteIds || favoriteIds.length === 0) {
        setFavorites([]);
        setLoading(false);
        return;
      }
      
      // Get the story details for each favorite
      const ids = favoriteIds.map(fav => fav.content_id);
      
      const { data: stories } = await supabase
        .from('stories')
        .select('*')
        .in('id', ids);
      
      setFavorites(stories || []);
      setLoading(false);
    };
    
    fetchFavorites();
  }, [router]);

  const removeFavorite = async (storyId: string) => {
    if (!user) return;
    
    await supabase
      .from('user_favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('content_type', 'story')
      .eq('content_id', storyId);
    
    setFavorites(favorites.filter(story => story.id !== storyId));
  };

  return (
    <Layout title="Your Favorites - Noor Tales">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-primary mb-6">Your Favorite Stories</h1>
        
        {loading ? (
          <p className="text-center py-8">Loading favorites...</p>
        ) : favorites.length === 0 ? (
          <div className="bg-white rounded-xl shadow-soft p-8 text-center">
            <FaBook className="mx-auto text-4xl text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold text-primary mb-2">No favorites yet</h2>
            <p className="text-gray-600 mb-6">
              Start exploring stories and add them to your favorites.
            </p>
            <Link
              href="/stories"
              className="px-4 py-2 bg-primary text-white rounded-lg inline-block"
            >
              Explore Stories
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map(story => (
              <div key={story.id} className="bg-white rounded-xl shadow-soft overflow-hidden">
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
                  
                  <button
                    onClick={() => removeFavorite(story.id)}
                    className="absolute top-2 right-2 bg-white p-2 rounded-full shadow-md"
                  >
                    <FaStar className="text-accent" />
                  </button>
                </div>
                
                <div className="p-4">
                  <h2 className="text-lg font-semibold text-primary mb-2">{story.title}</h2>
                  <p className="text-gray-600 text-sm line-clamp-2 mb-4">{story.content.substring(0, 100)}...</p>
                  <Link
                    href={`/stories/${story.id}`}
                    className="inline-block px-4 py-2 bg-primary text-white rounded-lg"
                  >
                    Read Story
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}