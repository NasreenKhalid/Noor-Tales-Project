// scripts/seed-duas.js
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

const sampleDuas = [
  {
    title: "Dua before sleeping",
    arabic_text: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا",
    transliteration: "Bismika Allahumma amootu wa ahya",
    translation: "In Your name, O Allah, I die and I live.",
    audio_url: null,
    situation: "Before going to sleep",
    is_dua_of_day: true,
    is_premium: false
  },
  {
    title: "Dua when entering home",
    arabic_text: "اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَ الْمَوْلِجِ وَخَيْرَ الْمَخْرَجِ، بِسْمِ اللَّهِ وَلَجْنَا، وَبِسْمِ اللَّهِ خَرَجْنَا، وَعَلَى اللَّهِ رَبِّنَا تَوَكَّلْنَا",
    transliteration: "Allahumma inni as'aluka khayral mawliji wa khayral makhraji. Bismillahi walajna wa bismillahi kharajna wa 'ala Rabbina tawakkalna",
    translation: "O Allah, I ask You for the good of the entrance and the good of the exit. In the name of Allah we enter, in the name of Allah we leave, and upon our Lord we depend.",
    audio_url: null,
    situation: "When entering home",
    is_dua_of_day: false,
    is_premium: false
  },
  {
    title: "Dua for knowledge",
    arabic_text: "رَبِّ زِدْنِي عِلْمًا",
    transliteration: "Rabbi zidni ilma",
    translation: "My Lord, increase me in knowledge.",
    audio_url: null,
    situation: "When seeking knowledge",
    is_dua_of_day: false,
    is_premium: false
  },
  {
    title: "Morning remembrance",
    arabic_text: "اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ",
    transliteration: "Allahumma bika asbahna, wa bika amsayna, wa bika nahya, wa bika namootu, wa ilayka an-nushoor",
    translation: "O Allah, by You we enter the morning, by You we enter the evening, by You we live, by You we die, and to You is the resurrection.",
    audio_url: null,
    situation: "Morning remembrance",
    is_dua_of_day: false,
    is_premium: false
  }
];

const sampleHadiths = [
  {
    title: "Importance of Intention",
    content: "The Prophet (ﷺ) said: 'Actions are according to intentions, and everyone will get what was intended.'",
    source: "Sahih al-Bukhari",
    reference: "1",
    category: "Intention",
    is_premium: false
  },
  {
    title: "Removing Harm from the Path",
    content: "The Prophet (ﷺ) said: 'Removing harmful things from the road is an act of charity (sadaqah).'",
    source: "Sahih Muslim",
    reference: "1009",
    category: "Good Deeds",
    is_premium: false
  },
  {
    title: "The Best Among You",
    content: "The Prophet (ﷺ) said: 'The best among you are those who learn the Quran and teach it.'",
    source: "Sahih al-Bukhari",
    reference: "5027",
    category: "Quran",
    is_premium: false
  }
];

async function seedDuasAndHadiths() {
  try {
    // Insert duas
    console.log('Inserting duas...');
    const { data: duasData, error: duasError } = await supabase
      .from('duas')
      .upsert(sampleDuas, { onConflict: 'title' })
      .select();
    
    if (duasError) {
      console.error('Error inserting duas:', duasError);
    } else {
      console.log('Successfully inserted duas:', duasData.length);
    }
    
    // Insert hadiths
    console.log('Inserting hadiths...');
    const { data: hadithsData, error: hadithsError } = await supabase
      .from('hadiths')
      .upsert(sampleHadiths, { onConflict: 'title' })
      .select();
    
    if (hadithsError) {
      console.error('Error inserting hadiths:', hadithsError);
    } else {
      console.log('Successfully inserted hadiths:', hadithsData.length);
    }
    
    console.log('Done!');
  } catch (error) {
    console.error('Error in script:', error);
  }
}

seedDuasAndHadiths();