'use client';

import React from 'react';
import InlineAudioLab from '../components/InlineAudioLab';
import AudioTestComponent from '../components/AudioTestComponent';

export default function HomePage() {
  return (
    <div>
      <AudioTestComponent />
      <InlineAudioLab />
    </div>
  );
} 