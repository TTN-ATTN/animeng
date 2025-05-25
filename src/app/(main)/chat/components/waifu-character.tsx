'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { generateWaifuImages } from '../utils/generate-waifu-images';

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

  // Generate and use placeholder images on client side
  useEffect(() => {
    // Only run in browser environment
    if (typeof window !== 'undefined') {
      try {
        const waifuImg = document.querySelector('.waifu-character-img') as HTMLImageElement;
        if (waifuImg) {
          const images = generateWaifuImages();
          waifuImg.src = images.main;
        }
      } catch (error) {
        console.error('Error generating waifu image:', error);
      }
    }
  }, []);

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-48 h-64 md:w-64 md:h-80">
        {/* Placeholder that will be replaced by generated image */}
        <img
          src="/images/waifu/waifu-character.png"
          alt="Anime waifu character"
          className="waifu-character-img object-contain w-full h-full"
        />
      </div>
      <div className="mt-4 text-4xl">
        {moodEmoji[mood as keyof typeof moodEmoji] || moodEmoji.default}
      </div>
    </div>
  );
};

export default WaifuCharacter;
