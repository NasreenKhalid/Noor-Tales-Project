const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Service Key available:', !!supabaseServiceKey);

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const sampleStories = [
  {
    title: "The Kind Helper",
    content: "Once there was a young boy named Ahmad who lived in a small village. Every day, he would help his neighbors with their chores without expecting anything in return. One day, an old man was struggling to carry his groceries up a steep hill. Ahmad saw him and immediately offered to help. The old man was grateful and thanked Ahmad for his kindness. As they walked, the old man asked Ahmad why he was always so helpful to others. Ahmad replied, 'My parents taught me that helping others is a way of thanking Allah for His blessings.' The old man smiled and said, 'Your parents have taught you well. Remember, the Prophet Muhammad (peace be upon him) said: \"The best of people are those who are most beneficial to others.\"' Ahmad continued to help others throughout his life, inspiring many people in his village to do the same.",
    moral_lesson: "Being helpful to others is a way to show gratitude to Allah and follow the example of Prophet Muhammad (peace be upon him).",
    audio_url: null, // This field can be null
    thumbnail_url: "https://images.unsplash.com/photo-1526976668912-1a811878dd37?w=800&auto=format&fit=crop", // Example image URL
    category: "daily",
    publish_date: new Date().toISOString().split('T')[0],
    is_premium: false
  },
  {
    title: "The Truth Teller",
    content: "Fatima was known in her class for always telling the truth. One day, while playing with her friends, she accidentally broke a window with her ball. When the teacher asked who did it, everyone remained silent. Fatima was afraid, but she remembered what her mother always told her: 'Allah loves those who speak the truth.' With courage, Fatima raised her hand and admitted what she had done. To her surprise, instead of being punished, her teacher praised her honesty and arranged for her to help fix the window. Later, the teacher told the class about the importance of honesty in Islam and how the Prophet Muhammad (peace be upon him) was known as 'Al-Amin' (the trustworthy) even before he became a prophet. Fatima felt a warm feeling in her heart, knowing she had done the right thing.",
    moral_lesson: "Honesty is a virtue loved by Allah, and speaking the truth even when it's difficult is the mark of a true believer.",
    audio_url: null,
    thumbnail_url: "https://images.unsplash.com/photo-1607453998774-d533f65dac99?w=800&auto=format&fit=crop",
    category: "daily",
    publish_date: new Date(Date.now() - 86400000).toISOString().split('T')[0], // Yesterday
    is_premium: false
  },
  {
    title: "The Patient Student",
    content: "Yusuf was struggling with his math homework. While other students seemed to understand the topic easily, he found it very difficult. He felt like giving up many times but remembered the story of Prophet Ayub (Job) and his patience during hardship. Inspired by this, Yusuf decided to be patient and keep trying. He spent extra time studying, asked questions in class, and even sought help from his older brother. After weeks of persistent effort, math finally started to make sense to him. By the end of the semester, Yusuf had improved so much that his teacher used his progress as an example to motivate other students. When his friends asked him how he did it, Yusuf said, 'Allah says in the Quran that He is with those who are patient. I just kept trying and trusted in His help.'",
    moral_lesson: "Patience and perseverance in facing challenges are qualities that Allah loves and rewards.",
    audio_url: null,
    thumbnail_url: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&auto=format&fit=crop",
    category: "daily",
    publish_date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0], // Two days ago
    is_premium: false
  }
];

async function seedStories() {
  console.log('Seeding stories...');
  console.log('Sample story data:', JSON.stringify(sampleStories[0], null, 2));
  
  try {
    const { data, error } = await supabase
      .from('stories')
      .insert(sampleStories)
      .select();
    
    if (error) {
      console.error('Error seeding stories:', error);
      return;
    }
    
    console.log('Response data:', data);
    console.log('Successfully seeded stories!');
  } catch (e) {
    console.error('Exception occurred:', e);
  }
}

seedStories();