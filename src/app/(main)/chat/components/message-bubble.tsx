import Image from 'next/image';
import { ChatMessage } from '../hooks/use-waifu-chat';
import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import ReactMarkdown from 'react-markdown';

type MessageBubbleProps = {
  message: ChatMessage;
};

const MessageBubble = ({ message }: MessageBubbleProps) => {
  const isAssistant = message.role === 'assistant';

  return (
    <div className={`flex ${isAssistant ? 'justify-start' : 'justify-end'} mb-6 w-full`}>
      {/* Avatar - Miku */}
      {isAssistant && (
        <div className="flex-shrink-0 h-12 w-12 rounded-full overflow-hidden mr-3 mt-1 border-2 border-teal-200">
          
        </div>
      )}

      {/* Message Content Area */}
      <div className={`flex flex-col max-w-[85%] ${isAssistant ? 'items-start' : 'items-end'}`}>
        {/* Main Message Bubble */}
        <div
          className={`px-5 py-3 rounded-2xl text-base ${isAssistant
            ? 'bg-teal-100 text-gray-800 rounded-bl-none prose prose-sm max-w-none'
            : 'bg-blue-500 text-white rounded-br-none'
            }`}
        >
          {isAssistant ? (
            <ReactMarkdown>{message.content}</ReactMarkdown>
          ) : (
            message.content
          )}
        </div>

        {/* Simplified Response (Assistant only) */}
        {isAssistant && message.simplified_response && (
          <Card className="mt-3 bg-teal-50 border-teal-200 w-full">
            <CardHeader className="p-3">
              <CardTitle className="text-sm font-medium text-teal-700">Simplified Version</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0 text-sm text-teal-800 prose prose-sm max-w-none">
              <ReactMarkdown>{message.simplified_response}</ReactMarkdown>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
