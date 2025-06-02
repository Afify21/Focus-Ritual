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
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [isInFocusMode, setIsInFocusMode] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Check if we're in focus mode
    useEffect(() => {
        const checkFocusMode = () => {
            setIsInFocusMode(window.location.pathname === '/focus');
        };
        checkFocusMode();
        window.addEventListener('popstate', checkFocusMode);
        return () => window.removeEventListener('popstate', checkFocusMode);
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen && !isFullScreen) {
            scrollToBottom();
            inputRef.current?.focus();
        }
    }, [isOpen, messages, isFullScreen]);

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
            if (!isFullScreen) inputRef.current?.focus();
        }
    };

    const handleToggleFullScreen = () => {
        const newFullScreenState = !isFullScreen;
        setIsFullScreen(newFullScreenState);
    };

    const handleClose = () => {
        setIsOpen(false);
        setIsFullScreen(false);
    };

    const handlePromptButtonClick = (promptText: string) => {
        setInputMessage(promptText);
        if (!isFullScreen) {
            inputRef.current?.focus();
        }
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
        fixed z-[99999]
        transition-[width,height,top,left,bottom,right,border-radius] duration-300 ease-in-out
    `;

    let chatWindowDynamicClasses = '';
    if (isFullScreen) {
        chatWindowDynamicClasses = `
            w-[500px] h-[700px]
            bottom-4 right-4
            rounded-xl
        `;
    } else { // Default floating window state
        chatWindowDynamicClasses = `
            w-[300px] sm:w-[350px]
            h-[400px] sm:h-[450px]
            bottom-4 right-4
            rounded-xl
        `;
    }
    const chatWindowClasses = `${chatWindowBaseClasses} ${chatWindowDynamicClasses}`;

    const headerClasses = `
        chat-header 
        ${colors.chatHeaderBg} 
        ${colors.chatHeaderText} 
        p-2 sm:p-3 rounded-t-xl 
        ${isFullScreen ? 'sm:rounded-t-none' : 'sm:rounded-t-lg'}
        flex justify-between items-center 
        border-b ${colors.chatInputBorder} 
        cursor-move
    `;

    const headerButtonClasses = `
        ${colors.chatHeaderIcon} 
        ${colors.chatHeaderIconHoverBg} 
        hover:text-white 
        rounded-full p-1 transition-colors
    `;

    const messageListClasses = `
        flex-1 overflow-y-auto p-2 sm:p-3 space-y-2 
        ${colors.chatMessageListBg}
        ${colors.scrollbarThumb} ${colors.scrollbarTrack} 
        scrollbar-thin
    `;

    const inputAreaClasses = `
        p-2 border-t 
        ${colors.chatInputBorder} 
        ${colors.chatInputAreaBg}
    `;

    const promptButtonClasses = (p: any) => `
        px-2 py-0.5 text-xs
        ${colors.chatPromptButtonBg} 
        ${colors.chatPromptButtonText} 
        ${colors.chatPromptButtonHoverBg} 
        rounded-md transition-colors
    `;

    const textareaClasses = `
        flex-1 p-2 border 
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
        rounded-lg p-2 transition-colors 
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

    const chatWindowInnerContent = (
        <>
            <div className={headerClasses}>
                <div className="flex items-center gap-3">
                    <AcademicCapIcon className={`w-7 h-7 ${colors.chatHeaderIcon || 'text-blue-300'}`} />
                    <h3 className="font-semibold text-lg">Study Assistant</h3>
                </div>
                <div className="flex items-center space-x-1">
                    {!isFullScreen && (
                        <button
                            onClick={handleToggleFullScreen}
                            className={headerButtonClasses}
                            aria-label={isFullScreen ? "Exit full screen" : "Go full screen"}
                        >
                            {isFullScreen ? <ArrowsPointingInIcon className="w-5 h-5" /> : <ArrowsPointingOutIcon className="w-5 h-5" />}
                        </button>
                    )}
                    <button
                        onClick={handleClose}
                        className={headerButtonClasses}
                        aria-label="Close chat"
                    >
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>
            </div>

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
                        className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
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
                            <span className={`text-xs mt-1.5 block ${colors.messageTimestampText} ${message.sender === 'user'
                                ? `${colors.userMessageText}/80 text-right`
                                : `${colors.assistantMessageText}/80`
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
                            type="button"
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
                        type="button"
                        aria-label="Send message"
                    >
                        <PaperAirplaneIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                </div>
            </div>
        </>
    );

    return (
        <div className="fixed bottom-4 right-4 z-[99999]">
            {!isOpen ? (
                <div className="pointer-events-auto">
                    <button
                        onClick={() => setIsOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg flex items-center justify-center"
                        style={{ width: '48px', height: '48px' }}
                        type="button"
                    >
                        <ChatBubbleLeftEllipsisIcon className="w-6 h-6" />
                    </button>
                </div>
            ) : (
                <Draggable
                    handle=".chat-header"
                    bounds="parent"
                    disabled={isInFocusMode}
                >
                    <div className="pointer-events-auto">
                        <div className={chatWindowClasses}>
                            {chatWindowInnerContent}
                        </div>
                    </div>
                </Draggable>
            )}
        </div>
    );
};

export default ChatAssistant; 