import React, { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import Image from 'next/image';
import Layout from '@/components/layout/Layout';
import { supabase } from '@/lib/supabase';
import { FaPlay, FaPause, FaStar, FaRegStar, FaSearch, FaQuoteRight } from 'react-icons/fa';
import ReactAudioPlayer from 'react-audio-player';
import Link from 'next/link';

// Import API functions and types
import { fetchAllDuas, fetchAllHadiths, fetchDuaOfDay, getSampleDuas, getSampleHadiths, Dua, Hadith } from '@/lib/duaApi';

interface DuasHadithsPageProps {
  duas: Dua[];
  hadiths: Hadith[];
  duaOfDay: Dua | null;
}

export default function DuasHadithsPage({ duas, hadiths, duaOfDay }: DuasHadithsPageProps) {
  const [activeTab, setActiveTab] = useState<'duas' | 'hadiths'>('duas');
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [activeAudioId, setActiveAudioId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter duas/hadiths based on search query
  const filteredDuas = duas.filter(dua => 
    dua.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dua.situation.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dua.translation.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredHadiths = hadiths.filter(hadith => 
    hadith.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    hadith.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    hadith.source.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAudioPlay = (duaId: string) => {
    if (activeAudioId === duaId) {
      setIsAudioPlaying(!isAudioPlaying);
    } else {
      setActiveAudioId(duaId);
      setIsAudioPlaying(true);
    }
  };

  return (
    <Layout title="Duas & Hadiths - Noor Tales">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold font-title text-primary mb-4">
            Duas & Hadiths
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Explore beautiful duas and authentic hadiths to learn and recite daily.
          </p>
        </div>

        {/* Dua of the Day */}
        {duaOfDay && (
          <div className="mb-12">
            <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
              <div className="bg-primary px-6 py-4">
                <h2 className="text-2xl font-title font-bold text-white">Dua of the Day</h2>
              </div>
              
              <div className="p-6">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-medium text-primary mb-2">{duaOfDay.title}</h3>
                  <p className="text-sm text-gray-500 mb-4">{duaOfDay.situation}</p>
                </div>
                
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-1/2 text-center">
                    <p className="font-title text-2xl text-right mb-3 leading-relaxed">
                      {duaOfDay.arabic_text}
                    </p>
                    <p className="text-gray-600 italic text-right">
                      {duaOfDay.transliteration}
                    </p>
                    
                    {/* Audio Player */}
                    {duaOfDay.audio_url && (
                      <div className="mt-4 flex justify-center">
                        <button
                          onClick={() => handleAudioPlay(duaOfDay.id)}
                          className="bg-accent text-primary p-3 rounded-full shadow-md"
                        >
                          {isAudioPlaying && activeAudioId === duaOfDay.id ? <FaPause /> : <FaPlay />}
                        </button>
                        
                        {/* Hidden Audio Player */}
                        <div className="hidden">
                          <ReactAudioPlayer
                            src={duaOfDay.audio_url}
                            autoPlay={isAudioPlaying && activeAudioId === duaOfDay.id}
                            controls
                            onPlay={() => setIsAudioPlaying(true)}
                            onPause={() => setIsAudioPlaying(false)}
                            onEnded={() => setIsAudioPlaying(false)}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="md:w-1/2">
                    <div className="bg-primary bg-opacity-10 p-4 rounded-lg">
                      <h4 className="font-semibold text-primary mb-2">Translation:</h4>
                      <p className="text-gray-600">{duaOfDay.translation}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search and Tabs */}
        <div className="bg-white rounded-xl shadow-soft p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            {/* Search Bar */}
            <div className="w-full md:w-1/2">
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  placeholder="Search duas and hadiths..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            {/* Tabs */}
            <div className="flex rounded-md shadow-sm">
              <button
                onClick={() => setActiveTab('duas')}
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === 'duas'
                    ? 'bg-primary text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                } rounded-l-md border border-gray-300`}
              >
                Duas
              </button>
              <button
                onClick={() => setActiveTab('hadiths')}
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === 'hadiths'
                    ? 'bg-primary text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                } rounded-r-md border border-gray-300 border-l-0`}
              >
                Hadiths
              </button>
            </div>
          </div>
        </div>

        {/* Duas List */}
        {activeTab === 'duas' && (
          <div className="space-y-6">
            {filteredDuas.length > 0 ? (
              filteredDuas.map((dua) => (
                <div key={dua.id} className="bg-white rounded-xl shadow-soft overflow-hidden">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-medium text-primary">{dua.title}</h3>
                      {dua.audio_url && (
                        <button
                          onClick={() => handleAudioPlay(dua.id)}
                          className="bg-accent text-primary p-2 rounded-full"
                        >
                          {isAudioPlaying && activeAudioId === dua.id ? <FaPause /> : <FaPlay />}
                        </button>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-500 mb-4">Situation: {dua.situation}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <p className="font-title text-xl text-right mb-2">{dua.arabic_text}</p>
                        <p className="text-gray-600 italic text-right text-sm">{dua.transliteration}</p>
                      </div>
                      
                      <div className="bg-primary bg-opacity-10 p-4 rounded-lg">
                        <p className="text-gray-600">{dua.translation}</p>
                      </div>
                    </div>
                    
                    {/* Hidden Audio Player */}
                    {dua.audio_url && (
                      <div className="hidden">
                        <ReactAudioPlayer
                          src={dua.audio_url}
                          autoPlay={isAudioPlaying && activeAudioId === dua.id}
                          controls
                          onPlay={() => setIsAudioPlaying(true)}
                          onPause={() => setIsAudioPlaying(false)}
                          onEnded={() => setIsAudioPlaying(false)}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-white rounded-xl shadow-soft">
                <FaQuoteRight className="text-gray-300 text-5xl mx-auto mb-4" />
                <h3 className="text-xl font-medium text-primary mb-2">No duas found</h3>
                <p className="text-gray-500 mb-4">
                  {searchQuery ? 'Try a different search term.' : 'Duas will be added soon.'}
                </p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="px-4 py-2 bg-primary text-white rounded-lg"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Hadiths List */}
        {activeTab === 'hadiths' && (
          <div className="space-y-6">
            {filteredHadiths.length > 0 ? (
              filteredHadiths.map((hadith) => (
                <div key={hadith.id} className="bg-white rounded-xl shadow-soft overflow-hidden">
                  <div className="p-6">
                    <h3 className="text-xl font-medium text-primary mb-4">{hadith.title}</h3>
                    
                    <div className="bg-primary bg-opacity-5 p-4 rounded-lg mb-4">
                      <p className="text-gray-700 italic">{hadith.content}</p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row justify-between text-sm text-gray-500">
                      <p>Source: {hadith.source}</p>
                      <p>Reference: {hadith.reference}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-white rounded-xl shadow-soft">
                <FaQuoteRight className="text-gray-300 text-5xl mx-auto mb-4" />
                <h3 className="text-xl font-medium text-primary mb-2">No hadiths found</h3>
                <p className="text-gray-500 mb-4">
                  {searchQuery ? 'Try a different search term.' : 'Hadiths will be added soon.'}
                </p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="px-4 py-2 bg-primary text-white rounded-lg"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    // Import the API functions
    const { 
      fetchAllDuas, 
      fetchAllHadiths, 
      fetchDuaOfDay,
      getSampleDuas,
      getSampleHadiths
    } = await import('@/lib/duaApi');
    
    // Try to fetch duas from API
    let duas = [];
    let hadiths = [];
    let duaOfDay = null;
    
    try {
      console.log('Fetching duas from API...');
      duas = await fetchAllDuas();
      console.log(`Fetched ${duas.length} duas from API`);
    } catch (error) {
      console.error('Error fetching duas from API:', error);
    }
    
    // If API fails or returns no duas, fall back to database
    if (!duas.length) {
      console.log('Falling back to database for duas...');
      const { data: dbDuas } = await supabase
        .from('duas')
        .select('*')
        .order('created_at', { ascending: false });
      
      duas = dbDuas || [];
      console.log(`Fetched ${duas.length} duas from database`);
    }
    
    // Try to fetch hadiths from API
    try {
      console.log('Fetching hadiths from API...');
      hadiths = await fetchAllHadiths();
      console.log(`Fetched ${hadiths.length} hadiths from API`);
    } catch (error) {
      console.error('Error fetching hadiths from API:', error);
    }
    
    // If API fails or returns no hadiths, fall back to database
    if (!hadiths.length) {
      console.log('Falling back to database for hadiths...');
      const { data: dbHadiths } = await supabase
        .from('hadiths')
        .select('*')
        .order('created_at', { ascending: false });
      
      hadiths = dbHadiths || [];
      console.log(`Fetched ${hadiths.length} hadiths from database`);
    }
    
    // Try to fetch dua of the day from API
    try {
      console.log('Fetching dua of the day from API...');
      duaOfDay = await fetchDuaOfDay();
      console.log(`Dua of day: ${duaOfDay ? duaOfDay.title : 'Not found'}`);
    } catch (error) {
      console.error('Error fetching dua of the day from API:', error);
    }
    
    // If API fails or returns no dua of the day, fall back to database
    if (!duaOfDay) {
      console.log('Falling back to database for dua of the day...');
      const { data: dbDuaOfDay } = await supabase
        .from('duas')
        .select('*')
        .eq('is_dua_of_day', true)
        .single();
      
      duaOfDay = dbDuaOfDay;
      console.log(`Dua of day from database: ${duaOfDay ? duaOfDay.title : 'Not found'}`);
    }
    
    // If no duas or hadiths found in both API and database, use sample data
    if (!duas.length) {
      console.log('Using sample duas data as final fallback');
      duas = getSampleDuas();
    }
    
    if (!hadiths.length) {
      console.log('Using sample hadiths data as final fallback');
      hadiths = getSampleHadiths();
    }
    
    // If still no dua of the day, select one from the available duas
    if (!duaOfDay && duas.length) {
      duaOfDay = duas.find(dua => dua.is_dua_of_day) || duas[0];
      console.log(`Using ${duaOfDay.title} as dua of the day fallback`);
    }
    
    return {
      props: {
        duas,
        hadiths,
        duaOfDay
      }
    };
  } catch (error) {
    console.error('Error in getServerSideProps:', error);
    
    // Use sample data as final fallback
    const { getSampleDuas, getSampleHadiths } = await import('@/lib/duaApi');
    const sampleDuas = getSampleDuas();
    const sampleHadiths = getSampleHadiths();
    
    return {
      props: {
        duas: sampleDuas,
        hadiths: sampleHadiths,
        duaOfDay: sampleDuas.find(dua => dua.is_dua_of_day) || sampleDuas[0]
      }
    };
  }
};