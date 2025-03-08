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
        console.error('Error loading duas:', error);
      }
    };
    
    loadAllDuas();
  }, []);

// Set up auto-sliding
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
// Navigation handlers
const goToPrevDua = useCallback(() => {
  setCurrentDuaIndex(prevIndex => (prevIndex - 1 + allDuas.length) % allDuas.length);
  // Temporarily pause auto-sliding when manually navigating
  setIsAutoSliding(false);
  setTimeout(() => setIsAutoSliding(true), 15000); // Resume after 15 seconds
}, [allDuas.length]);

const goToNextDua = useCallback(() => {
  setCurrentDuaIndex(prevIndex => (prevIndex + 1) % allDuas.length);
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

  // Use actual data or fallbacks
  const displayDua = duaOfDay || fallbackDua;
  const displayPrayerTimes = prayerTimes || fallbackPrayerTimes;

// Get the current dua to display
const currentDua = allDuas.length > 0 ? allDuas[currentDuaIndex] : displayDua;
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
              <div className="w-full md:w-1/3 p-3 md:border-r border-gray-100 flex flex-col justify-center items-center">
                <h3 className="text-base font-semibold text-gray-700 mb-1">
                  📅 Today's Date
                </h3>
                <p className="text-sm text-gray-500">
                  {today || "Thursday, March 6, 2025"}
                </p>

                {/* Always display the Hijri date (either from API or fallback) */}
                {hijriDate && hijriDate.data && (
                  <div className="mt-1 text-center">
                    <p className="text-primary font-medium text-sm">
                      {hijriDate.data.hijri.day} {hijriDate.data.hijri.month.en}{" "}
                      {hijriDate.data.hijri.year} AH
                    </p>
                    <p className="text-accent font-title">
                      {hijriDate.data.hijri.month.ar}
                    </p>
                  </div>
                )}
              </div>

              {/* Prayer Times Side */}
              <div className="w-full md:w-2/3 p-3">
                <h3 className="text-base font-semibold text-gray-700 mb-2 text-center md:text-left">
                  🕌 Prayer Times
                </h3>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-1 text-xs">
                  <div className="text-center p-1">
                    <span className="block text-gray-600">Fajr</span>
                    <span className="font-semibold text-primary">
                      {displayPrayerTimes.data.timings.Fajr}
                    </span>
                  </div>
                  <div className="text-center p-1">
                    <span className="block text-gray-600">Sunrise</span>
                    <span className="font-semibold text-primary">
                      {displayPrayerTimes.data.timings.Sunrise}
                    </span>
                  </div>
                  <div className="text-center p-1">
                    <span className="block text-gray-600">Dhuhr</span>
                    <span className="font-semibold text-primary">
                      {displayPrayerTimes.data.timings.Dhuhr}
                    </span>
                  </div>
                  <div className="text-center p-1">
                    <span className="block text-gray-600">Asr</span>
                    <span className="font-semibold text-primary">
                      {displayPrayerTimes.data.timings.Asr}
                    </span>
                  </div>
                  <div className="text-center p-1">
                    <span className="block text-gray-600">Maghrib</span>
                    <span className="font-semibold text-primary">
                      {displayPrayerTimes.data.timings.Maghrib}
                    </span>
                  </div>
                  <div className="text-center p-1">
                    <span className="block text-gray-600">Isha</span>
                    <span className="font-semibold text-primary">
                      {displayPrayerTimes.data.timings.Isha}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Dua of the Day Section */}
        <section className="mb-8">
          <div className="relative overflow-hidden rounded-xl shadow-md h-[400px]">
            {/* Background Gradient */}
            <div className="absolute inset-0 w-full h-full z-0">
              {/* Add fallback background color/gradient in case video doesn't load */}
              <div className="w-full h-full bg-gradient-to-r from-primary/20 to-accent/20"></div>

              {/* Video background */}
              <video
                className="absolute inset-0 w-full h-full object-cover"
                autoPlay
                muted
                loop
                playsInline
                poster="/images/islamic-bg-poster.jpg" /* Optional poster image as fallback */
              >
                <source src="/videos/islamic-background.mp4" type="video/mp4" />
                {/* Your browser does not support the video tag. */}
              </video>

              {/* Gradient overlay on top of video */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/40"></div>
            </div>

            {/* Content Overlay */}
            <div className="absolute inset-0 z-10 flex flex-col justify-center items-center text-white p-5">
              <div className="text-center mb-4">
                <h2 className="text-xs uppercase tracking-widest mb-1 opacity-80">
                  Dua of the Day
                </h2>
                <div className="w-8 h-0.5 bg-white mx-auto mb-4 opacity-70"></div>
                <h3 className="text-2xl md:text-3xl font-title mb-2">
                  {displayDua.title}
                </h3>
                <p className="text-sm opacity-90 mb-6">
                  {displayDua.situation}
                </p>
              </div>

              <div className="max-w-xl w-full backdrop-blur-sm p-6 rounded-lg bg-gradient-to-b from-black/20 to-black/30 border border-white/10">
                <div className="mb-4">
                   {/* Arabic text with improved font styling */}
          <p className="font-title text-lg md:text-xl text-center mb-3 leading-relaxed"
             style={{ 
               fontFamily: '"Amiri", "Scheherazade New", serif', 
               letterSpacing: '0.02em',
               lineHeight: '1.8'
             }}>
            {displayDua.arabic_text}
          </p>
                  <p className="italic text-center text-xs md:text-sm opacity-80">
                    {displayDua.transliteration}
                  </p>
                </div>

                <div className="h-px bg-white opacity-20 my-4"></div>

                <div className="text-center">
                  <p className="mb-6 text-sm md:text-base">
                    {displayDua.translation}
                  </p>

                  <Link
                    href="/duas"
                    className="inline-block bg-accent text-primary font-medium px-6 py-2 text-sm uppercase tracking-widest 
                            transition-all duration-300 hover:bg-primary hover:text-white hover:scale-105 
                            rounded-md border border-accent/50 shadow-lg"
                  >
                    Explore More Duas
                  </Link>
                </div>
              </div>

              {/* Audio Control (if available) */}
              {displayDua.audio_url && (
                <div className="absolute bottom-4 right-4">
                  <button
                    onClick={() => setIsDuaAudioPlaying(!isDuaAudioPlaying)}
                    className="bg-accent/20 backdrop-blur-sm text-white p-2 rounded-full 
                            hover:bg-accent/50 transition-all duration-300"
                  >
                    {isDuaAudioPlaying ? <FaPause /> : <FaPlay />}
                  </button>

                  <div className="hidden">
                    <ReactAudioPlayer
                      src={displayDua.audio_url}
                      autoPlay={isDuaAudioPlaying}
                      controls
                      onPlay={() => setIsDuaAudioPlaying(true)}
                      onPause={() => setIsDuaAudioPlaying(false)}
                      onEnded={() => setIsDuaAudioPlaying(false)}
                    />
                  </div>
                </div>
              )}
{/* Auto-Slider Navigation Dots */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
        <button 
          className="w-2 h-2 rounded-full bg-white opacity-100" 
          aria-label="Dua slide 1"
        ></button>
        <button 
          className="w-2 h-2 rounded-full bg-white opacity-50 hover:opacity-100 transition-opacity" 
          aria-label="Dua slide 2"
        ></button>
        <button 
          className="w-2 h-2 rounded-full bg-white opacity-50 hover:opacity-100 transition-opacity" 
          aria-label="Dua slide 3"
        ></button>
      </div>
      
      {/* Navigation Arrows for Slider */}
      <button 
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-all"
        aria-label="Previous dua"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button 
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-all"
        aria-label="Next dua"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>


            </div>
          </div>
        </section>

        {/* Today's Story Section */}
        <section className="mb-8">
          <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl shadow-md overflow-hidden border border-primary/10 relative">
            <div className="p-5">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-title font-bold text-primary">
                  Today's Story
                </h2>
                <span className="bg-accent text-primary text-xs px-3 py-1 rounded-full font-medium">
                  Daily
                </span>
              </div>

              {dailyStory ? (
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Story Preview - Image */}
                  <div className="lg:w-1/3">
                    <div className="relative w-full h-48 mb-3 rounded-lg overflow-hidden">
                      {dailyStory.thumbnail_url ? (
                        <Image
                          src={dailyStory.thumbnail_url}
                          fill
                          alt={dailyStory.title}
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-primary/20 flex items-center justify-center">
                          <span className="text-primary text-opacity-70 text-xl font-medium">
                            Noor Tales
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Story Content */}
                  <div className="lg:w-2/3">
                    <h3 className="text-xl font-semibold text-primary mb-2">
                      {dailyStory.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">
                      {dailyStory.content?.substring(0, 220) ||
                        "An inspiring story from Islamic history..."}
                      ...
                    </p>

                    <div className="bg-primary/10 p-3 rounded-lg mb-4">
                      <h4 className="font-semibold text-primary text-sm mb-1">
                        Moral Lesson:
                      </h4>
                      <p className="text-gray-600 text-sm">
                        {dailyStory.moral_lesson ||
                          "Be kind, patient, and remember Allah in all situations."}
                      </p>
                    </div>

                    <Link
                      href={
                        dailyStory.id ? `/stories/${dailyStory.id}` : "/stories"
                      }
                      className="inline-flex items-center bg-primary text-white px-3 py-1.5 text-sm rounded-md hover:bg-primary/90"
                    >
                      Read Full Story{" "}
                      <FaArrowRight className="ml-1" size={10} />
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <FaBook className="text-primary/30 text-6xl mb-4" />
                  <p className="text-gray-500 text-center mb-3">
                    Today's story is coming soon!
                  </p>
                  <Link
                    href="/stories"
                    className="inline-flex items-center bg-primary text-white px-4 py-2 text-sm rounded-md hover:bg-primary/90"
                  >
                    Browse Stories <FaArrowRight className="ml-1" size={10} />
                  </Link>
                </div>
              )}
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
        console.log("Attempting to call OpenAI API...");

        // Generate a new story using OpenAI
        const openaiResponse = await axios.post(
          "https://api.openai.com/v1/chat/completions",
          {
            model: "gpt-3.5-turbo",
            messages: [
              {
                role: "user",
                content:
                  'Write a very short Islamic story for children with this format: {"title": "Story Title", "content": "Story content", "moral_lesson": "The moral lesson"}',
              },
            ],
            temperature: 0.7,
            max_tokens: 500,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            },
          }
        );

        console.log("OpenAI API call successful!");
        console.log("Response status:", openaiResponse.status);

        // Parse the response
        const responseContent = openaiResponse.data.choices[0].message.content;

        let storyData;
        try {
          storyData = JSON.parse(responseContent);
          console.log("Successfully parsed story data:", storyData.title);
        } catch (parseError) {
          console.error("Error parsing OpenAI response:", parseError);
          throw new Error("Failed to parse the generated story");
        }

        // Insert the new story into the database
        console.log("Inserting new story into database...");
        const { data: newStory, error: insertError } = await supabase
          .from("stories")
          .insert({
            title: storyData.title,
            content: storyData.content,
            moral_lesson: storyData.moral_lesson,
            audio_url: null,
            thumbnail_url: null,
            category: "daily",
            publish_date: today,
            is_premium: false,
          })
          .select()
          .single();

        if (insertError) {
          console.error("Error inserting new story:", insertError);
          throw insertError;
        }

        // Use the newly generated story
        dailyStory = newStory;
        console.log(
          "Successfully generated and saved a new story with ID:",
          newStory.id
        );
      } catch (generationError) {
        console.error("Error generating new story:", generationError);
        if (generationError.response) {
          console.error(
            "OpenAI API error details:",
            generationError.response.data
          );
        }
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
