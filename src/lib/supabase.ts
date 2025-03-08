import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Type definitions for database tables
export type Profile = {
  id: string;
  username: string | null;
  avatar_url: string | null;
  points: number;
  created_at: string;
  updated_at: string;
};

export type Story = {
  id: string;
  title: string;
  content: string;
  moral_lesson: string;
  audio_url: string | null;
  thumbnail_url: string | null;
  category: string;
  publish_date: string;
  is_premium: boolean;
  created_at: string;
  updated_at: string;
};

export type ProphetStory = {
  id: string;
  prophet_name: string;
  title: string;
  content: string;
  moral_lesson: string;
  audio_url: string | null;
  thumbnail_url: string | null;
  is_premium: boolean;
  created_at: string;
  updated_at: string;
};

export type CompanionStory = {
  id: string;
  companion_name: string;
  title: string;
  content: string;
  moral_lesson: string;
  audio_url: string | null;
  thumbnail_url: string | null;
  is_premium: boolean;
  created_at: string;
  updated_at: string;
};

export type Dua = {
  id: string;
  title: string;
  arabic_text: string;
  transliteration: string;
  translation: string;
  audio_url: string | null;
  situation: string;
  is_dua_of_day: boolean;
  is_premium: boolean;
  created_at: string;
  updated_at: string;
};

export type Hadith = {
  id: string;
  title: string;
  content: string;
  source: string;
  reference: string;
  category: string;
  is_premium: boolean;
  created_at: string;
  updated_at: string;
};

export type UserFavorite = {
  id: string;
  user_id: string;
  content_type: string;
  content_id: string;
  created_at: string;
};

export type Badge = {
  id: string;
  name: string;
  description: string;
  icon_url: string;
  points_required: number;
  category: string;
  created_at: string;
  updated_at: string;
};

export type UserBadge = {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
};

export type UserActivity = {
  id: string;
  user_id: string;
  activity_type: string;
  content_id: string | null;
  points_earned: number;
  created_at: string;
};

export type Subscription = {
  id: string;
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  status: string;
  plan_type: string;
  current_period_start: string | null;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
};