'use client';

import { useState, FormEvent } from 'react';
import { Button } from '@/components/ui/button';

type ChatInputProps = {
  onSendMessage: (message: string) => void;
  isDisabled?: boolean;
  placeholder?: string;
};

const ChatInput = ({ 
  onSendMessage, 
  isDisabled = false,
  placeholder = "Ask me about English..."
}: ChatInputProps) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (message.trim() && !isDisabled) {
      onSendMessage(message);
      setMessage('');
    }
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className="border-t border-gray-200 p-4 flex items-center gap-2"
    >
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={isDisabled ? "Loading..." : placeholder}
        className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-300"
        disabled={isDisabled}
      />
      <Button 
        type="submit"
        variant="blueBtn"
        size="icon"
        className="rounded-full"
        disabled={isDisabled || !message.trim()}
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <line x1="22" y1="2" x2="11" y2="13"></line>
          <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
        </svg>
      </Button>
    </form>
  );
};

export default ChatInput;
