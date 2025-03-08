const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Environment check:');
console.log('Supabase URL:', supabaseUrl);
console.log('Service Key available:', !!supabaseServiceKey);
console.log('Service Key first few chars:', supabaseServiceKey ? supabaseServiceKey.substring(0, 5) + '...' : 'none');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testConnection() {
  console.log('Testing Supabase connection...');
  
  // Test 1: List tables
  console.log('Test 1: Listing tables...');
  try {
    const { data: tables, error: listError } = await supabase
      .from('pg_catalog.pg_tables')
      .select('tablename')
      .eq('schemaname', 'public');
    
    if (listError) {
      console.error('Error listing tables:', listError);
    } else {
      console.log('Tables found:', tables.map(t => t.tablename).join(', '));
    }
  } catch (e) {
    console.error('Exception listing tables:', e);
  }
  
  // Test 2: Check stories table
  console.log('Test 2: Checking stories table...');
  try {
    const { data: stories, error: queryError } = await supabase
      .from('stories')
      .select('*')
      .limit(1);
    
    if (queryError) {
      console.error('Error querying stories:', queryError);
    } else {
      console.log('Stories query successful, found:', stories.length);
      console.log('Table structure:', stories.length ? Object.keys(stories[0]).join(', ') : 'No rows to show structure');
    }
  } catch (e) {
    console.error('Exception querying stories:', e);
  }
  
  // Test 3: Insert a single test story
  console.log('Test 3: Inserting a test story...');
  try {
    const testStory = {
      title: "Test Story",
      content: "This is a test story content.",
      moral_lesson: "Testing is important.",
      audio_url: null,
      thumbnail_url: null,
      category: "test",
      publish_date: new Date().toISOString().split('T')[0],
      is_premium: false
    };
    
    const { data: insertResult, error: insertError } = await supabase
      .from('stories')
      .insert(testStory)
      .select();
    
    if (insertError) {
      console.error('Error inserting test story:', insertError);
    } else {
      console.log('Test story inserted successfully:', insertResult);
    }
  } catch (e) {
    console.error('Exception inserting test story:', e);
  }
}

testConnection();