
import Image from 'next/image';
import { ChatMessage } from '../hooks/use-waifu-chat';
import { useEffect } from 'react';
import { generateWaifuImages } from '../utils/generate-waifu-images';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"; // Assuming shadcn/ui card
import { Separator } from "@/components/ui/separator"; // Assuming shadcn/ui separator

type MessageBubbleProps = {
  message: ChatMessage;
};

const MessageBubble = ({ message }: MessageBubbleProps) => {
  const isAssistant = message.role === 'assistant';

  // Generate and use placeholder avatar on client side
  useEffect(() => {
    if (typeof window !== 'undefined' && isAssistant) {
      try {
        const avatarImg = document.querySelector(`.waifu-avatar-img-${message.timestamp?.replace(/\W/g, '')}`) as HTMLImageElement;
        if (avatarImg) {
          const images = generateWaifuImages();
          avatarImg.src = images.avatar;
        }
      } catch (error) {
        console.error('Error generating waifu avatar:', error);
      }
    }
  }, [isAssistant, message.timestamp]);

  // Helper to format grammar feedback (assuming it's a string for now)
  const formatGrammarFeedback = (feedback: { analysis: string } | null | undefined): React.ReactNode => {
    if (!feedback?.analysis) return null;
    // Basic parsing assuming "- Original: ... - Corrected: ... - Explanation: ..."
    const parts = feedback.analysis.split('\n- ');
    const formatted = parts.map(part => part.replace(/^- /, '')).filter(Boolean);
    return (
      <div className="text-xs mt-2 space-y-1">
        {formatted.map((line, index) => {
          const [key, ...value] = line.split(': ');
          return (
            <p key={index}>
              <strong className="font-medium">{key}:</strong> {value.join(': ')}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <div className={`flex ${isAssistant ? 'justify-start' : 'justify-end'} mb-4 w-full`}>
      {/* Assistant Avatar */}
      {isAssistant && (
        <div className="flex-shrink-0 h-8 w-8 rounded-full overflow-hidden mr-2 mt-1">
          <img
            // Use a unique class based on timestamp to target the correct image
            className={`waifu-avatar-img-${message.timestamp?.replace(/\W/g, '')} object-cover w-full h-full`}
            src="/images/waifu/waifu-avatar.png" // Default placeholder
            alt="Waifu avatar"
          />
        </div>
      )}

      {/* Message Content Area */}
      <div className={`flex flex-col max-w-[85%] ${isAssistant ? 'items-start' : 'items-end'}`}>
        {/* Main Message Bubble */}
        <div
          className={`px-4 py-2 rounded-2xl ${isAssistant
            ? 'bg-pink-100 text-gray-800 rounded-bl-none'
            : 'bg-blue-500 text-white rounded-br-none'
            }`}
        >
          {message.content}
        </div>

        {/* Simplified Response (Assistant only) */}
        {isAssistant && message.simplified_response && (
          <Card className="mt-2 bg-purple-50 border-purple-200 w-full">
            <CardHeader className="p-2">
              <CardTitle className="text-xs font-medium text-purple-700">Simplified Version</CardTitle>
            </CardHeader>
            <CardContent className="p-2 pt-0 text-xs text-purple-800">
              {message.simplified_response}
            </CardContent>
          </Card>
        )}

        {/* Grammar Feedback (Assistant only, feedback on previous user message) */}
        {isAssistant && message.grammar_feedback && (
          <Card className="mt-2 bg-yellow-50 border-yellow-200 w-full">
            <CardHeader className="p-2">
              <CardTitle className="text-xs font-medium text-yellow-700">Grammar Check</CardTitle>
              <CardDescription className="text-xs text-yellow-600">Feedback on your previous message</CardDescription>
            </CardHeader>
            <CardContent className="p-2 pt-0 text-xs text-yellow-800">
              {formatGrammarFeedback(message.grammar_feedback)}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;

