import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Message, Role, ModelIds } from './types';
import { geminiService } from './services/gemini';
import ChatMessage from './components/ChatMessage';
import Sidebar from './components/Sidebar';
import { SendIcon, SparklesIcon } from './components/Icons';

const INITIAL_MESSAGE: Message = {
  id: '1',
  role: Role.MODEL,
  text: "Hello! I'm Gemini. How can I help you today?",
  timestamp: new Date()
};

export default function App() {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentModel, setCurrentModel] = useState<string>(ModelIds.FLASH);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [inputValue]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userText = inputValue.trim();
    setInputValue('');
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    const newUserMessage: Message = {
      id: Date.now().toString(),
      role: Role.USER,
      text: userText,
      timestamp: new Date(),
    };

    const tempBotMessageId = (Date.now() + 1).toString();
    const tempBotMessage: Message = {
        id: tempBotMessageId,
        role: Role.MODEL,
        text: '',
        timestamp: new Date(),
        isStreaming: true
    };

    setMessages(prev => [...prev, newUserMessage, tempBotMessage]);
    setIsLoading(true);

    try {
      let accumulatedText = '';
      const stream = geminiService.sendMessageStream(userText);
      
      for await (const textChunk of stream) {
        accumulatedText += textChunk;
        setMessages(prev => prev.map(msg => 
            msg.id === tempBotMessageId 
                ? { ...msg, text: accumulatedText } 
                : msg
        ));
      }

      setMessages(prev => prev.map(msg => 
        msg.id === tempBotMessageId 
            ? { ...msg, isStreaming: false } 
            : msg
      ));

    } catch (error) {
      setMessages(prev => prev.map(msg => 
        msg.id === tempBotMessageId 
            ? { ...msg, isStreaming: false, isError: true, text: "I'm sorry, something went wrong. Please try again." } 
            : msg
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleModelChange = (modelId: string) => {
    setCurrentModel(modelId);
    geminiService.setModel(modelId);
    // Optional: Clear chat on model switch to avoid context confusion, or keep it.
    // We will keep it simple and just switch the "engine" for the next message.
  };

  const handleClearChat = () => {
    setMessages([INITIAL_MESSAGE]);
    // Re-init service to clear internal history
    geminiService.setModel(currentModel);
  };

  return (
    <div className="flex h-screen bg-dark text-gray-100 overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-72 flex-shrink-0">
        <Sidebar 
            currentModel={currentModel} 
            onModelChange={handleModelChange}
            onClearChat={handleClearChat}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 md:hidden" onClick={() => setSidebarOpen(false)}>
              <div className="w-64 h-full bg-dark-lighter shadow-2xl transform transition-transform duration-300" onClick={e => e.stopPropagation()}>
                <Sidebar 
                    currentModel={currentModel} 
                    onModelChange={(id) => { handleModelChange(id); setSidebarOpen(false); }}
                    onClearChat={() => { handleClearChat(); setSidebarOpen(false); }}
                />
              </div>
          </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full relative">
        
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 bg-dark-lighter border-b border-gray-800">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <SparklesIcon className="w-5 h-5 text-white" />
                </div>
                <span className="font-semibold">Gemini Flow</span>
            </div>
            <button onClick={() => setSidebarOpen(true)} className="p-2 text-gray-400 hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
            <div className="max-w-3xl mx-auto">
                {messages.map((msg) => (
                    <ChatMessage key={msg.id} message={msg} />
                ))}
                <div ref={messagesEndRef} />
            </div>
        </div>

        {/* Input Area */}
        <div className="p-4 bg-dark/80 backdrop-blur-md border-t border-gray-800">
            <div className="max-w-3xl mx-auto relative">
                <div className="relative flex items-end gap-2 p-2 bg-gray-800/50 border border-gray-700 rounded-2xl focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/50 transition-all shadow-lg">
                    <textarea
                        ref={textareaRef}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={`Message ${currentModel === ModelIds.FLASH ? 'Gemini Flash' : 'Gemini Pro'}...`}
                        className="w-full bg-transparent text-gray-100 placeholder-gray-500 px-4 py-3 max-h-[200px] min-h-[52px] resize-none focus:outline-none"
                        rows={1}
                    />
                    <button 
                        onClick={handleSendMessage}
                        disabled={isLoading || !inputValue.trim()}
                        className={`
                            p-3 rounded-xl flex-shrink-0 transition-all duration-200
                            ${isLoading || !inputValue.trim() 
                                ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                                : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/20'}
                        `}
                    >
                        <SendIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className="text-center mt-2">
                    <p className="text-xs text-gray-500">
                        Gemini may display inaccurate info, including about people, so double-check its responses.
                    </p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}