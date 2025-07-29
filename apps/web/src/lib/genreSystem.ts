import { GenreType, MoodType, GenreConfiguration, MoodConfiguration } from '../types';

// Genre System Configuration (Frontend version)
export const genreConfigurations: Record<GenreType, GenreConfiguration> = {
  ambient: {
    name: 'ambient',
    instruments: {
      melodic: ['sine', 'triangle'],
      rhythmic: ['noise'],
      bass: ['sine'],
      pad: ['sine', 'triangle']
    },
    tempo: { min: 60, max: 80, default: 70 },
    scales: ['C', 'D', 'E', 'F', 'G', 'A', 'Bb'],
    visualStyle: {
      colors: ['#4A90E2', '#7B68EE', '#9370DB'],
      motionSpeed: 0.3,
      opacity: 0.7,
      filter: 'blur(2px)'
    },
    narration: {
      tone: 'whispered',
      language: 'poetic',
      style: 'meditative'
    },
    textile: 'silk'
  },

  folk: {
    name: 'folk',
    instruments: {
      melodic: ['triangle', 'sine'],
      rhythmic: ['square'],
      bass: ['sine'],
      pad: ['triangle']
    },
    tempo: { min: 80, max: 120, default: 100 },
    scales: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
    visualStyle: {
      colors: ['#8B4513', '#D2691E', '#CD853F'],
      motionSpeed: 0.8,
      opacity: 0.9,
      filter: 'sepia(0.3)'
    },
    narration: {
      tone: 'warm',
      language: 'storytelling',
      style: 'narrative'
    },
    textile: 'wool'
  },

  jazz: {
    name: 'jazz',
    instruments: {
      melodic: ['sawtooth', 'triangle'],
      rhythmic: ['square'],
      bass: ['sawtooth'],
      pad: ['sine']
    },
    tempo: { min: 100, max: 160, default: 130 },
    scales: ['C', 'D', 'E', 'F#', 'G', 'A', 'B'],
    visualStyle: {
      colors: ['#FF6B35', '#F7931E', '#FFD700'],
      motionSpeed: 1.2,
      opacity: 0.8,
      filter: 'contrast(1.2)'
    },
    narration: {
      tone: 'smooth',
      language: 'improvisational',
      style: 'conversational'
    },
    textile: 'velvet'
  },

  classical: {
    name: 'classical',
    instruments: {
      melodic: ['sine', 'triangle'],
      rhythmic: ['sine'],
      bass: ['sine'],
      pad: ['sine']
    },
    tempo: { min: 60, max: 140, default: 90 },
    scales: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
    visualStyle: {
      colors: ['#F5F5DC', '#DEB887', '#D2B48C'],
      motionSpeed: 0.6,
      opacity: 0.9,
      filter: 'brightness(1.1)'
    },
    narration: {
      tone: 'formal',
      language: 'elegant',
      style: 'orchestral'
    },
    textile: 'satin'
  },

  electronic: {
    name: 'electronic',
    instruments: {
      melodic: ['sawtooth', 'square'],
      rhythmic: ['noise'],
      bass: ['sawtooth'],
      pad: ['sine']
    },
    tempo: { min: 120, max: 140, default: 130 },
    scales: ['C', 'D', 'E', 'F', 'G', 'A', 'Bb'],
    visualStyle: {
      colors: ['#00FFFF', '#FF00FF', '#FFFF00'],
      motionSpeed: 1.5,
      opacity: 0.8,
      filter: 'hue-rotate(180deg)'
    },
    narration: {
      tone: 'digital',
      language: 'technical',
      style: 'futuristic'
    },
    textile: 'neoprene'
  },

  rock: {
    name: 'rock',
    instruments: {
      melodic: ['sawtooth', 'square'],
      rhythmic: ['noise'],
      bass: ['sawtooth'],
      pad: ['sine']
    },
    tempo: { min: 120, max: 160, default: 140 },
    scales: ['C', 'D', 'E', 'F', 'G', 'A', 'Bb'],
    visualStyle: {
      colors: ['#FF0000', '#8B0000', '#DC143C'],
      motionSpeed: 1.8,
      opacity: 0.9,
      filter: 'contrast(1.5)'
    },
    narration: {
      tone: 'powerful',
      language: 'direct',
      style: 'energetic'
    },
    textile: 'leather'
  },

  blues: {
    name: 'blues',
    instruments: {
      melodic: ['sawtooth', 'triangle'],
      rhythmic: ['square'],
      bass: ['sawtooth'],
      pad: ['sine']
    },
    tempo: { min: 80, max: 120, default: 100 },
    scales: ['C', 'D', 'Eb', 'F', 'G', 'Ab', 'Bb'],
    visualStyle: {
      colors: ['#000080', '#191970', '#4169E1'],
      motionSpeed: 0.7,
      opacity: 0.8,
      filter: 'saturate(1.3)'
    },
    narration: {
      tone: 'soulful',
      language: 'emotional',
      style: 'expressive'
    },
    textile: 'denim'
  },

  world: {
    name: 'world',
    instruments: {
      melodic: ['triangle', 'sine'],
      rhythmic: ['noise'],
      bass: ['sine'],
      pad: ['triangle']
    },
    tempo: { min: 70, max: 130, default: 100 },
    scales: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
    visualStyle: {
      colors: ['#FFD700', '#FF8C00', '#FF4500'],
      motionSpeed: 1.0,
      opacity: 0.9,
      filter: 'warmth(1.2)'
    },
    narration: {
      tone: 'exotic',
      language: 'cultural',
      style: 'traditional'
    },
    textile: 'silk'
  },

  techno: {
    name: 'techno',
    instruments: {
      melodic: ['sawtooth', 'square'],
      rhythmic: ['noise'],
      bass: ['sawtooth'],
      pad: ['sine']
    },
    tempo: { min: 120, max: 140, default: 130 },
    scales: ['C', 'D', 'E', 'F', 'G', 'A', 'Bb'],
    visualStyle: {
      colors: ['#00FF00', '#32CD32', '#90EE90'],
      motionSpeed: 2.0,
      opacity: 0.7,
      filter: 'brightness(1.3)'
    },
    narration: {
      tone: 'mechanical',
      language: 'minimal',
      style: 'repetitive'
    },
    textile: 'vinyl'
  },

  chill: {
    name: 'chill',
    instruments: {
      melodic: ['sine', 'triangle'],
      rhythmic: ['sine'],
      bass: ['sine'],
      pad: ['sine']
    },
    tempo: { min: 70, max: 90, default: 80 },
    scales: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
    visualStyle: {
      colors: ['#98FB98', '#90EE90', '#32CD32'],
      motionSpeed: 0.4,
      opacity: 0.6,
      filter: 'blur(1px)'
    },
    narration: {
      tone: 'relaxed',
      language: 'casual',
      style: 'conversational'
    },
    textile: 'cotton'
  }
};

// Mood to Genre Mapping
export const moodConfigurations: Record<MoodType, MoodConfiguration> = {
  contemplative: {
    name: 'contemplative',
    genreWeights: { ambient: 0.6, classical: 0.3, chill: 0.1 },
    tempo: { min: 60, max: 80, default: 70 },
    visualFilter: 'blur(1px) brightness(0.9)',
    narrationTone: 'thoughtful'
  },

  energetic: {
    name: 'energetic',
    genreWeights: { rock: 0.4, techno: 0.3, electronic: 0.2, jazz: 0.1 },
    tempo: { min: 130, max: 160, default: 145 },
    visualFilter: 'contrast(1.3) brightness(1.2)',
    narrationTone: 'dynamic'
  },

  melancholic: {
    name: 'melancholic',
    genreWeights: { blues: 0.5, ambient: 0.3, classical: 0.2 },
    tempo: { min: 60, max: 90, default: 75 },
    visualFilter: 'saturate(0.7) brightness(0.8)',
    narrationTone: 'introspective'
  },

  uplifting: {
    name: 'uplifting',
    genreWeights: { world: 0.4, folk: 0.3, jazz: 0.2, chill: 0.1 },
    tempo: { min: 100, max: 130, default: 115 },
    visualFilter: 'brightness(1.1) saturate(1.2)',
    narrationTone: 'inspiring'
  },

  mysterious: {
    name: 'mysterious',
    genreWeights: { ambient: 0.5, electronic: 0.3, techno: 0.2 },
    tempo: { min: 70, max: 100, default: 85 },
    visualFilter: 'contrast(1.4) brightness(0.7)',
    narrationTone: 'enigmatic'
  },

  peaceful: {
    name: 'peaceful',
    genreWeights: { chill: 0.5, ambient: 0.3, classical: 0.2 },
    tempo: { min: 60, max: 80, default: 70 },
    visualFilter: 'blur(0.5px) brightness(0.9)',
    narrationTone: 'serene'
  },

  passionate: {
    name: 'passionate',
    genreWeights: { rock: 0.4, blues: 0.3, jazz: 0.2, world: 0.1 },
    tempo: { min: 100, max: 140, default: 120 },
    visualFilter: 'saturate(1.4) contrast(1.2)',
    narrationTone: 'intense'
  },

  grounded: {
    name: 'grounded',
    genreWeights: { folk: 0.5, world: 0.3, blues: 0.2 },
    tempo: { min: 80, max: 110, default: 95 },
    visualFilter: 'sepia(0.2) brightness(0.95)',
    narrationTone: 'earthy'
  }
};

// Fallback logic
export const getFallbackGenre = (): GenreType => {
  return 'ambient';
};

export const getSecondaryFallbackGenre = (): GenreType => {
  return 'folk';
};

// Random genre selection for landing page
export const getRandomGenre = (): GenreType => {
  const genres: GenreType[] = [
    'ambient', 'folk', 'jazz', 'classical', 'electronic',
    'rock', 'blues', 'world', 'techno', 'chill'
  ];
  return genres[Math.floor(Math.random() * genres.length)];
};

// Mood to genre conversion
export const convertMoodToGenre = (mood: MoodType): GenreType => {
  const moodConfig = moodConfigurations[mood];
  const genres = Object.entries(moodConfig.genreWeights);
  
  // Sort by weight and return the highest weighted genre
  genres.sort((a, b) => (b[1] || 0) - (a[1] || 0));
  return genres[0][0] as GenreType;
};

// Genre validation
export const isValidGenre = (genre: string): genre is GenreType => {
  return Object.keys(genreConfigurations).includes(genre);
};

// Mood validation
export const isValidMood = (mood: string): mood is MoodType => {
  return Object.keys(moodConfigurations).includes(mood);
};

// Get genre configuration with fallback
export const getGenreConfig = (genre?: GenreType): GenreConfiguration => {
  if (!genre || !isValidGenre(genre)) {
    return genreConfigurations[getFallbackGenre()];
  }
  return genreConfigurations[genre];
};

// Get mood configuration
export const getMoodConfig = (mood?: MoodType): MoodConfiguration | null => {
  if (!mood || !isValidMood(mood)) {
    return null;
  }
  return moodConfigurations[mood];
}; 