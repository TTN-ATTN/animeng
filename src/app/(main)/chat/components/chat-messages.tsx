'use client';

import { useEffect } from 'react';
import { generateWaifuImages } from '../utils/generate-waifu-images';
import MessageBubble from './message-bubble';
import { ChatMessage } from '../hooks/use-waifu-chat';

type ChatMessagesProps = {
  messages: ChatMessage[];
  isTyping: boolean;
};

const ChatMessages = ({ messages, isTyping }: ChatMessagesProps) => {
  // Generate and use placeholder avatar on client side
  useEffect(() => {
    // Only run in browser environment
    if (typeof window !== 'undefined') {
      try {
        const avatarImgs = document.querySelectorAll('.waifu-avatar-img') as NodeListOf<HTMLImageElement>;
        if (avatarImgs.length > 0) {
          const images = generateWaifuImages();
          avatarImgs.forEach(img => {
            img.src = images.avatar;
          });
        }
      } catch (error) {
        console.error('Error generating waifu avatar:', error);
      }
    }
  }, [messages]);

  return (
    <div className="space-y-2">
      {messages.map((message, index) => (
        <MessageBubble key={index} message={message} />
      ))}
      
      {isTyping && (
        <div className="flex items-center space-x-1 ml-10">
          <div className="w-2 h-2 rounded-full bg-pink-300 animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 rounded-full bg-pink-300 animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 rounded-full bg-pink-300 animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      )}
    </div>
  );
};

export default ChatMessages;
