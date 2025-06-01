import { useState, useEffect, useCallback } from 'react';

const API_URL = process.env.NEXT_PUBLIC_CHATBOT_API_URL || 'http://localhost:8000';

// Types for chat messages and responses
export type ChatMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
  simplified_response?: string | null;
};

// Updated ChatResponse type to match backend
export type ChatResponse = {
  response: string;
  conversation_id: string;
  mood: string;
  simplified_response?: string | null;
};

// Main hook for chat functionality
export const useWaifuChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [mood, setMood] = useState<string>('default');
  const [apiAvailable, setApiAvailable] = useState(true);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [modelLoading, setModelLoading] = useState(false);
  const [latestSimplifiedResponse, setLatestSimplifiedResponse] = useState<string | null>(null); // State for latest simplified response

  // Check API health on mount
  useEffect(() => {
    const checkApiHealth = async () => {
      try {
        const response = await fetch(`${API_URL}/api/health`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`API health check failed with status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('API health check:', data);
        setApiAvailable(true);
        setModelLoaded(data.model_loaded || false);
        setModelLoading(data.model_loading || false);
        
        // If model is loading, poll until it's ready
        if (data.model_loading && !data.model_loaded) {
          setTimeout(checkApiHealth, 5000); // Poll every 5 seconds
        }
      } catch (error) {
        console.error('API check error:', error);
        setApiAvailable(false);
        setError('Could not connect to chatbot API. Service may be unavailable.');
      }
    };

    checkApiHealth();
  }, []);

  // Initialize chat with greeting
  useEffect(() => {
    const timer = setTimeout(() => {
      const greeting: ChatMessage = {
        role: 'assistant',
        content: "Konnichiwa! I'm Miku, your English learning companion! Ask me any questions about English grammar, vocabulary, or learning tips!",
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => prev.length === 0 ? [greeting] : prev);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Send message to API
  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim() || isLoading) return;
    
    setIsLoading(true);
    setError(null);
    setLatestSimplifiedResponse(null); // Clear previous simplified response
    
    const userMessage: ChatMessage = {
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    };
    
    // Add user message immediately
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    
    try {
      // Prepare conversation history (exclude system messages if needed by backend)
      const conversationHistory = messages
        .filter(msg => msg.role !== 'system') // Exclude system messages if needed
        .map(msg => ({
          role: msg.role,
          content: msg.content,
        }));
      
      // Send request to API
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          conversation_id: conversationId,
          conversation_history: conversationHistory,
        }),
      });
      
      if (!response.ok) {
        if (response.status === 503) {
          const errorData = await response.json();
          if (errorData.detail.includes("Model is still loading")) {
            setModelLoading(true);
            setError("The AI model is still loading. Please try again in a moment.");
            setIsLoading(false); // Stop loading indicator
            // Revert adding the user message if retry is not automatic
            setMessages(prev => prev.slice(0, -1));
            setInputMessage(message); // Put message back in input
            return;
          }
        }
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to get response');
      }
      
      const data: ChatResponse = await response.json();
      
      if (!conversationId) {
        setConversationId(data.conversation_id);
      }
      
      setMood(data.mood);
      
      // Store simplified response
      setLatestSimplifiedResponse(data.simplified_response || null);
      
      // Add assistant message to chat
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date().toISOString(),
        // Attach simplified response directly to message if needed for display
        simplified_response: data.simplified_response || null,
      };
      
      // Update messages state with assistant response
      setMessages(prev => [...prev, assistantMessage]);
      setModelLoaded(true);
      setModelLoading(false);

    } catch (err) {
      console.error('Chat error:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      // Revert adding the user message on error
      setMessages(prev => prev.slice(0, -1));
      setInputMessage(message); // Put message back in input
    } finally {
      setIsLoading(false);
    }
  }, [messages, conversationId, isLoading]);

  // Reset conversation
  const resetConversation = useCallback(() => {
    setMessages([]);
    setConversationId(null);
    setMood('default');
    setError(null);
    setLatestSimplifiedResponse(null);
    
    if (conversationId) {
      fetch(`${API_URL}/api/conversations/${conversationId}`, {
        method: 'DELETE',
      }).catch(err => {
        console.error('Failed to delete conversation:', err);
      });
    }
  }, [conversationId]);

  return {
    messages,
    inputMessage,
    setInputMessage,
    sendMessage,
    isLoading,
    error,
    mood,
    resetConversation,
    apiAvailable,
    modelLoaded,
    modelLoading,
    latestSimplifiedResponse, // Expose latest simplified response
  };
};
