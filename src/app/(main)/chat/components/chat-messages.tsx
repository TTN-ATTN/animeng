'use client';

import MessageBubble from './message-bubble';
import { ChatMessage } from '../hooks/use-waifu-chat';

type ChatMessagesProps = {
  messages: ChatMessage[];
  isTyping: boolean;
};

const ChatMessages = ({ messages, isTyping }: ChatMessagesProps) => {
  return (
    <div className="space-y-3">
      {messages.map((message, index) => (
        <MessageBubble key={index} message={message} />
      ))}
      
      {isTyping && (
        <div className="flex items-center space-x-1 ml-14">
          <div className="w-3 h-3 rounded-full bg-pink-300 animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-3 h-3 rounded-full bg-pink-300 animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-3 h-3 rounded-full bg-pink-300 animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      )}
    </div>
  );
};

export default ChatMessages;
