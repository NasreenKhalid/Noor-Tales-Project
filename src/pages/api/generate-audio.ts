import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';
import axios from 'axios';

type ResponseData = {
  success: boolean;
  message?: string;
  audioUrl?: string;
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
  
  // Get story ID and content from request body
  const { storyId, content, contentType = 'story' } = req.body;
  
  if (!storyId || !content) {
    return res.status(400).json({
      success: false,
      message: 'Story ID and content are required'
    });
  }
  
  try {
    // Use a child-friendly voice for narration (Adam is a good option from ElevenLabs)
    // Voice IDs can be obtained from the ElevenLabs API
    const voiceId = 'pNInz6obpgDQGcFmaJgB'; // Adam voice ID from ElevenLabs
    
    // Generate audio with ElevenLabs API
    const elevenLabsResponse = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        text: content,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.75,
          similarity_boost: 0.75,
          style: 0.3,
          use_speaker_boost: true
        }
      },
      {
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': process.env.ELEVEN_LABS_API_KEY
        },
        responseType: 'arraybuffer'
      }
    );
    
    // Convert audio binary data to base64
    const audioData = Buffer.from(elevenLabsResponse.data, 'binary').toString('base64');
    
    // Store audio file in Supabase storage
    const fileName = `audio/${contentType}/${storyId}.mp3`;
    
    const { data: storageData, error: storageError } = await supabase
      .storage
      .from('noor-tales-media')
      .upload(fileName, Buffer.from(audioData, 'base64'), {
        contentType: 'audio/mpeg',
        upsert: true
      });
    
    if (storageError) {
      throw new Error(`Error storing audio file: ${storageError.message}`);
    }
    
    // Get public URL for the audio file
    const { data: publicUrlData } = await supabase
      .storage
      .from('noor-tales-media')
      .getPublicUrl(fileName);
    
    const audioUrl = publicUrlData.publicUrl;
    
    // Update the content with the audio URL
    let updateTable;
    
    switch (contentType) {
      case 'story':
        updateTable = 'stories';
        break;
      case 'prophet_story':
        updateTable = 'prophet_stories';
        break;
      case 'companion_story':
        updateTable = 'companion_stories';
        break;
      case 'dua':
        updateTable = 'duas';
        break;
      default:
        updateTable = 'stories';
    }
    
    const { error: updateError } = await supabase
      .from(updateTable)
      .update({ audio_url: audioUrl })
      .eq('id', storyId);
    
    if (updateError) {
      throw new Error(`Error updating content with audio URL: ${updateError.message}`);
    }
    
    return res.status(200).json({
      success: true,
      message: 'Audio generated and stored successfully',
      audioUrl
    });
  } catch (error: any) {
    console.error('Error generating audio:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'An error occurred while generating audio'
    });
  }
}