// Zodiac Color Schemes for consistent visual coding
export const zodiacColors = {
  Aries: {
    primary: '#DC2626', // red-600
    secondary: '#FEE2E2', // red-100
    text: '#991B1B', // red-800
    bg: '#FEF2F2' // red-50
  },
  Taurus: {
    primary: '#16A34A', // green-600
    secondary: '#DCFCE7', // green-100
    text: '#15803D', // green-800
    bg: '#F0FDF4' // green-50
  },
  Gemini: {
    primary: '#CA8A04', // yellow-600
    secondary: '#FEF9C3', // yellow-100
    text: '#A16207', // yellow-800
    bg: '#FFFBEB' // yellow-50
  },
  Cancer: {
    primary: '#3B82F6', // blue-600
    secondary: '#DBEAFE', // blue-100
    text: '#1E40AF', // blue-800
    bg: '#EFF6FF' // blue-50
  },
  Leo: {
    primary: '#EA580C', // orange-600
    secondary: '#FED7AA', // orange-100
    text: '#C2410C', // orange-800
    bg: '#FFF7ED' // orange-50
  },
  Virgo: {
    primary: '#A16207', // amber-600
    secondary: '#FEF3C7', // amber-100
    text: '#92400E', // amber-800
    bg: '#FFFBEB' // amber-50
  },
  Libra: {
    primary: '#EC4899', // pink-600
    secondary: '#FCE7F3', // pink-100
    text: '#BE185D', // pink-800
    bg: '#FDF2F8' // pink-50
  },
  Scorpio: {
    primary: '#7F1D1D', // red-900
    secondary: '#FEE2E2', // red-100
    text: '#450A0A', // red-950
    bg: '#FEF2F2' // red-50
  },
  Sagittarius: {
    primary: '#7C3AED', // violet-600
    secondary: '#EDE9FE', // violet-100
    text: '#5B21B6', // violet-800
    bg: '#F5F3FF' // violet-50
  },
  Capricorn: {
    primary: '#374151', // gray-700
    secondary: '#F3F4F6', // gray-100
    text: '#111827', // gray-900
    bg: '#F9FAFB' // gray-50
  },
  Aquarius: {
    primary: '#2563EB', // blue-600
    secondary: '#DBEAFE', // blue-100
    text: '#1E40AF', // blue-800
    bg: '#EFF6FF' // blue-50
  },
  Pisces: {
    primary: '#0D9488', // teal-600
    secondary: '#CCFBF1', // teal-100
    text: '#115E59', // teal-800
    bg: '#F0FDFA' // teal-50
  }
};

// Tailwind CSS classes for easy use
export const zodiacTailwindClasses = {
  Aries: {
    text: 'text-red-600',
    bg: 'bg-red-600',
    border: 'border-red-600',
    hover: 'hover:bg-red-700',
    textDark: 'text-red-800',
    bgLight: 'bg-red-100'
  },
  Taurus: {
    text: 'text-green-600',
    bg: 'bg-green-600',
    border: 'border-green-600',
    hover: 'hover:bg-green-700',
    textDark: 'text-green-800',
    bgLight: 'bg-green-100'
  },
  Gemini: {
    text: 'text-yellow-600',
    bg: 'bg-yellow-600',
    border: 'border-yellow-600',
    hover: 'hover:bg-yellow-700',
    textDark: 'text-yellow-800',
    bgLight: 'bg-yellow-100'
  },
  Cancer: {
    text: 'text-blue-600',
    bg: 'bg-blue-600',
    border: 'border-blue-600',
    hover: 'hover:bg-blue-700',
    textDark: 'text-blue-800',
    bgLight: 'bg-blue-100'
  },
  Leo: {
    text: 'text-orange-600',
    bg: 'bg-orange-600',
    border: 'border-orange-600',
    hover: 'hover:bg-orange-700',
    textDark: 'text-orange-800',
    bgLight: 'bg-orange-100'
  },
  Virgo: {
    text: 'text-amber-600',
    bg: 'bg-amber-600',
    border: 'border-amber-600',
    hover: 'hover:bg-amber-700',
    textDark: 'text-amber-800',
    bgLight: 'bg-amber-100'
  },
  Libra: {
    text: 'text-pink-600',
    bg: 'bg-pink-600',
    border: 'border-pink-600',
    hover: 'hover:bg-pink-700',
    textDark: 'text-pink-800',
    bgLight: 'bg-pink-100'
  },
  Scorpio: {
    text: 'text-red-900',
    bg: 'bg-red-900',
    border: 'border-red-900',
    hover: 'hover:bg-red-950',
    textDark: 'text-red-950',
    bgLight: 'bg-red-100'
  },
  Sagittarius: {
    text: 'text-violet-600',
    bg: 'bg-violet-600',
    border: 'border-violet-600',
    hover: 'hover:bg-violet-700',
    textDark: 'text-violet-800',
    bgLight: 'bg-violet-100'
  },
  Capricorn: {
    text: 'text-gray-700',
    bg: 'bg-gray-700',
    border: 'border-gray-700',
    hover: 'hover:bg-gray-800',
    textDark: 'text-gray-900',
    bgLight: 'bg-gray-100'
  },
  Aquarius: {
    text: 'text-blue-600',
    bg: 'bg-blue-600',
    border: 'border-blue-600',
    hover: 'hover:bg-blue-700',
    textDark: 'text-blue-800',
    bgLight: 'bg-blue-100'
  },
  Pisces: {
    text: 'text-teal-600',
    bg: 'bg-teal-600',
    border: 'border-teal-600',
    hover: 'hover:bg-teal-700',
    textDark: 'text-teal-800',
    bgLight: 'bg-teal-100'
  }
};

// Helper function to get zodiac color for a sign
export const getZodiacColor = (signName: string) => {
  const normalizedSign = signName.charAt(0).toUpperCase() + signName.slice(1).toLowerCase();
  return zodiacColors[normalizedSign as keyof typeof zodiacColors] || zodiacColors.Aries;
};

// Helper function to get Tailwind classes for a sign
export const getZodiacTailwind = (signName: string) => {
  const normalizedSign = signName.charAt(0).toUpperCase() + signName.slice(1).toLowerCase();
  return zodiacTailwindClasses[normalizedSign as keyof typeof zodiacTailwindClasses] || zodiacTailwindClasses.Aries;
};

// Helper function to get zodiac sign from degree
export const getZodiacSignFromDegree = (degree: number): string => {
  const signs = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ];
  
  const signIndex = Math.floor(degree / 30);
  return signs[signIndex % 12];
}; 