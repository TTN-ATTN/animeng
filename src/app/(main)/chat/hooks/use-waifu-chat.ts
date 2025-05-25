
import { useState, useEffect, useCallback } from 'react';

// Define API URL as a constant for easy configuration
const API_URL = process.env.NEXT_PUBLIC_CHATBOT_API_URL || 'http://localhost:8000';

// Types for chat messages and responses
export type ChatMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
  // Add optional fields for new features
  grammar_feedback?: { analysis: string } | null;
  simplified_response?: string | null;
};

// Updated ChatResponse type to match backend
export type ChatResponse = {
  response: string;
  conversation_id: string;
  mood: string;
  grammar_feedback?: { analysis: string } | null; // Matches backend Optional[Dict[str, Any]]
  simplified_response?: string | null;
};

// Difficulty levels type
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

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
  const [difficultyLevel, setDifficultyLevel] = useState<DifficultyLevel>('beginner'); // Added difficulty level state
  const [latestGrammarFeedback, setLatestGrammarFeedback] = useState<{ analysis: string } | null>(null); // State for latest feedback
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
        content: "Konnichiwa! I'm Sakura, your English learning companion! Ask me any questions about English grammar, vocabulary, or learning tips!",
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
    setLatestGrammarFeedback(null); // Clear previous feedback
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
      
      // Send request to API with difficulty level
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          conversation_id: conversationId,
          conversation_history: conversationHistory,
          difficulty_level: difficultyLevel, // Include difficulty level
        }),
      });
      
      if (!response.ok) {
        if (response.status === 503) {
          const errorData = await response.json();
          if (errorData.detail.includes("Model is still loading")) {
            setModelLoading(true);
            setError("The AI model is still loading. Please try again in a moment.");
            // Don't retry automatically here, let user retry
            // setTimeout(() => sendMessage(message), 5000);
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
      
      // Store feedback and simplified response
      setLatestGrammarFeedback(data.grammar_feedback || null);
      setLatestSimplifiedResponse(data.simplified_response || null);
      
      // Add assistant message to chat
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date().toISOString(),
        // Optionally attach feedback/simplified directly to message if needed for display
        grammar_feedback: data.grammar_feedback || null,
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
  }, [messages, conversationId, isLoading, difficultyLevel]); // Added difficultyLevel dependency

  // Reset conversation
  const resetConversation = useCallback(() => {
    setMessages([]);
    setConversationId(null);
    setMood('default');
    setError(null);
    setLatestGrammarFeedback(null);
    setLatestSimplifiedResponse(null);
    // Keep difficulty level or reset it? Let's keep it for now.
    // setDifficultyLevel('beginner'); 
    
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
    difficultyLevel, // Expose difficulty level state
    setDifficultyLevel, // Expose setter for difficulty level
    latestGrammarFeedback, // Expose latest feedback
    latestSimplifiedResponse, // Expose latest simplified response
  };
};

