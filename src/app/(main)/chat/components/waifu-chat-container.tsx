"use client";

import { useEffect, useRef, useState } from 'react';
import WaifuCharacter from './waifu-character';
import ChatMessages from './chat-messages';
import ChatInput from './chat-input';
import { useWaifuChat } from '../hooks/use-waifu-chat';
import { Button } from '@/components/ui/button';

const WaifuChatContainer = () => {
  const { 
    messages, 
    isLoading,
    mood,
    error,
    apiAvailable,
    modelLoaded,
    modelLoading,
    sendMessage,
    resetConversation,
  } = useWaifuChat();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showSettings, setShowSettings] = useState(false);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col md:flex-row w-full h-[calc(100vh-100px)] bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Waifu character section */}
      <div className="w-full md:w-1/4 p-4 bg-teal-50 flex flex-col items-center justify-center relative">
        <WaifuCharacter mood={mood} />
        
        {/* Loading Indicator */}
        {modelLoading && (
           <div className="absolute top-2 right-2 bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">
             Model Loading...
           </div>
        )}
        {isLoading && !modelLoading && (
          <div className="mt-4 text-center">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-teal-300 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
            <p className="mt-1 text-xs text-gray-600">Thinking...</p>
          </div>
        )}
        
        {/* API Status */}
        {!apiAvailable && (
          <div className="mt-4 text-center bg-red-100 p-2 rounded-md">
            <p className="text-sm text-red-700">
              <span className="inline-block mr-1">⚠️</span>
              Chatbot API Offline
            </p>
          </div>
        )}
        {apiAvailable && !modelLoaded && !modelLoading && (
           <div className="mt-4 text-center bg-yellow-100 p-2 rounded-md">
             <p className="text-sm text-yellow-700">
               <span className="inline-block mr-1">⏳</span>
               Model Not Ready
             </p>
           </div>
        )}
        
        {/* Settings Button */}
        <div className="mt-6">
          <Button 
            variant="default" 
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
            className="text-gray-600"
          >
            {showSettings ? 'Hide Settings' : 'Settings'}
          </Button>
        </div>
        
        {/* Settings Panel */}
        {showSettings && (
          <div className="mt-4 w-full bg-white p-3 rounded-md shadow-sm space-y-3">
            <h3 className="font-medium text-gray-700 mb-2 text-sm">Chat Options</h3>
            
            {/* Reset Button */}
            <Button 
              variant="redBtn" 
              size="sm"
              onClick={resetConversation}
              className="w-full"
            >
              Reset Conversation
            </Button>
          </div>
        )}
      </div>
      
      {/* Chat section */}
      <div className="w-full md:w-3/4 flex flex-col h-full border-l border-gray-200">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* API Error Display */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
              <p><strong>Error:</strong> {error}</p>
            </div>
          )}
          
          {/* Chat Messages */}
          <ChatMessages 
            messages={messages} 
            isTyping={isLoading && !modelLoading}
          />
          <div ref={messagesEndRef} />
        </div>
        
        {/* Chat Input */}
        <ChatInput 
          onSendMessage={sendMessage} 
          isDisabled={isLoading || !apiAvailable || !modelLoaded} 
          placeholder={!apiAvailable 
            ? "Chatbot API is offline..." 
            : !modelLoaded 
            ? "Model is loading..." 
            : "Ask me about English..."
          }
        />
      </div>
    </div>
  );
};

export default WaifuChatContainer;
