import { useState, useRef, useEffect } from 'react';
import { AppLayout } from '../components/layout';
import { Button } from '../components/common';
import { Send, MessageCircle, Smile, Paperclip, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Message {
    id: number;
    text: string;
    sender: 'user' | 'system';
    timestamp: Date;
}

export function FeedbackPage() {
    const navigate = useNavigate();
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 1,
            text: "Hi there! 👋 We'd love to hear your feedback about OpportunityMatch. What's on your mind?",
            sender: 'system',
            timestamp: new Date(),
        },
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = () => {
        if (!inputValue.trim()) return;

        const userMessage: Message = {
            id: Date.now(),
            text: inputValue,
            sender: 'user',
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputValue('');

        // Simulate system response
        setIsTyping(true);
        setTimeout(() => {
            const responses = [
                "Thank you for your feedback! We really appreciate you taking the time to share your thoughts. 🙏",
                "That's great input! Our team will review this and consider it for future updates.",
                "We hear you! This feedback is valuable and helps us improve the platform for everyone.",
                "Thanks for letting us know! We're always working to make OpportunityMatch better.",
            ];
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];

            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now(),
                    text: randomResponse,
                    sender: 'system',
                    timestamp: new Date(),
                },
            ]);
            setIsTyping(false);
        }, 1500);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    };

    return (
        <AppLayout>
            <div className="flex flex-col h-[calc(100vh-5rem)] max-w-2xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 px-4 py-4 border-b border-gray-100 bg-white sticky top-0 z-10">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ChevronLeft size={24} className="text-gray-600" />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-full flex items-center justify-center">
                            <MessageCircle size={20} className="text-white" />
                        </div>
                        <div>
                            <h1 className="font-bold text-gray-900">Feedback</h1>
                            <p className="text-xs text-green-500 font-medium">● Online</p>
                        </div>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 bg-gray-50">
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[80%] rounded-2xl px-4 py-3 ${message.sender === 'user'
                                        ? 'bg-gradient-to-br from-cyan-500 to-cyan-600 text-white rounded-br-md'
                                        : 'bg-white text-gray-900 shadow-sm border border-gray-100 rounded-bl-md'
                                    }`}
                            >
                                <p className="text-sm leading-relaxed">{message.text}</p>
                                <p
                                    className={`text-xs mt-1 ${message.sender === 'user' ? 'text-cyan-100' : 'text-gray-400'
                                        }`}
                                >
                                    {formatTime(message.timestamp)}
                                </p>
                            </div>
                        </div>
                    ))}

                    {/* Typing Indicator */}
                    {isTyping && (
                        <div className="flex justify-start">
                            <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-100 rounded-bl-md">
                                <div className="flex gap-1.5">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Quick Responses */}
                <div className="px-4 py-2 bg-white border-t border-gray-100 overflow-x-auto">
                    <div className="flex gap-2 pb-2">
                        {['Bug report 🐛', 'Feature request 💡', 'General feedback 📝', 'Love the app! ❤️'].map((quick) => (
                            <button
                                key={quick}
                                onClick={() => setInputValue(quick)}
                                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-sm font-medium text-gray-700 whitespace-nowrap transition-colors"
                            >
                                {quick}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Input Area */}
                <div className="px-4 py-4 bg-white border-t border-gray-100 pb-24 sm:pb-4">
                    <div className="flex items-end gap-2">
                        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                            <Paperclip size={22} />
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                            <Smile size={22} />
                        </button>
                        <div className="flex-1 relative">
                            <textarea
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Type your feedback..."
                                className="w-full px-4 py-3 bg-gray-100 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white transition-all text-sm"
                                rows={1}
                                style={{ minHeight: '44px', maxHeight: '120px' }}
                            />
                        </div>
                        <Button
                            onClick={handleSend}
                            disabled={!inputValue.trim()}
                            className="p-3 rounded-full gradient-primary disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Send size={20} className="text-white" />
                        </Button>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
