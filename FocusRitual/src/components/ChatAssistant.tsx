import React, { useState, useRef, useEffect } from 'react';
import Draggable from 'react-draggable';
import { PaperAirplaneIcon, XMarkIcon, AcademicCapIcon, ChatBubbleLeftEllipsisIcon, MinusIcon, ArrowsPointingOutIcon, ArrowsPointingInIcon } from '@heroicons/react/24/solid';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { useTheme } from '../context/ThemeContext';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'assistant';
    timestamp: Date;
}

const ChatAssistant: React.FC = () => {
    const { currentTheme } = useTheme();
    const { colors } = currentTheme;

    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isMinimized, setIsMinimized] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen && !isMinimized) {
            scrollToBottom();
            inputRef.current?.focus();
        }
    }, [isOpen, messages, isMinimized]);

    const handleSendMessage = async () => {
        if (!inputMessage.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            text: inputMessage,
            sender: 'user',
            timestamp: new Date(),
        };

        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInputMessage('');
        setIsLoading(true);
        setError(null);

        const historyForBackend = newMessages.slice(0, -1).map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }],
        }));

        try {
            console.log('Sending chat request to:', '/api/chat');
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ message: inputMessage, history: historyForBackend }),
            });

            console.log('Response status:', response.status);
            console.log('Response headers:', Object.fromEntries(response.headers.entries()));

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('Server response:', response.status, errorData);
                throw new Error(errorData.details || `Server error: ${response.status}`);
            }

            const data = await response.json();
            console.log('Chat response data:', data);

            if (data.error) {
                throw new Error(data.details || data.error);
            }

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: data.response || "I'm here to help! What can I explain?",
                sender: 'assistant',
                timestamp: new Date(),
            };

            setMessages(currentMessages => [...currentMessages, assistantMessage]);
        } catch (err) {
            const typedError = err as Error;
            console.error('Chat error:', typedError);
            setError(typedError.message || 'Failed to connect. Please try again.');
            setMessages(currentMessages => [...currentMessages, {
                id: (Date.now() + 2).toString(),
                text: `Sorry, I encountered an error: ${typedError.message || 'Please check server & try again.'}`,
                sender: 'assistant',
                timestamp: new Date(),
            }]);
        } finally {
            setIsLoading(false);
            if (!isMinimized) inputRef.current?.focus();
        }
    };

    const handlePromptButtonClick = (promptText: string) => {
        setInputMessage(promptText);
        if (!isMinimized) inputRef.current?.focus();
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    // Define dynamic class strings using theme colors
    const chatWindowBaseClasses = `
        ${colors.chatWindowBg} 
        shadow-2xl flex flex-col 
        fixed z-[9999]
        transition-[width,height,top,left,bottom,right,border-radius] duration-300 ease-in-out
    `;

    let chatWindowDynamicClasses = '';
    if (isMinimized) {
        chatWindowDynamicClasses = `
            h-16 w-80 sm:w-96 
            bottom-0 right-0 sm:bottom-5 sm:right-5 
            rounded-t-xl sm:rounded-xl
        `;
    } else if (isFullScreen) {
        chatWindowDynamicClasses = `
            w-screen h-screen 
            top-0 left-0 right-0 bottom-0 
            rounded-none
        `;
    } else { // Default floating window state
        chatWindowDynamicClasses = `
            w-full sm:w-[450px] md:w-[500px] 
            h-[calc(100vh-40px)] sm:h-[650px] sm:max-h-[85vh] 
            bottom-0 right-0 sm:bottom-5 sm:right-5 
            rounded-t-xl sm:rounded-xl
        `;
    }
    const chatWindowClasses = `${chatWindowBaseClasses} ${chatWindowDynamicClasses}`;

    const headerClasses = `
        chat-header 
        ${colors.chatHeaderBg} 
        ${colors.chatHeaderText} 
        p-4 sm:p-5 rounded-t-xl 
        ${isFullScreen ? 'sm:rounded-t-none' : 'sm:rounded-t-lg'
        }
        flex justify-between items-center 
        border-b ${colors.chatInputBorder} 
        cursor-move
    `;

    const headerButtonClasses = `
        ${colors.chatHeaderIcon} 
        ${colors.chatHeaderIconHoverBg} 
        hover:text-white 
        rounded-full p-1.5 transition-colors
    `;

    const messageListClasses = `
        flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 
        ${colors.chatMessageListBg}
        ${colors.scrollbarThumb} ${colors.scrollbarTrack} 
        scrollbar-thin
    `;

    const inputAreaClasses = `
        p-3 sm:p-4 border-t 
        ${colors.chatInputBorder} 
        ${colors.chatInputAreaBg}
    `;

    const promptButtonClasses = (p: any) => `
        px-3 py-1 text-xs sm:text-sm 
        ${colors.chatPromptButtonBg} 
        ${colors.chatPromptButtonText} 
        ${colors.chatPromptButtonHoverBg} 
        rounded-md transition-colors
    `;

    const textareaClasses = `
        flex-1 p-2.5 sm:p-3 border 
        ${colors.chatInputBorder} 
        rounded-lg resize-none 
        ${colors.chatInputBg} 
        ${colors.chatInputText} 
        ${colors.chatInputPlaceholderText} 
        shadow-sm text-sm
    `;

    const sendButtonClasses = `
        ${colors.chatSendButtonBg} 
        ${colors.chatSendButtonText} 
        ${colors.chatSendButtonHoverBg} 
        rounded-lg p-2.5 sm:p-3 transition-colors 
        disabled:opacity-60 disabled:cursor-not-allowed 
        shadow-sm flex items-center justify-center
    `;

    const userMessageBubbleClasses = `
        ${colors.userMessageBg} 
        ${colors.userMessageText}
    `;

    const assistantMessageBubbleClasses = `
        ${colors.assistantMessageBg} 
        ${colors.assistantMessageText} 
        border ${colors.chatInputBorder} 
    `;

    const assistantMarkdownProseClasses = `
        prose prose-sm max-w-none leading-relaxed 
        ${colors.assistantMessageText} 
        prose-p:my-1 prose-ul:my-1.5 prose-ol:my-1.5 prose-headings:my-2 
        prose-code:rounded prose-code:px-1 prose-code:py-0.5 
        prose-code:${colors.assistantMessageCodeBg} 
        prose-code:${colors.assistantMessageCodeText}
    `;

    const handleToggleFullScreen = () => {
        const newFullScreenState = !isFullScreen;
        setIsFullScreen(newFullScreenState);
        if (newFullScreenState) {
            setIsMinimized(false); // Ensure not minimized when going full screen
        }
    };

    const chatWindowInnerContent = (
        <>
            <div className={headerClasses}>
                <div className="flex items-center gap-3">
                    <AcademicCapIcon className={`w-7 h-7 ${colors.chatHeaderIcon || 'text-blue-300'}`} />
                    <h3 className="font-semibold text-lg">Study Assistant</h3>
                </div>
                <div className="flex items-center space-x-1">
                    {!isMinimized && (
                        <button
                            onClick={handleToggleFullScreen}
                            className={headerButtonClasses}
                            aria-label={isFullScreen ? "Exit full screen" : "Go full screen"}
                        >
                            {isFullScreen ? <ArrowsPointingInIcon className="w-5 h-5" /> : <ArrowsPointingOutIcon className="w-5 h-5" />}
                        </button>
                    )}
                    {!isFullScreen && (
                        <button
                            onClick={() => setIsMinimized(!isMinimized)}
                            className={headerButtonClasses}
                            aria-label={isMinimized ? "Restore" : "Minimize"}
                        >
                            {isMinimized ? <ArrowsPointingOutIcon className="w-5 h-5 transform rotate-45" /> : <MinusIcon className="w-5 h-5" />}
                        </button>
                    )}
                    <button
                        onClick={() => setIsOpen(false)}
                        className={headerButtonClasses}
                        aria-label="Close chat"
                    >
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {!isMinimized && (
                <>
                    {error && (
                        <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm border-b border-red-200 dark:border-red-800/50">
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                                <span>{error}</span>
                            </div>
                        </div>
                    )}
                    <div className={messageListClasses}>
                        {messages.length === 0 && !isLoading && (
                            <div className={`text-center ${colors.assistantMessageText || 'text-slate-500 dark:text-slate-400'} mt-12 opacity-75`}>
                                <AcademicCapIcon className={`w-16 h-16 mx-auto mb-4 ${colors.assistantMessageText ? (colors.assistantMessageText.replace('text-', 'text-') + '/70') : 'text-slate-400 dark:text-slate-500'}`} />
                                <h4 className="font-semibold text-xl mb-2">FocusRitual AI Assistant</h4>
                                <p className="text-sm">Ready to help you learn and explore. <br />Ask me anything!</p>
                            </div>
                        )}
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'
                                    }`}
                            >
                                <div
                                    className={`max-w-[85%] rounded-xl sm:rounded-2xl py-2 px-3.5 sm:py-2.5 sm:px-4 shadow-md break-words ${message.sender === 'user'
                                        ? userMessageBubbleClasses
                                        : assistantMessageBubbleClasses
                                        }`}
                                >
                                    {message.sender === 'assistant' ? (
                                        <div className={assistantMarkdownProseClasses}>
                                            <ReactMarkdown rehypePlugins={[rehypeRaw, remarkGfm]}>
                                                {message.text}
                                            </ReactMarkdown>
                                        </div>
                                    ) : (
                                        <p className={`text-sm whitespace-pre-wrap leading-relaxed ${colors.userMessageText}`}>{message.text}</p>
                                    )}
                                    <span className={`text-xs mt-1.5 block ${colors.messageTimestampText} ${message.sender === 'user' ? `${colors.userMessageText}/80 text-right` : `${colors.assistantMessageText}/80`
                                        }`}>
                                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className={`${assistantMessageBubbleClasses} py-2.5 px-3.5 sm:px-4`}>
                                    <div className="flex space-x-1.5 items-center">
                                        <div className={`w-2 h-2 ${colors.chatSendButtonBg || 'bg-blue-500'} rounded-full animate-bounce`} style={{ animationDelay: '0s' }} />
                                        <div className={`w-2 h-2 ${colors.chatSendButtonBg || 'bg-blue-500'} rounded-full animate-bounce`} style={{ animationDelay: '0.15s' }} />
                                        <div className={`w-2 h-2 ${colors.chatSendButtonBg || 'bg-blue-500'} rounded-full animate-bounce`} style={{ animationDelay: '0.3s' }} />
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} className="h-1" />
                    </div>

                    <div className={inputAreaClasses}>
                        <div className="mb-2.5 flex flex-wrap gap-1.5 sm:gap-2">
                            {[
                                { label: "Explain...", prompt: "Explain this concept: " },
                                { label: "Summarize...", prompt: "Summarize this text: " },
                                { label: "Quiz me...", prompt: "Quiz me on: " },
                            ].map(p => (
                                <button
                                    key={p.label}
                                    onClick={() => handlePromptButtonClick(p.prompt)}
                                    className={promptButtonClasses(p)}
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>
                        <div className="flex items-end space-x-2 sm:space-x-3">
                            <textarea
                                ref={inputRef}
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Ask anything... (Shift+Enter for new line)"
                                className={textareaClasses}
                                rows={1}
                                style={{ maxHeight: '120px' }}
                            />
                            <button
                                onClick={handleSendMessage}
                                disabled={isLoading || !inputMessage.trim()}
                                className={sendButtonClasses}
                                aria-label="Send message"
                            >
                                <PaperAirplaneIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                            </button>
                        </div>
                    </div>
                </>
            )}
        </>
    );

    return (
        <>
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className={`fixed bottom-5 right-5 ${colors.chatSendButtonBg || 'bg-blue-600'} ${colors.chatSendButtonText || 'text-white'} ${colors.chatSendButtonHoverBg || 'hover:bg-blue-700'} rounded-full p-4 shadow-xl transition-transform duration-200 hover:scale-110 z-50 flex items-center justify-center`}
                    aria-label="Open Study Assistant"
                >
                    <ChatBubbleLeftEllipsisIcon className="w-8 h-8" />
                </button>
            )}

            {isOpen && (
                isFullScreen ? (
                    <div className={chatWindowClasses}>
                        {chatWindowInnerContent}
                    </div>
                ) : (
                    <Draggable handle=".chat-header" bounds="parent">
                        <div className={chatWindowClasses}>
                            {chatWindowInnerContent}
                        </div>
                    </Draggable>
                )
            )}
        </>
    );
};

export default ChatAssistant; 