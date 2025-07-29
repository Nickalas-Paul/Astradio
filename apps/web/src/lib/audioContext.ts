// Audio Context Management for Astradio
// Handles browser autoplay policies and user interaction requirements

let audioContextInitialized = false;
let audioContext: AudioContext | null = null;

export const initializeAudioContext = async (): Promise<void> => {
  if (audioContextInitialized) return;
  
  try {
    // Check if we're in a browser environment
    if (typeof window !== 'undefined') {
      // Create audio context
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      console.log('🎵 Audio context created, state:', audioContext.state);
      
      // Add click listener to start audio context on first user interaction
      const startAudioOnInteraction = async () => {
        try {
          if (audioContext && audioContext.state === 'suspended') {
            await audioContext.resume();
            console.log('🎵 Audio context resumed on user interaction');
          }
          
          audioContextInitialized = true;
          
          // Remove the listener after first interaction
          document.removeEventListener('click', startAudioOnInteraction);
          document.removeEventListener('touchstart', startAudioOnInteraction);
          document.removeEventListener('keydown', startAudioOnInteraction);
        } catch (error) {
          console.warn('⚠️ Failed to initialize audio context:', error);
        }
      };
      
      // Add listeners for user interaction
      document.addEventListener('click', startAudioOnInteraction);
      document.addEventListener('touchstart', startAudioOnInteraction);
      document.addEventListener('keydown', startAudioOnInteraction);
      
      console.log('🎵 Audio context listeners added');
    }
  } catch (error) {
    console.warn('⚠️ Audio context initialization failed:', error);
  }
};

export const ensureAudioContext = async (): Promise<boolean> => {
  try {
    if (typeof window === 'undefined') return false;
    
    // If we don't have an audio context, create one
    if (!audioContext) {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      console.log('🎵 Created new audio context');
    }
    
    if (audioContext.state === 'suspended') {
      console.log('🎵 Audio context suspended, attempting to resume...');
      await audioContext.resume();
      console.log('🎵 Audio context state:', audioContext.state);
    }
    
    // Additional debugging
    console.log('🎵 Audio Context Debug:', {
      state: audioContext.state,
      sampleRate: audioContext.sampleRate,
      currentTime: audioContext.currentTime,
      destination: audioContext.destination ? 'connected' : 'not connected',
      userAgent: navigator.userAgent
    });
    
    return audioContext.state === 'running';
  } catch (error) {
    console.warn('⚠️ Audio context check failed:', error);
    return false;
  }
};

export const logAudioContextState = async (): Promise<void> => {
  try {
    if (typeof window === 'undefined' || !audioContext) return;
    
    console.log('🎵 Audio Context State:', {
      state: audioContext.state,
      sampleRate: audioContext.sampleRate,
      currentTime: audioContext.currentTime,
      destination: audioContext.destination ? 'connected' : 'not connected'
    });
  } catch (error) {
    console.warn('⚠️ Could not log audio context state:', error);
  }
};

export const getAudioContext = (): AudioContext | null => {
  return audioContext;
}; 