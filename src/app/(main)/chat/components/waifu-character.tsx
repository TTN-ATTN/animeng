'use client';

import { useEffect } from 'react';
import Image from 'next/image';

type WaifuCharacterProps = {
  mood: string;
};

const WaifuCharacter = ({ mood }: WaifuCharacterProps) => {
  // Map mood to emoji
  const moodEmoji = {
    happy: '😊',
    excited: '😍',
    confused: '😕',
    sad: '😢',
    default: '😊'
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-56 h-72 md:w-72 md:h-96">
        {/* Miku character image */}
        
      </div>
      <div className="mt-4 text-4xl">
        {moodEmoji[mood as keyof typeof moodEmoji] || moodEmoji.default}
      </div>
    </div>
  );
};

export default WaifuCharacter;
