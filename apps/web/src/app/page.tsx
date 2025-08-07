'use client';

import React from 'react';
import InlineAudioLab from '../components/InlineAudioLab';
import AudioTestComponent from '../components/AudioTestComponent';

export default function HomePage() {
  return (
    <div>
      {/* Audio Music Generator - Fixed and Ready for Production */}
      <AudioTestComponent />
      <InlineAudioLab />
    </div>
  );
} 