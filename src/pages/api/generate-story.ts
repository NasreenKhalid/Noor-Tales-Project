import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';
import axios from 'axios';

type ResponseData = {
  success: boolean;
  message?: string;
  storyId?: string;
};

const storyImages = [
  '/images/stories/mosque.jpg',
  '/images/stories/quran.jpg',
  '/images/stories/prayer.jpg',
  '/images/stories/kindness.jpg',
  '/images/stories/sharing.jpg',
  '/images/stories/nature.jpg',
  '/images/stories/family.jpg',
  '/images/stories/mosque-night.jpg',
  '/images/stories/arabic-calligraphy.jpg',
  '/images/stories/islamic-art.jpg'
];



export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
  
  // Check for admin API key for authorization
  const apiKey = req.headers.authorization?.split('Bearer ')[1];
  
  if (!apiKey || apiKey !== process.env.ADMIN_API_KEY) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  
  try {
    // const randomImageUrl = storyImages[Math.floor(Math.random() * storyImages.length)];
    
    const randomImageUrl = storyImages[Math.floor(Math.random() * storyImages.length)];
    const today = new Date().toISOString().split('T')[0];
    
    // Check if there's already a story for today
    const { data: existingStory, error: checkError } = await supabase
      .from('stories')
      .select('id')
      .eq('publish_date', today)
      .eq('category', 'daily')
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') {
      throw new Error(`Error checking for existing story: ${checkError.message}`);
    }
    
    if (existingStory) {
      return res.status(200).json({
        success: true,
        message: 'Story for today already exists',
        storyId: existingStory.id
      });
    }
    console.log("Making request to Gemini API...");
    // Generate a story using Google Gemini API
    const geminiResponse = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent',
      {
        contents: [
          {
            parts: [
              {
                text: `You are a children's storyteller specializing in Islamic stories with clear moral lessons. 
                Create an engaging short story (around 500 words) for Muslim children aged 5-10.
                The story should be simple, educational, and teach Islamic values.
                
                Format your response as a valid JSON object with the following structure:
                {
                  "title": "Title of the story",
                  "content": "The complete story text",
                  "moral_lesson": "A clear explanation of the moral lesson in 1-2 sentences"
                }
                
                Generate a new Islamic children's story for today.`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1500
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': process.env.GEMINI_API_KEY
        }
      }
    );

    console.log("Received response from Gemini API");
  console.log("Response status:", geminiResponse.status);
  // console.log("Response first 200 chars:", responseText.substring(0, 200));
  
    // Parse the response
    const responseText = geminiResponse.data.candidates[0].content.parts[0].text;
    console.log("Response first 200 chars:", responseText.substring(0, 200));
    let storyData;
    
    try {
      // Find JSON object in the response using regex
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in the response');
      }
      
      storyData = JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Error parsing Gemini response:', error);
      throw new Error('Error parsing the generated story data');
    }
    
    // Validate story data
    if (!storyData.title || !storyData.content || !storyData.moral_lesson) {
      throw new Error('Generated story data is incomplete');
    }
    
console.log("ZRYTEYYTYYYYGGGGGG",storyData.title,storyData.randomImageUrl)
    // Insert new story into database
    const { data: newStory, error: insertError } = await supabase
      .from('stories')
      .insert({
        title: storyData.title,
        content: storyData.content,
        moral_lesson: storyData.moral_lesson,
        category: 'daily',
        publish_date: today,
        is_premium: false,
        thumbnail_url: randomImageUrl,
      })
      .select('id')
      .single();
    
    if (insertError) {
      throw new Error(`Error inserting new story: ${insertError.message}`);
    }
    
    return res.status(200).json({
      success: true,
      message: 'Story generated successfully',
      storyId: newStory.id
    });
  } catch (error: any) {
    console.error('Error generating story:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'An error occurred while generating the story'
    });
  }
}