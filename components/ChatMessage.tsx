import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message, Role } from '../types';
import { BotIcon, UserIcon, CopyIcon, CheckIcon } from './Icons';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === Role.USER;
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    if (!message.text) return;
    
    try {
      await navigator.clipboard.writeText(message.text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in-up group`}>
      <div className={`flex max-w-[90%] md:max-w-[80%] gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div className={`
          flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
          ${isUser ? 'bg-indigo-600 text-white' : 'bg-emerald-600 text-white'}
          shadow-lg mt-1
        `}>
          {isUser ? <UserIcon className="w-5 h-5" /> : <BotIcon className="w-5 h-5" />}
        </div>

        {/* Bubble */}
        <div className={`
          flex flex-col p-4 rounded-2xl shadow-md leading-relaxed relative min-w-[100px]
          ${isUser 
            ? 'bg-indigo-600 text-white rounded-tr-none' 
            : 'bg-gray-800 text-gray-100 rounded-tl-none border border-gray-700'}
        `}>
            <div className="font-normal text-sm md:text-base">
                <ReactMarkdown 
                    className={`
                        prose prose-invert prose-sm max-w-none break-words
                        [&>*:last-child]:mb-0 
                        ${isUser ? 'prose-p:text-white prose-headings:text-white prose-strong:text-white prose-code:text-white' : ''}
                    `}
                    remarkPlugins={[remarkGfm]}
                    components={{
                        // Custom override for pre tags to ensure code blocks look good in both bubbles
                        pre: ({node, ...props}) => (
                            <div className="overflow-auto w-full my-2 rounded-lg bg-black/30">
                                <pre {...props} className="!bg-transparent !m-0 !p-3" />
                            </div>
                        ),
                        code: ({node, className, children, ...props}: any) => {
                             const match = /language-(\w+)/.exec(className || '');
                             const isInline = !match && !String(children).includes('\n');
                             return isInline ? (
                                <code className="bg-black/20 rounded px-1 py-0.5 text-[0.9em]" {...props}>
                                    {children}
                                </code>
                             ) : (
                                <code className={className} {...props}>
                                    {children}
                                </code>
                             );
                        }
                    }}
                >
                    {message.text + (message.isStreaming ? ' ▍' : '')}
                </ReactMarkdown>
            </div>
            
            {message.isError && (
                <div className="text-red-300 text-xs mt-2 border-t border-red-400/30 pt-2">
                    Failed to send message. Please try again.
                </div>
            )}

            {/* Copy Button */}
            {!message.isStreaming && !message.isError && message.text && (
                <div className={`
                    mt-2 flex justify-end transition-opacity duration-200
                    opacity-0 group-hover:opacity-100
                    ${isCopied ? 'opacity-100' : ''}
                `}>
                    <button 
                        onClick={handleCopy}
                        className={`
                            p-1.5 rounded-md flex items-center gap-1.5 text-xs font-medium transition-colors
                            ${isUser 
                                ? 'hover:bg-indigo-500 text-indigo-200 hover:text-white' 
                                : 'hover:bg-gray-700 text-gray-400 hover:text-gray-200'}
                            ${isCopied ? 'text-green-300' : ''}
                        `}
                        title="Copy to clipboard"
                        aria-label="Copy message"
                    >
                        {isCopied ? (
                            <>
                                <CheckIcon className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Copied</span>
                            </>
                        ) : (
                            <CopyIcon className="w-3.5 h-3.5" />
                        )}
                    </button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(ChatMessage);