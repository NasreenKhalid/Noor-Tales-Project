import React, { useState, useEffect, useCallback } from "react";
import { GetServerSideProps } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import Layout from "@/components/layout/Layout";
import { supabase } from "@/lib/supabase";
import axios from "axios";
import {
  FaPlay,
  FaPause,
  FaStar,
  FaRegStar,
  FaCalendarAlt,
  FaBook,
  FaArrowRight,
} from "react-icons/fa";
import { motion } from "framer-motion";
import ReactAudioPlayer from "react-audio-player";
import * as duaApi from "@/lib/duaApi";

interface HomePageProps {
  dailyStory: any;
  duaOfDay: any;
  today: string;
  hijriDate: any;
  prayerTimes: any;
}

export default function HomePage({
  dailyStory,
  duaOfDay,
  today,
  hijriDate,
  prayerTimes,
}: HomePageProps) {
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isStoryAudioPlaying, setIsStoryAudioPlaying] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isDuaAudioPlaying, setIsDuaAudioPlaying] = useState(false);
  const [currentDuaIndex, setCurrentDuaIndex] = useState(0);
  const [allDuas, setAllDuas] = useState<Dua[]>([]);
  const [isAutoSliding, setIsAutoSliding] = useState(true);
  const [translationLanguage, setTranslationLanguage] = useState("english");
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [translations, setTranslations] = useState({
    english: "",
    urdu: "",
    french: "",
    spanish: "",
    indonesian: "",
    turkish: "",
  });
  // Debug logging
  useEffect(() => {
    console.log("Component Received Props:");
    console.log("Today:", today);
    console.log("HijriDate:", hijriDate);
    console.log("PrayerTimes:", prayerTimes);
    console.log("DuaOfDay:", duaOfDay);
    console.log("DailyStory:", dailyStory);
  }, [today, hijriDate, prayerTimes, duaOfDay, dailyStory]);
  useEffect(() => {
    // Load multiple duas
    const loadAllDuas = async () => {
      try {
        // Get all duas from our sample data
        const duas = duaApi.getSampleDuas();
        setAllDuas(duas);
      } catch (error) {
        console.error("Error loading duas:", error);
      }
    };

    loadAllDuas();
  }, []);

  
  
  // Set up auto-sliding
  useEffect(() => {
    let slideInterval: NodeJS.Timeout;

    if (isAutoSliding && allDuas.length > 1) {
      slideInterval = setInterval(() => {
        setCurrentDuaIndex((prevIndex) => (prevIndex + 1) % allDuas.length);
      }, 10000); // Change dua every 10 seconds
    }

    return () => {
      if (slideInterval) clearInterval(slideInterval);
    };
  }, [isAutoSliding, allDuas.length]);
  // Navigation handlers
  const goToPrevDua = useCallback(() => {
    setCurrentDuaIndex(
      (prevIndex) => (prevIndex - 1 + allDuas.length) % allDuas.length
    );
    // Temporarily pause auto-sliding when manually navigating
    setIsAutoSliding(false);
    setTimeout(() => setIsAutoSliding(true), 15000); // Resume after 15 seconds
  }, [allDuas.length]);

  const goToNextDua = useCallback(() => {
    setCurrentDuaIndex((prevIndex) => (prevIndex + 1) % allDuas.length);
    // Temporarily pause auto-sliding when manually navigating
    setIsAutoSliding(false);
    setTimeout(() => setIsAutoSliding(true), 15000); // Resume after 15 seconds
  }, [allDuas.length]);

  const goToDua = useCallback((index: number) => {
    setCurrentDuaIndex(index);
    // Temporarily pause auto-sliding when manually navigating
    setIsAutoSliding(false);
    setTimeout(() => setIsAutoSliding(true), 15000); // Resume after 15 seconds
  }, []);

 


  useEffect(() => {
    // Check current auth status
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      // If user is logged in, check if story is favorited
      if (user && dailyStory) {
        const { data } = await supabase
          .from("user_favorites")
          .select("*")
          .eq("user_id", user.id)
          .eq("content_type", "story")
          .eq("content_id", dailyStory.id)
          .single();

        setIsFavorite(!!data);
      }
    };

    checkUser();
  }, [dailyStory]);

  const toggleFavorite = async () => {
    if (!user || !dailyStory) return;

    if (isFavorite) {
      // Remove from favorites
      await supabase
        .from("user_favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("content_type", "story")
        .eq("content_id", dailyStory.id);
    } else {
      // Add to favorites
      await supabase.from("user_favorites").insert({
        user_id: user.id,
        content_type: "story",
        content_id: dailyStory.id,
      });

      // Record activity for points
      await supabase.from("user_activity").insert({
        user_id: user.id,
        activity_type: "watch_story",
        content_id: dailyStory.id,
        points_earned: 10,
      });
    }

    setIsFavorite(!isFavorite);
  };

  // Define hardcoded fallbacks
  const fallbackDua = {
    id: "fallback-dua",
    title: "Dua for Protection",
    arabic_text:
      "اللَّهُمَّ احْفَظْنِي مِنْ بَيْنِ يَدَيَّ، وَمِنْ خَلْفِي، وَعَنْ يَمِينِي، وَعَنْ شِمَالِي، وَمِنْ فَوْقِي، وَأَعُوذُ بِعَظَمَتِكَ أَنْ أُغْتَالَ مِنْ تَحْتِي",
    transliteration:
      "Allahumma ihfadhni min bayni yadayya, wa min khalfi, wa 'an yameeni, wa 'an shimaali, wa min fawqi, wa 'aoodhu bi'adhamatika an oghtaala min tahti",
    translation:
      "O Allah, protect me from my front, from my back, from my right, from my left, and from above me, and I seek refuge in Your Magnificence from being taken unaware from beneath me.",
    audio_url: null,
    situation: "Seeking protection",
    is_dua_of_day: true,
    is_premium: false,
  };

  const fallbackPrayerTimes = {
    data: {
      timings: {
        Fajr: "05:30",
        Sunrise: "06:45",
        Dhuhr: "12:15",
        Asr: "15:30",
        Maghrib: "18:00",
        Isha: "19:30",
      },
    },
  };


  useEffect(() => {
    if (showLanguageSelector) {
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        if (!target.closest('.language-selector')) {
          setShowLanguageSelector(false);
        }
      };
      
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showLanguageSelector]);

 




  useEffect(() => {
    if (showLanguageSelector) {
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        if (!target.closest('.language-selector')) {
          setShowLanguageSelector(false);
        }
      };
      
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showLanguageSelector]);

  // Use actual data or fallbacks
  const displayDua = duaOfDay || fallbackDua;
  const displayPrayerTimes = prayerTimes || fallbackPrayerTimes;

  // Get the current dua to display
  const currentDua = allDuas.length > 0 ? allDuas[currentDuaIndex] : displayDua;
  useEffect(() => {
    if (currentDua) {
      // For demo purposes, we'll create more realistic sample translations
      // In a production app, these would come from your API or database
      const englishTranslation = currentDua.translation || '';
      
      setTranslations({
        english: englishTranslation,
        urdu: `بِسمِ اللہِ الرَّحمٰنِ الرَّحِيم - ${currentDua.title} - اللہ سے مدد مانگنے کی دعا۔`,
        french: `${englishTranslation} - Une supplication pour demander l'aide d'Allah.`,
        spanish: `${englishTranslation} - Una súplica para pedir la ayuda de Allah.`,
        indonesian: `${englishTranslation} - Doa memohon pertolongan kepada Allah.`,
        turkish: `${englishTranslation} - Allah'tan yardım istemek için bir dua.`
      });
      
      // Log to help with debugging
      console.log(`Set translations for dua: ${currentDua.title}`);
    }
  }, [currentDua]);

  useEffect(() => {
    console.log(`Language changed to: ${translationLanguage}`);
    console.log("Current translation:", translations[translationLanguage]);
  }, [translationLanguage, translations]);
 
  useEffect(() => {
    let slideInterval: NodeJS.Timeout;
    
    if (isAutoSliding && allDuas.length > 1) {
      slideInterval = setInterval(() => {
        setCurrentDuaIndex(prevIndex => (prevIndex + 1) % allDuas.length);
      }, 10000); // Change dua every 10 seconds
    }
    
    return () => {
      if (slideInterval) clearInterval(slideInterval);
    };
  }, [isAutoSliding, allDuas.length]);

 // Close language selector when clicking outside
 useEffect(() => {
  if (showLanguageSelector) {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.language-selector')) {
        setShowLanguageSelector(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }
}, [showLanguageSelector]);
 
  return (
    <Layout title="Noor Tales - Daily Islamic Stories for Kids">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Welcome Section */}
        <section className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-3xl md:text-4xl font-bold font-title text-primary mb-2">
              Welcome to Noor Tales
            </h1>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Daily Islamic animated stories for children, helping them
              understand key aspects of Islam through engaging content.
            </p>
          </motion.div>
        </section>

        {/* Islamic Date and Prayer Times - Compact Combined Card */}
        <section className="mb-8">
          <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
            <div className="flex flex-wrap md:flex-nowrap">
              {/* Islamic Date Side */}
              <div className="w-full md:w-1/3 p-4 md:border-r border-gray-100 flex flex-col justify-center items-center">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  📅 Today's Date
                </h3>
                <p className="text-base text-gray-500">
                  {today || "Saturday, March 8, 2025"}
                </p>

                {/* Always display the Hijri date (either from API or fallback) */}
                <div className="mt-2 text-center">
                  {hijriDate && hijriDate.data ? (
                    <>
                      <p className="text-primary font-medium text-base">
                        {hijriDate.data.hijri.day}{" "}
                        {hijriDate.data.hijri.month.en}{" "}
                        {hijriDate.data.hijri.year} AH
                      </p>
                      <p className="text-accent font-title text-lg">
                        {hijriDate.data.hijri.month.ar}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-primary font-medium text-base">
                        6 Rajab 1447 AH
                      </p>
                      <p className="text-accent font-title text-lg">رجب</p>
                    </>
                  )}
                </div>
              </div>

              {/* Prayer Times Side */}
              <div className="w-full md:w-2/3 p-4">
                <h3 className="text-lg font-semibold text-gray-700 mb-3 text-center md:text-left">
                  🕌 Prayer Times
                </h3>
                <div className="grid grid-cols-3 gap-2 md:gap-3">
                  <div className="bg-primary/5 rounded-lg text-center p-2">
                    <span className="block text-gray-700 text-sm font-medium">
                      <span className="text-lg">🌅</span> Fajr
                    </span>
                    <span className="font-semibold text-primary text-base">
                      {displayPrayerTimes.data.timings.Fajr}
                    </span>
                  </div>
                  <div className="bg-primary/5 rounded-lg text-center p-2">
                    <span className="block text-gray-700 text-sm font-medium">
                      <span className="text-lg">🌞</span> Sunrise
                    </span>
                    <span className="font-semibold text-primary text-base">
                      {displayPrayerTimes.data.timings.Sunrise}
                    </span>
                  </div>
                  <div className="bg-primary/5 rounded-lg text-center p-2">
                    <span className="block text-gray-700 text-sm font-medium">
                      <span className="text-lg">☀️</span> Dhuhr
                    </span>
                    <span className="font-semibold text-primary text-base">
                      {displayPrayerTimes.data.timings.Dhuhr}
                    </span>
                  </div>
                  <div className="bg-primary/5 rounded-lg text-center p-2">
                    <span className="block text-gray-700 text-sm font-medium">
                      <span className="text-lg">🌇</span> Asr
                    </span>
                    <span className="font-semibold text-primary text-base">
                      {displayPrayerTimes.data.timings.Asr}
                    </span>
                  </div>
                  <div className="bg-primary/5 rounded-lg text-center p-2">
                    <span className="block text-gray-700 text-sm font-medium">
                      <span className="text-lg">🌆</span> Maghrib
                    </span>
                    <span className="font-semibold text-primary text-base">
                      {displayPrayerTimes.data.timings.Maghrib}
                    </span>
                  </div>
                  <div className="bg-primary/5 rounded-lg text-center p-2">
                    <span className="block text-gray-700 text-sm font-medium">
                      <span className="text-lg">🌙</span> Isha
                    </span>
                    <span className="font-semibold text-primary text-base">
                      {displayPrayerTimes.data.timings.Isha}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

  

        {/* Featured Content Cards */}
        <section className="mb-8">
          <h2 className="text-2xl font-title font-bold text-primary mb-4 text-center">
            Today's Featured Content
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Dua Card */}
            <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl overflow-hidden shadow-md border border-primary/10 relative">
              <div className="h-12 bg-primary flex items-center justify-between px-4">
                <h3 className="text-white font-semibold">Dua of the Day</h3>
                <span className="bg-accent text-primary text-xs px-2 py-0.5 rounded-full font-medium">
                  Featured
                </span>
              </div>

              <div className="relative h-[400px]">
                {/* Video Background */}
                <div className="absolute inset-0 w-full h-full z-0">
                  {/* Fallback gradient background */}
                  <div className="w-full h-full bg-gradient-to-r from-primary/20 to-accent/20"></div>

                  {/* Video element */}
                  <video
                    className="absolute inset-0 w-full h-full object-cover"
                    autoPlay
                    muted
                    loop
                    playsInline
                  >
                    <source
                      src="/videos/islamic-background.mp4"
                      type="video/mp4"
                    />
                    {/* Your browser does not support the video tag. */}
                  </video>

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/40"></div>
                </div>

                {/* Dua Content */}
                <div className="absolute inset-0 z-10 flex flex-col justify-center items-center text-white p-5">
                  <div className="text-center mb-3">
                    <h3 className="text-xl md:text-2xl font-title mb-1">
                      {currentDua.title}
                    </h3>
                    <p className="text-sm opacity-90 mb-4">
                      {currentDua.situation}
                    </p>
                  </div>

                  <div className="max-w-xl w-full backdrop-blur-sm p-4 rounded-lg bg-gradient-to-b from-black/10 to-black/20 border border-white/10">
                    <div className="mb-3">
                      {/* Arabic text with improved font styling */}
                      <p className="arabic-text text-lg md:text-xl text-center mb-2 leading-relaxed">
                        {currentDua.arabic_text}
                      </p>
                      <p className="italic text-center text-xs md:text-sm opacity-80">
                        {currentDua.transliteration}
                      </p>
                    </div>

                    <div className="h-px bg-white opacity-20 my-3"></div>

                    <div className="text-center">
    <p className="mb-3 text-sm">
      {translations[translationLanguage]}
    </p>
  
    <div className="relative inline-block text-left mb-4 language-selector">
      <button
        type="button"
        onClick={() => setShowLanguageSelector(!showLanguageSelector)}
        className="inline-flex items-center justify-center px-3 py-1 text-xs font-medium text-white bg-primary/70 rounded hover:bg-primary transition-colors"
      >
        <span className="mr-1">
          {translationLanguage === 'english' ? 'English' : 
           translationLanguage === 'urdu' ? 'اردو' :
           translationLanguage === 'french' ? 'Français' :
           translationLanguage === 'spanish' ? 'Español' :
           translationLanguage === 'indonesian' ? 'Bahasa Indonesia' :
           translationLanguage === 'turkish' ? 'Türkçe' : 'Select Language'}
        </span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>
      
      {showLanguageSelector && (
        <div 
          className="origin-top-right absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="language-menu"
        >
          <div className="py-1" role="none">
            <button
              onClick={() => { setTranslationLanguage('english'); setShowLanguageSelector(false); }}
              className={`block w-full text-left px-4 py-2 text-sm ${translationLanguage === 'english' ? 'bg-gray-100 text-primary' : 'text-gray-700'}`}
              role="menuitem"
            >
              English
            </button>
            <button
              onClick={() => { setTranslationLanguage('urdu'); setShowLanguageSelector(false); }}
              className={`block w-full text-left px-4 py-2 text-sm ${translationLanguage === 'urdu' ? 'bg-gray-100 text-primary' : 'text-gray-700'}`}
              role="menuitem"
            >
              اردو
            </button>
            <button
              onClick={() => { setTranslationLanguage('french'); setShowLanguageSelector(false); }}
              className={`block w-full text-left px-4 py-2 text-sm ${translationLanguage === 'french' ? 'bg-gray-100 text-primary' : 'text-gray-700'}`}
              role="menuitem"
            >
              Français
            </button>
            <button
              onClick={() => { setTranslationLanguage('spanish'); setShowLanguageSelector(false); }}
              className={`block w-full text-left px-4 py-2 text-sm ${translationLanguage === 'spanish' ? 'bg-gray-100 text-primary' : 'text-gray-700'}`}
              role="menuitem"
            >
              Español
            </button>
            <button
              onClick={() => { setTranslationLanguage('indonesian'); setShowLanguageSelector(false); }}
              className={`block w-full text-left px-4 py-2 text-sm ${translationLanguage === 'indonesian' ? 'bg-gray-100 text-primary' : 'text-gray-700'}`}
              role="menuitem"
            >
              Bahasa Indonesia
            </button>
            <button
              onClick={() => { setTranslationLanguage('turkish'); setShowLanguageSelector(false); }}
              className={`block w-full text-left px-4 py-2 text-sm ${translationLanguage === 'turkish' ? 'bg-gray-100 text-primary' : 'text-gray-700'}`}
              role="menuitem"
            >
              Türkçe
            </button>
          </div>
        </div>
      )}
    </div>
  </div>



                  </div>

                  {/* Navigation Arrows for Slider */}
                  <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2">
                    {allDuas.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => goToDua(index)}
                        className={`w-2 h-2 rounded-full transition-opacity ${
                          index === currentDuaIndex
                            ? "bg-white opacity-100"
                            : "bg-white opacity-50 hover:opacity-75"
                        }`}
                        aria-label={`Dua slide ${index + 1}`}
                      ></button>
                    ))}
                  </div>

                  {allDuas.length > 1 && (
                    <>
                      <button
                        onClick={goToPrevDua}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-1 rounded-full transition-all"
                        aria-label="Previous dua"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          className="w-4 h-4"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 19l-7-7 7-7"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={goToNextDua}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-1 rounded-full transition-all"
                        aria-label="Next dua"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          className="w-4 h-4"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                    </>
                  )}
                </div>

                {/* Audio Control (if available) */}
                {currentDua.audio_url && (
                  <div className="absolute bottom-4 right-4 z-20">
                    <button
                      onClick={() => setIsDuaAudioPlaying(!isDuaAudioPlaying)}
                      className="bg-accent/20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-accent/50 transition-all"
                    >
                      {isDuaAudioPlaying ? <FaPause /> : <FaPlay />}
                    </button>

                    <div className="hidden">
                      <ReactAudioPlayer
                        src={currentDua.audio_url}
                        autoPlay={isDuaAudioPlaying}
                        controls
                        onPlay={() => setIsDuaAudioPlaying(true)}
                        onPause={() => setIsDuaAudioPlaying(false)}
                        onEnded={() => setIsDuaAudioPlaying(false)}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 flex justify-center">
                <Link
                  href="/duas"
                  className="inline-block bg-accent text-primary font-medium px-4 py-1.5 text-sm uppercase tracking-wide
                 transition-all duration-300 hover:bg-primary hover:text-white hover:scale-105 
                 rounded-md border border-accent/50 shadow-md"
                >
                  Explore More Duas
                </Link>
              </div>
            </div>

            {/* Story Card */}
            <div className="bg-gradient-to-r from-accent/5 to-accent/10 rounded-xl overflow-hidden shadow-md border border-accent/10 relative">
              <div className="h-12 bg-accent flex items-center justify-between px-4">
                <h3 className="text-primary font-semibold">Today's Story</h3>
                <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full font-medium">
                  Daily
                </span>
              </div>

              {dailyStory ? (
                <div className="p-5">
                 <div className="flex flex-col items-center justify-center h-[400px] p-5">
                    {/* Story Preview */}
                    <div className="flex-1 overflow-hidden">
                      <div className="relative w-full h-48 mb-3 rounded-lg overflow-hidden">
                        {dailyStory.thumbnail_url ? (
                          <Image
                            src={dailyStory.thumbnail_url}
                            fill
                            alt={dailyStory.title}
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                            <span className="text-primary text-opacity-70 text-xl font-medium">
                              Noor Tales
                            </span>
                          </div>
                        )}

                        {/* Audio Play Button */}
                        {dailyStory.audio_url && (
                          <button
                            onClick={() =>
                              setIsStoryAudioPlaying(!isStoryAudioPlaying)
                            }
                            className="absolute bottom-3 right-3 bg-accent text-primary p-2 rounded-full shadow-md"
                          >
                            {isStoryAudioPlaying ? (
                              <FaPause size={14} />
                            ) : (
                              <FaPlay size={14} />
                            )}
                          </button>
                        )}

                        {/* Hidden Audio Player */}
                        {dailyStory.audio_url && (
                          <div className="hidden">
                            <ReactAudioPlayer
                              src={dailyStory.audio_url}
                              autoPlay={isStoryAudioPlaying}
                              controls
                              onPlay={() => setIsStoryAudioPlaying(true)}
                              onPause={() => setIsStoryAudioPlaying(false)}
                              onEnded={() => setIsStoryAudioPlaying(false)}
                            />
                          </div>
                        )}
                      </div>

                      <h3 className="text-xl font-semibold text-primary mb-2">
                        {dailyStory.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-4 max-h-24 overflow-hidden">
                      
                       {dailyStory.content?.substring(0, 300) ||
                          "An inspiring story from Islamic history..."}
                        ...
                      </p>
                  

                      <div className="bg-primary/10 p-3 rounded-lg mt-3">
                        <h4 className="font-semibold text-primary text-sm mb-1">
                          Moral Lesson:
                        </h4>
                        <p className="text-gray-600 text-sm line-clamp-2">
                          {dailyStory.moral_lesson ||
                            "Be kind, patient, and remember Allah in all situations."}
                        </p>
                      </div>
                    </div>

                    {/* Action Area */}
                    <div className="mt-auto pt-4 w-full flex justify-between items-center">
                      <span className="text-md text-gray-500 max-w-[40%] truncate">
                        {dailyStory.publish_date &&
                          new Date(dailyStory.publish_date).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                            }
                          )}
                      </span>
                      <div className="flex items-center gap-3">
                        {user && (
                          <button
                            onClick={toggleFavorite}
                            className={`text-lg ${
                              isFavorite ? "text-accent" : "text-gray-400"
                            }`}
                          >
                            <FaStar />
                          </button>
                        )}
                        <Link
                          href={
                            dailyStory.id
                              ? `/stories/${dailyStory.id}`
                              : "/stories"
                          }
                          className="inline-flex items-center bg-primary text-white px-3 py-1.5 text-sm rounded-md hover:bg-primary/90"
                        >
                          Read Full Story{" "}
                          <FaArrowRight className="ml-1" size={10} />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative flex flex-col items-center justify-center h-[400px] p-5 overflow-hidden">
  {/* Islamic Background Image */}
  <div 
    className="absolute inset-0 bg-cover bg-center z-0"
    style={{ 
      backgroundImage: "url('/images/islamic-pattern-bg.png')", 
      filter: "brightness(0.35)" 
    }}
  ></div>
  
  {/* Gradient Overlay to ensure text visibility */}
  <div className="absolute inset-0 bg-gradient-to-b from-primary/30 to-black/50 z-0"></div>
  
  {/* Your existing content - now with z-10 to appear above the background */}
  <div className="relative z-10 flex flex-col items-center text-center">
   {/* Crescent Moon Icon from react-icons/fa instead of book */}
   <div className="w-16 h-16 flex items-center justify-center bg-white/10 backdrop-blur-sm rounded-full mb-4 border border-white/20">
   <svg 
  xmlns="http://www.w3.org/2000/svg" 
  viewBox="0 0 24 24" 
  fill="none" 
  stroke="currentColor" 
  strokeWidth="2" 
  strokeLinecap="round" 
  strokeLinejoin="round" 
  className="text-white w-8 h-8"
>
  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
</svg>
    </div>
    <p className="text-white text-center mb-3">
      Today's story is coming soon!
    </p>
    <Link
      href="/stories"
      className="inline-flex items-center bg-white text-primary px-4 py-2 text-sm rounded-md hover:bg-accent hover:text-white transition-all"
    >
      Browse Stories <FaArrowRight className="ml-1" size={10} />
    </Link>
  </div>
</div>
              )}

              <div className="p-4 flex justify-center">
                <Link
                  href="/stories"
                  className="inline-block bg-primary text-white font-medium px-4 py-1.5 text-sm uppercase tracking-wide
                  transition-all duration-300 hover:bg-accent hover:text-primary hover:scale-105 
                  rounded-md border border-primary/50 shadow-md"
                >
                  Explore All Stories
                </Link>
              </div>
            </div>
          </div>
        </section>
        {/* Features Section */}
        <section>
          <h2 className="text-2xl font-title font-bold text-primary mb-5 text-center">
            Explore Noor Tales
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <Link href="/prophets" className="block">
              <div className="bg-white rounded-xl shadow-md p-5 h-full hover:shadow-lg transition-shadow border border-gray-100">
                <h3 className="text-lg font-semibold text-primary mb-2">
                  Prophet Stories
                </h3>
                <p className="text-gray-600 text-sm mb-3">
                  Learn about the lives and teachings of the Prophets (AS).
                </p>
                <div className="text-accent font-medium text-sm">Explore →</div>
              </div>
            </Link>

            <Link href="/companions" className="block">
              <div className="bg-white rounded-xl shadow-md p-5 h-full hover:shadow-lg transition-shadow border border-gray-100">
                <h3 className="text-lg font-semibold text-primary mb-2">
                  Companions' Stories
                </h3>
                <p className="text-gray-600 text-sm mb-3">
                  Discover the inspiring lives of the Sahabah (RA).
                </p>
                <div className="text-accent font-medium text-sm">Explore →</div>
              </div>
            </Link>

            <Link href="/duas" className="block">
              <div className="bg-white rounded-xl shadow-md p-5 h-full hover:shadow-lg transition-shadow border border-gray-100">
                <h3 className="text-lg font-semibold text-primary mb-2">
                  Duas & Hadiths
                </h3>
                <p className="text-gray-600 text-sm mb-3">
                  Collection of authentic duas and hadiths for daily life.
                </p>
                <div className="text-accent font-medium text-sm">Explore →</div>
              </div>
            </Link>
          </div>
        </section>
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  console.log("==== getServerSideProps START ====");
  try {
    // Get today's date
    const today = new Date().toISOString().split("T")[0];
    console.log("Today's date:", today);
    console.log(
      "Available env variables:",
      Object.keys(process.env).filter((key) => key.includes("NEXT"))
    );

    // Check if a story exists for today
    let { data: dailyStory, error: storyError } = await supabase
      .from("stories")
      .select("*")
      .eq("publish_date", today)
      .eq("category", "daily")
      .single();

    console.log(
      "Story query result:",
      dailyStory ? "Story found" : "No story found"
    );
    if (storyError) console.log("Story query error code:", storyError.code);

    // If no story exists for today, generate one
    if (storyError && storyError.code === "PGRST116") {
      console.log("No story found for today, generating a new one...");
      console.log("OPENAI_API_KEY available:", !!process.env.OPENAI_API_KEY);

      try {
        // Call our API endpoint that now uses Gemini instead of directly calling OpenAI
        console.log("Calling story generation API...");
        
        // Make sure you have a proper base URL for your API endpoint
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                      (process.env.NODE_ENV === "development" 
                        ? "http://localhost:3000" 
                        : "https://your-production-domain.com");
        
        const response = await fetch(`${baseUrl}/api/generate-story`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.ADMIN_API_KEY}`
          }
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`API responded with status: ${response.status}, message: ${errorData.message || 'Unknown error'}`);
        }
        
        const result = await response.json();
        
        console.log("API response:", result);
        
        if (result.success && result.storyId) {
          // Fetch the newly generated story
          const { data: newStory, error: fetchError } = await supabase
            .from("stories")
            .select("*")
            .eq("id", result.storyId)
            .single();
            
          if (fetchError) {
            throw fetchError;
          }
          
          dailyStory = newStory;
          console.log("Successfully retrieved newly generated story with ID:", newStory.id);
        } else {
          throw new Error("Story generation API didn't return a valid story ID");
        }
      } catch (generationError) {
        console.error("Error generating new story:", generationError);
        // Don't rethrow the error - just log it and continue with a null dailyStory
      }
    }

    // Fetch dua of the day using imported module
    console.log("==== Fetching dua of the day ====");
    let duaOfDay = null;
    try {
      console.log("Using imported duaApi module directly");
      duaOfDay = await duaApi.fetchDuaOfDay();
      console.log(
        "Dua of day result:",
        duaOfDay ? `Found: ${duaOfDay.title}` : "Not found"
      );
    } catch (error) {
      console.error("Error fetching dua of day:", error);

      // Fallback to sample data
      console.log("Using sample data as fallback");
      const sampleDuas = duaApi.getSampleDuas();
      duaOfDay = sampleDuas.find((dua) => dua.is_dua_of_day) || sampleDuas[0];

      console.log("Fallback dua:", duaOfDay.title);
    }

    // Format date for API call with detailed logging
    console.log("==== Fetching Islamic date ====");
    let formattedDate;
    try {
      formattedDate = new Date()
        .toLocaleDateString("en-GB")
        .replace(/\//g, "-");
      console.log("Formatted date for API:", formattedDate);
    } catch (dateError) {
      console.error("Error formatting date:", dateError);
      formattedDate = "06-03-2025"; // Fallback
    }

    // Fetch Hijri date from Aladhan API
    let hijriDate = null;
    try {
      console.log(
        `Making request to: https://api.aladhan.com/v1/gToH?date=${formattedDate}`
      );
      const hijriDateResponse = await axios.get(
        `https://api.aladhan.com/v1/gToH?date=${formattedDate}`
      );
      console.log("Hijri date API response status:", hijriDateResponse.status);
      console.log(
        "Hijri date API response data structure:",
        Object.keys(hijriDateResponse.data)
      );
      hijriDate = hijriDateResponse.data;
    } catch (error) {
      console.error("Error fetching Hijri date:", error);
    }

    // Fetch prayer times from Aladhan API with detailed logging
    console.log("==== Fetching prayer times ====");
    let prayerTimes = null;
    try {
      console.log(
        "Making request to: https://api.aladhan.com/v1/timingsByCity?city=Riyadh&country=Saudi Arabia&method=2"
      );
      const prayerTimesResponse = await axios.get(
        `https://api.aladhan.com/v1/timingsByCity?city=Riyadh&country=Saudi Arabia&method=2`
      );
      console.log(
        "Prayer times API response status:",
        prayerTimesResponse.status
      );
      console.log(
        "Prayer times API response data structure:",
        Object.keys(prayerTimesResponse.data)
      );
      prayerTimes = prayerTimesResponse.data;
    } catch (error) {
      console.error("Error fetching prayer times:", error);
    }

    // Construct the formatted today string
    const formattedToday = new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Log the final props being returned
    console.log("==== Final Props ====");
    console.log(
      "today:",
      typeof formattedToday,
      formattedToday ? "value exists" : "value is empty"
    );
    console.log(
      "hijriDate:",
      typeof hijriDate,
      hijriDate ? "value exists" : "value is empty"
    );
    console.log(
      "prayerTimes:",
      typeof prayerTimes,
      prayerTimes ? "value exists" : "value is empty"
    );
    console.log(
      "duaOfDay:",
      typeof duaOfDay,
      duaOfDay ? "value exists" : "value is empty"
    );
    console.log(
      "dailyStory:",
      typeof dailyStory,
      dailyStory ? "value exists" : "value is empty"
    );

    // Return props with a safety check to ensure all values are serializable
    const safeProps = {
      dailyStory: dailyStory ? JSON.parse(JSON.stringify(dailyStory)) : null,
      duaOfDay: duaOfDay ? JSON.parse(JSON.stringify(duaOfDay)) : null,
      today: formattedToday,
      hijriDate: hijriDate ? JSON.parse(JSON.stringify(hijriDate)) : null,
      prayerTimes: prayerTimes ? JSON.parse(JSON.stringify(prayerTimes)) : null,
    };

    console.log("==== getServerSideProps END ====");
    return { props: safeProps };
  } catch (error) {
    console.error("==== FATAL ERROR in getServerSideProps ====", error);

    // Return hardcoded fallback data as a last resort
    return {
      props: {
        dailyStory: null,
        duaOfDay: {
          id: "1",
          title: "Dua for Protection",
          arabic_text:
            "اللَّهُمَّ احْفَظْنِي مِنْ بَيْنِ يَدَيَّ، وَمِنْ خَلْفِي، وَعَنْ يَمِينِي، وَعَنْ شِمَالِي، وَمِنْ فَوْقِي، وَأَعُوذُ بِعَظَمَتِكَ أَنْ أُغْتَالَ مِنْ تَحْتِي",
          transliteration: "Allahumma ihfadhni min bayni yadayya...",
          translation: "O Allah, protect me from my front, from my back...",
          situation: "Seeking protection",
          is_dua_of_day: true,
        },
        today: "Thursday, March 6, 2025",
        hijriDate: {
          data: {
            hijri: {
              day: "6",
              month: {
                en: "Rajab",
                ar: "رجب",
              },
              year: "1447",
            },
          },
        },
        prayerTimes: {
          data: {
            timings: {
              Fajr: "05:30",
              Sunrise: "06:45",
              Dhuhr: "12:15",
              Asr: "15:30",
              Maghrib: "18:00",
              Isha: "19:30",
            },
          },
        },
      },
    };
  }
};
