// Internationalization Framework (Phase 7)
export type SupportedLanguage = 'en' | 'es' | 'ko';

export interface TranslationKeys {
  // Navigation
  moments: string;
  overlay: string;
  sandbox: string;
  jam: string;
  tarot: string;
  
  // Common
  loading: string;
  error: string;
  success: string;
  cancel: string;
  save: string;
  share: string;
  
  // Audio
  play: string;
  pause: string;
  stop: string;
  sequential: string;
  layered: string;
  preview: string;
  
  // Subscription
  free: string;
  pro: string;
  upgrade: string;
  subscribe: string;
  
  // Charts
  birthChart: string;
  dailyChart: string;
  generateChart: string;
  chartGeneration: string;
  
  // Jam Sessions
  jamSession: string;
  createSession: string;
  joinSession: string;
  participants: string;
  host: string;
  
  // Tarot
  tarotReading: string;
  drawCards: string;
  spread: string;
  interpretation: string;
}

const translations: Record<SupportedLanguage, TranslationKeys> = {
  en: {
    // Navigation
    moments: 'Moments',
    overlay: 'Overlay',
    sandbox: 'Sandbox',
    jam: 'Jam',
    tarot: 'Tarot',
    
    // Common
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    cancel: 'Cancel',
    save: 'Save',
    share: 'Share',
    
    // Audio
    play: 'Play',
    pause: 'Pause',
    stop: 'Stop',
    sequential: 'Sequential',
    layered: 'Layered',
    preview: 'Preview',
    
    // Subscription
    free: 'Free',
    pro: 'Pro',
    upgrade: 'Upgrade',
    subscribe: 'Subscribe',
    
    // Charts
    birthChart: 'Birth Chart',
    dailyChart: 'Daily Chart',
    generateChart: 'Generate Chart',
    chartGeneration: 'Chart Generation',
    
    // Jam Sessions
    jamSession: 'Jam Session',
    createSession: 'Create Session',
    joinSession: 'Join Session',
    participants: 'Participants',
    host: 'Host',
    
    // Tarot
    tarotReading: 'Tarot Reading',
    drawCards: 'Draw Cards',
    spread: 'Spread',
    interpretation: 'Interpretation'
  },
  
  es: {
    // Navigation
    moments: 'Momentos',
    overlay: 'Superposición',
    sandbox: 'Arena',
    jam: 'Jam',
    tarot: 'Tarot',
    
    // Common
    loading: 'Cargando...',
    error: 'Error',
    success: 'Éxito',
    cancel: 'Cancelar',
    save: 'Guardar',
    share: 'Compartir',
    
    // Audio
    play: 'Reproducir',
    pause: 'Pausar',
    stop: 'Detener',
    sequential: 'Secuencial',
    layered: 'Capas',
    preview: 'Vista Previa',
    
    // Subscription
    free: 'Gratis',
    pro: 'Pro',
    upgrade: 'Actualizar',
    subscribe: 'Suscribirse',
    
    // Charts
    birthChart: 'Carta Natal',
    dailyChart: 'Carta Diaria',
    generateChart: 'Generar Carta',
    chartGeneration: 'Generación de Carta',
    
    // Jam Sessions
    jamSession: 'Sesión de Jam',
    createSession: 'Crear Sesión',
    joinSession: 'Unirse a Sesión',
    participants: 'Participantes',
    host: 'Anfitrión',
    
    // Tarot
    tarotReading: 'Lectura de Tarot',
    drawCards: 'Sacar Cartas',
    spread: 'Tirada',
    interpretation: 'Interpretación'
  },
  
  ko: {
    // Navigation
    moments: '순간들',
    overlay: '오버레이',
    sandbox: '샌드박스',
    jam: '잼',
    tarot: '타로',
    
    // Common
    loading: '로딩 중...',
    error: '오류',
    success: '성공',
    cancel: '취소',
    save: '저장',
    share: '공유',
    
    // Audio
    play: '재생',
    pause: '일시정지',
    stop: '정지',
    sequential: '순차적',
    layered: '레이어드',
    preview: '미리보기',
    
    // Subscription
    free: '무료',
    pro: '프로',
    upgrade: '업그레이드',
    subscribe: '구독',
    
    // Charts
    birthChart: '출생 차트',
    dailyChart: '일일 차트',
    generateChart: '차트 생성',
    chartGeneration: '차트 생성',
    
    // Jam Sessions
    jamSession: '잼 세션',
    createSession: '세션 생성',
    joinSession: '세션 참가',
    participants: '참가자',
    host: '호스트',
    
    // Tarot
    tarotReading: '타로 읽기',
    drawCards: '카드 뽑기',
    spread: '스프레드',
    interpretation: '해석'
  }
};

class I18nService {
  private currentLanguage: SupportedLanguage = 'en';
  
  setLanguage(lang: SupportedLanguage) {
    this.currentLanguage = lang;
    if (typeof window !== 'undefined') {
      localStorage.setItem('preferred-language', lang);
    }
  }
  
  getLanguage(): SupportedLanguage {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('preferred-language') as SupportedLanguage;
      if (stored && translations[stored]) {
        return stored;
      }
    }
    return this.currentLanguage;
  }
  
  t(key: keyof TranslationKeys): string {
    const lang = this.getLanguage();
    return translations[lang]?.[key] || translations.en[key] || key;
  }
  
  getSupportedLanguages(): SupportedLanguage[] {
    return Object.keys(translations) as SupportedLanguage[];
  }
  
  getLanguageName(lang: SupportedLanguage): string {
    const names = {
      en: 'English',
      es: 'Español',
      ko: '한국어'
    };
    return names[lang] || lang;
  }
}

export const i18n = new I18nService();

// React hook for translations
export function useTranslation() {
  return {
    t: i18n.t.bind(i18n),
    language: i18n.getLanguage(),
    setLanguage: i18n.setLanguage.bind(i18n),
    supportedLanguages: i18n.getSupportedLanguages(),
    getLanguageName: i18n.getLanguageName.bind(i18n)
  };
} 