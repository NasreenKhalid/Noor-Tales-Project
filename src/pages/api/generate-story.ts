import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';
import axios from 'axios';

type ResponseData = {
  success: boolean;
  message?: string;
  storyId?: string;
};

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
    
    // Generate a story using OpenAI
    const openaiResponse = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are a children's storyteller specializing in Islamic stories with clear moral lessons. 
            Create an engaging short story (around 500 words) for Muslim children aged 5-10.
            The story should be simple, educational, and teach Islamic values.
            
            Format your response as a valid JSON object with the following structure:
            {
              "title": "Title of the story",
              "content": "The complete story text",
              "moral_lesson": "A clear explanation of the moral lesson in 1-2 sentences"
            }`
          },
          {
            role: 'user',
            content: 'Generate a new Islamic children\'s story for today.'
          }
        ],
        temperature: 0.7,
        max_tokens: 1500
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        }
      }
    );
    
    // Parse the response
    const responseContent = openaiResponse.data.choices[0].message.content;
    let storyData;
    
    try {
      storyData = JSON.parse(responseContent);
    } catch (error) {
      console.error('Error parsing OpenAI response:', error);
      throw new Error('Error parsing the generated story data');
    }
    
    // Validate story data
    if (!storyData.title || !storyData.content || !storyData.moral_lesson) {
      throw new Error('Generated story data is incomplete');
    }
    
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
        // Note: We'll add audio_url later after generating it with ElevenLabs
      })
      .select('id')
      .single();
    
    if (insertError) {
      throw new Error(`Error inserting new story: ${insertError.message}`);
    }
    
    // TODO: Generate audio with ElevenLabs
    // This would be a separate API call to ElevenLabs
    // Then update the story with the audio URL
    
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