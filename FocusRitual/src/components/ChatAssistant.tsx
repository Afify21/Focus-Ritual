import React, { useState, useRef, useEffect } from 'react';
import { PaperAirplaneIcon, XMarkIcon, AcademicCapIcon, ChatBubbleLeftEllipsisIcon } from '@heroicons/react/24/solid';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'assistant';
    timestamp: Date;
}

const ChatAssistant: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
            inputRef.current?.focus();
        }
    }, [isOpen, messages]);

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
            const response = await fetch('http://localhost:5002/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: inputMessage, history: historyForBackend }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(errorData.details || `Server error: ${response.status}`);
            }

            const data = await response.json();

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
            inputRef.current?.focus();
        }
    };

    const handlePromptButtonClick = (promptText: string) => {
        setInputMessage(promptText);
        inputRef.current?.focus();
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <>
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-5 right-5 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-xl transition-transform duration-200 hover:scale-110 z-50 flex items-center justify-center"
                    aria-label="Open Study Assistant"
                >
                    <ChatBubbleLeftEllipsisIcon className="w-8 h-8" />
                </button>
            )}

            {isOpen && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[9998] flex items-end justify-end">
                    <div className="bg-white dark:bg-slate-800 rounded-t-xl sm:rounded-xl shadow-2xl w-full sm:w-[450px] md:w-[500px] h-[calc(100vh-40px)] sm:h-[650px] sm:max-h-[85vh] flex flex-col fixed bottom-0 right-0 sm:bottom-5 sm:right-5 z-[9999]">
                        <div className="bg-slate-700 dark:bg-slate-900 text-white p-4 sm:p-5 rounded-t-xl sm:rounded-t-lg flex justify-between items-center border-b border-slate-600 dark:border-slate-700">
                            <div className="flex items-center gap-3">
                                <AcademicCapIcon className="w-7 h-7 text-blue-300" />
                                <h3 className="font-semibold text-lg">Study Assistant</h3>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-slate-300 hover:text-white hover:bg-slate-600 dark:hover:bg-slate-700 rounded-full p-1.5 transition-colors"
                                aria-label="Close chat"
                            >
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm border-b border-red-200 dark:border-red-800/50">
                                <div className="flex items-center gap-2">
                                    <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                                    <span>{error}</span>
                                </div>
                            </div>
                        )}

                        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50 dark:bg-slate-700/50">
                            {messages.length === 0 && !isLoading && (
                                <div className="text-center text-slate-500 dark:text-slate-400 mt-12 opacity-75">
                                    <AcademicCapIcon className="w-16 h-16 mx-auto mb-4 text-slate-400 dark:text-slate-500" />
                                    <h4 className="font-semibold text-xl mb-2">FocusRitual AI Assistant</h4>
                                    <p className="text-sm">Ready to help you learn and explore. <br />Ask me anything!</p>
                                </div>
                            )}
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`flex ${
                                        message.sender === 'user' ? 'justify-end' : 'justify-start'
                                    }`}
                                >
                                    <div
                                        className={`max-w-[85%] rounded-xl sm:rounded-2xl py-2 px-3.5 sm:py-2.5 sm:px-4 shadow-md break-words ${
                                            message.sender === 'user'
                                                ? 'bg-blue-600 dark:bg-blue-700 text-white'
                                                : 'bg-white dark:bg-slate-600 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-500/50'
                                        }`}
                                    >
                                        {message.sender === 'assistant' ? (
                                            <div className="prose prose-sm max-w-none leading-relaxed text-slate-800 dark:text-slate-100 prose-p:my-1 prose-ul:my-1.5 prose-ol:my-1.5 prose-headings:my-2">
                                                <ReactMarkdown rehypePlugins={[rehypeRaw, remarkGfm]}>
                                                    {message.text}
                                                </ReactMarkdown>
                                            </div>
                                        ) : (
                                            <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.text}</p>
                                        )}
                                        <span className={`text-xs mt-1.5 block opacity-70 ${
                                            message.sender === 'user' ? 'text-blue-100 dark:text-blue-200/80 text-right' : 'text-slate-500 dark:text-slate-400'
                                        }`}>
                                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-white dark:bg-slate-600 text-slate-800 dark:text-slate-100 rounded-xl sm:rounded-2xl py-2.5 px-3.5 sm:px-4 shadow-md border border-slate-200 dark:border-slate-500/50">
                                        <div className="flex space-x-1.5 items-center">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0s'}} />
                                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.15s'}}/>
                                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.3s'}} />
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} className="h-1" />
                        </div>

                        <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
                            <div className="mb-2.5 flex flex-wrap gap-1.5 sm:gap-2">
                                {[
                                    { label: "Explain...", prompt: "Explain this concept: " },
                                    { label: "Summarize...", prompt: "Summarize this text: " },
                                    { label: "Quiz me...", prompt: "Quiz me on: " },
                                ].map(p => (
                                    <button
                                        key={p.label}
                                        onClick={() => handlePromptButtonClick(p.prompt)}
                                        className="px-3 py-1 text-xs sm:text-sm bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-md hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
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
                                    className="flex-1 p-2.5 sm:p-3 border border-slate-300 dark:border-slate-600 rounded-lg resize-none bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-50 shadow-sm text-sm"
                                    rows={1}
                                    style={{ maxHeight: '120px' }}
                                />
                                <button
                                    onClick={handleSendMessage}
                                    disabled={isLoading || !inputMessage.trim()}
                                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-2.5 sm:p-3 transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-sm flex items-center justify-center"
                                    aria-label="Send message"
                                >
                                    <PaperAirplaneIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ChatAssistant; 