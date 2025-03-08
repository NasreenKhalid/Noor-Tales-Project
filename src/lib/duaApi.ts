import axios from 'axios';

// Using Aladhan API as the base URL since we're already using it for other Islamic data
const API_BASE_URL = 'https://api.aladhan.com/v1';

// Create axios instance
const duaApiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Type definitions
export interface Dua {
  id: string;
  title: string;
  arabic_text: string;
  transliteration: string;
  translation: string;
  audio_url: string | null;
  situation: string;
  is_dua_of_day: boolean;
  is_premium: boolean;
  created_at?: string;
}

export interface Hadith {
  id: string;
  title: string;
  content: string;
  source: string;
  reference: string;
  category: string;
  is_premium: boolean;
  created_at?: string;
}

/**
 * Fetch all duas
 * Note: Since Aladhan API doesn't have a duas endpoint, we'll fallback to sample data
 */
export const fetchAllDuas = async (): Promise<Dua[]> => {
  try {
    // For demonstration purposes, we could check if Aladhan has a duas endpoint in the future
    // const response = await duaApiClient.get('/duas');
    // return response.data;
    
    // Aladhan doesn't currently have a duas API, so fallback to sample data
    console.log('Using sample duas data (Aladhan API does not have duas endpoint)');
    return getSampleDuas();
  } catch (error) {
    console.error('Error fetching duas:', error);
    return getSampleDuas();
  }
};

/**
 * Fetch dua of the day
 * Simulates a dua of the day by selecting one based on the current date
 */
export const fetchDuaOfDay = async (): Promise<Dua | null> => {
  try {
    // For now, use sample data directly instead of API call
    const sampleDuas = getSampleDuas();
    // Get a different dua each day based on date
    const dayOfMonth = new Date().getDate();
    const index = dayOfMonth % sampleDuas.length;
    return {
      ...sampleDuas[index],
      is_dua_of_day: true
    };
  } catch (error) {
    console.error('Error fetching dua of the day:', error);
    return null;
  }
};

/**
 * Fetch duas by situation
 */
export const fetchDuasBySituation = async (situation: string): Promise<Dua[]> => {
  try {
    // Filter sample duas by situation
    const allDuas = getSampleDuas();
    return allDuas.filter(dua => 
      dua.situation.toLowerCase().includes(situation.toLowerCase())
    );
  } catch (error) {
    console.error(`Error fetching duas for situation ${situation}:`, error);
    return [];
  }
};

/**
 * Fetch all hadiths
 * Note: Aladhan API doesn't have a hadiths endpoint either
 */
export const fetchAllHadiths = async (): Promise<Hadith[]> => {
  try {
    // Fallback to sample data
    console.log('Using sample hadiths data (Aladhan API does not have hadiths endpoint)');
    return getSampleHadiths();
  } catch (error) {
    console.error('Error fetching hadiths:', error);
    return getSampleHadiths();
  }
};

/**
 * Fetch hadiths by category
 */
export const fetchHadithsByCategory = async (category: string): Promise<Hadith[]> => {
  try {
    // Filter sample hadiths by category
    const allHadiths = getSampleHadiths();
    return allHadiths.filter(hadith => 
      hadith.category.toLowerCase().includes(category.toLowerCase())
    );
  } catch (error) {
    console.error(`Error fetching hadiths for category ${category}:`, error);
    return [];
  }
};

/**
 * Sample duas data
 */
export const getSampleDuas = (): Dua[] => {
  return [
    {
      id: "1",
      title: "Dua before sleeping",
      arabic_text: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا",
      transliteration: "Bismika Allahumma amootu wa ahya",
      translation: "In Your name, O Allah, I die and I live.",
      audio_url: null,
      situation: "Before going to sleep",
      is_dua_of_day: true,
      is_premium: false,
      created_at: new Date().toISOString()
    },
    {
      id: "2",
      title: "Dua when entering home",
      arabic_text: "اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَ الْمَوْلِجِ وَخَيْرَ الْمَخْرَجِ، بِسْمِ اللَّهِ وَلَجْنَا، وَبِسْمِ اللَّهِ خَرَجْنَا، وَعَلَى اللَّهِ رَبِّنَا تَوَكَّلْنَا",
      transliteration: "Allahumma inni as'aluka khayral mawliji wa khayral makhraji. Bismillahi walajna wa bismillahi kharajna wa 'ala Rabbina tawakkalna",
      translation: "O Allah, I ask You for the good of the entrance and the good of the exit. In the name of Allah we enter, in the name of Allah we leave, and upon our Lord we depend.",
      audio_url: null,
      situation: "When entering home",
      is_dua_of_day: false,
      is_premium: false,
      created_at: new Date().toISOString()
    },
    {
      id: "3",
      title: "Dua for knowledge",
      arabic_text: "رَبِّ زِدْنِي عِلْمًا",
      transliteration: "Rabbi zidni ilma",
      translation: "My Lord, increase me in knowledge.",
      audio_url: null,
      situation: "When seeking knowledge",
      is_dua_of_day: false,
      is_premium: false,
      created_at: new Date().toISOString()
    },
    {
      id: "4",
      title: "Morning remembrance",
      arabic_text: "اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ",
      transliteration: "Allahumma bika asbahna, wa bika amsayna, wa bika nahya, wa bika namootu, wa ilayka an-nushoor",
      translation: "O Allah, by You we enter the morning, by You we enter the evening, by You we live, by You we die, and to You is the resurrection.",
      audio_url: null,
      situation: "Morning remembrance",
      is_dua_of_day: false,
      is_premium: false,
      created_at: new Date().toISOString()
    },
    {
      id: "5",
      title: "Dua for protection",
      arabic_text: "اللَّهُمَّ احْفَظْنِي مِنْ بَيْنِ يَدَيَّ، وَمِنْ خَلْفِي، وَعَنْ يَمِينِي، وَعَنْ شِمَالِي، وَمِنْ فَوْقِي، وَأَعُوذُ بِعَظَمَتِكَ أَنْ أُغْتَالَ مِنْ تَحْتِي",
      transliteration: "Allahumma ihfadhni min bayni yadayya, wa min khalfi, wa 'an yameeni, wa 'an shimaali, wa min fawqi, wa 'aoodhu bi'adhamatika an oghtaala min tahti",
      translation: "O Allah, protect me from my front, from my back, from my right, from my left, and from above me, and I seek refuge in Your Magnificence from being taken unaware from beneath me.",
      audio_url: null,
      situation: "Seeking protection",
      is_dua_of_day: false,
      is_premium: false,
      created_at: new Date().toISOString()
    },
    {
      id: "6",
      title: "Dua before eating",
      arabic_text: "بِسْمِ اللَّه",
      transliteration: "Bismillah",
      translation: "In the name of Allah",
      audio_url: null,
      situation: "Before eating",
      is_dua_of_day: false,
      is_premium: false,
      created_at: new Date().toISOString()
    },
    {
      id: "7",
      title: "Dua after eating",
      arabic_text: "الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ",
      transliteration: "Alhamdu lillahil-ladhi at'amani hadha, wa razaqanihi, min ghayri hawlin minni wa la quwwatin",
      translation: "All praise is due to Allah Who has given me this food and provided it for me with no effort or power on my part.",
      audio_url: null,
      situation: "After eating",
      is_dua_of_day: false,
      is_premium: false,
      created_at: new Date().toISOString()
    },
    {
      id: "8",
      title: "Dua for forgiveness",
      arabic_text: "رَبِّ اغْفِرْ لِي خَطِيئَتِي وَجَهْلِي، وَإِسْرَافِي فِي أَمْرِي، وَمَا أَنْتَ أَعْلَمُ بِهِ مِنِّي",
      transliteration: "Rabbi ghfir li khati'ati wa jahli, wa israfi fi amri, wa ma anta a'lamu bihi minni",
      translation: "O my Lord, forgive me for my sins and my ignorance, and for my exceeding the limits in my affairs, and for those things about which You are more knowledgeable than I am.",
      audio_url: null,
      situation: "Seeking forgiveness",
      is_dua_of_day: false,
      is_premium: false,
      created_at: new Date().toISOString()
    },
    {
      id: "9",
      title: "Dua for guidance",
      arabic_text: "اللَّهُمَّ اهْدِنِي لأَحْسَنِ الأَعْمَالِ وَأَحْسَنِ الأَخْلاقِ، لا يَهْدِي لأَحْسَنِهَا إِلاَّ أَنْتَ، وَقِنِي سَيِّئَ الأَعْمَالِ وَسَيِّئَ الأَخْلاقِ، لا يَقِي سَيِّئَهَا إِلاَّ أَنْتَ",
      transliteration: "Allahumma ihdini li ahsanil-a'mali wa ahsanil-akhlaqi, la yahdi li ahsaniha illa anta, wa qini sayyi'al-a'mali wa sayyi'al-akhlaqi, la yaqi sayyi'aha illa anta",
      translation: "O Allah, guide me to the best of deeds and the best of character, for none can guide to the best except You. And protect me from bad deeds and bad character, for none can protect from these except You.",
      audio_url: null,
      situation: "Seeking guidance",
      is_dua_of_day: false,
      is_premium: false,
      created_at: new Date().toISOString()
    },
    {
      id: "10",
      title: "Dua for anxiety and stress",
      arabic_text: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَالْعَجْزِ وَالْكَسَلِ، وَالْبُخْلِ وَالْجُبْنِ، وَضَلَعِ الدَّيْنِ وَغَلَبَةِ الرِّجَالِ",
      transliteration: "Allahumma inni a'udhu bika minal-hammi wal-hazani, wal-'ajzi wal-kasali, wal-bukhli wal-jubni, wa dala'id-dayni wa ghalabatir-rijal",
      translation: "O Allah, I seek refuge in You from worry and grief, from incapacity and laziness, from miserliness and cowardice, from being heavily in debt and from being overpowered by men.",
      audio_url: null,
      situation: "Anxiety and stress",
      is_dua_of_day: false,
      is_premium: false,
      created_at: new Date().toISOString()
    }
  ];
};

/**
 * Sample hadiths data
 */
export const getSampleHadiths = (): Hadith[] => {
  return [
    {
      id: "1",
      title: "Importance of Intention",
      content: "The Prophet (ﷺ) said: 'Actions are according to intentions, and everyone will get what was intended.'",
      source: "Sahih al-Bukhari",
      reference: "1",
      category: "Intention",
      is_premium: false,
      created_at: new Date().toISOString()
    },
    {
      id: "2",
      title: "Removing Harm from the Path",
      content: "The Prophet (ﷺ) said: 'Removing harmful things from the road is an act of charity (sadaqah).'",
      source: "Sahih Muslim",
      reference: "1009",
      category: "Good Deeds",
      is_premium: false,
      created_at: new Date().toISOString()
    },
    {
      id: "3",
      title: "The Best Among You",
      content: "The Prophet (ﷺ) said: 'The best among you are those who learn the Quran and teach it.'",
      source: "Sahih al-Bukhari",
      reference: "5027",
      category: "Quran",
      is_premium: false,
      created_at: new Date().toISOString()
    },
    {
      id: "4",
      title: "Kindness to Parents",
      content: "A man asked the Prophet (ﷺ), 'Which deed is most beloved to Allah?' He said, 'Prayer at its proper time.' The man asked, 'Then what?' He said, 'Being dutiful to parents.' The man asked, 'Then what?' He said, 'Jihad in the cause of Allah.'",
      source: "Sahih al-Bukhari",
      reference: "527",
      category: "Good Deeds",
      is_premium: false,
      created_at: new Date().toISOString()
    },
    {
      id: "5",
      title: "Smiling as Charity",
      content: "The Prophet (ﷺ) said: 'Your smile for your brother is a charity.'",
      source: "Jami at-Tirmidhi",
      reference: "1956",
      category: "Charity",
      is_premium: false,
      created_at: new Date().toISOString()
    },
    {
      id: "6",
      title: "Controlling Anger",
      content: "The Prophet (ﷺ) said: 'The strong is not the one who overcomes the people by his strength, but the strong is the one who controls himself while in anger.'",
      source: "Sahih al-Bukhari",
      reference: "6114",
      category: "Self-Control",
      is_premium: false,
      created_at: new Date().toISOString()
    },
    {
      id: "7",
      title: "Good Character",
      content: "The Prophet (ﷺ) said: 'The most perfect of the believers in faith is the one who is best in moral character.'",
      source: "Sunan Abu Dawud",
      reference: "4682",
      category: "Character",
      is_premium: false,
      created_at: new Date().toISOString()
    },
    {
      id: "8",
      title: "Seeking Knowledge",
      content: "The Prophet (ﷺ) said: 'Whoever follows a path in pursuit of knowledge, Allah makes the path to Paradise easy for him.'",
      source: "Sahih Muslim",
      reference: "2699",
      category: "Knowledge",
      is_premium: false,
      created_at: new Date().toISOString()
    },
    {
      id: "9",
      title: "Planting Trees",
      content: "The Prophet (ﷺ) said: 'If the Hour (the day of Resurrection) is about to be established and one of you was holding a palm shoot, let him take advantage of even one second before the Hour is established to plant it.'",
      source: "Musnad Ahmad",
      reference: "12981",
      category: "Environment",
      is_premium: false,
      created_at: new Date().toISOString()
    },
    {
      id: "10",
      title: "Treating Animals Well",
      content: "The Prophet (ﷺ) said: 'There is a reward for kindness to every living thing.'",
      source: "Sahih al-Bukhari",
      reference: "2466",
      category: "Kindness",
      is_premium: false,
      created_at: new Date().toISOString()
    }
  ];
};