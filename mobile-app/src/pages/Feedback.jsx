import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Send, Smile, Paperclip, ChevronLeft } from 'lucide-react';

export default function Feedback() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [messages, setMessages] = useState([
        {
            id: 1,
            text: "Hi there! 👋 We'd love to hear your feedback. What's on your mind?",
            sender: 'system',
            timestamp: new Date(),
        },
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = () => {
        if (!inputValue.trim()) return;

        const userMessage = {
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
                "Thank you for your feedback! We really appreciate it. 🙏",
                "That's great input! Our team will review this.",
                "We hear you! This helps us improve the platform.",
                "Thanks for letting us know!",
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

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    };

    const quickResponses = ['Bug report 🐛', 'Feature request 💡', 'General feedback 📝', 'Love it! ❤️'];

    return (
        <div className="min-h-screen bg-[var(--color-bg)] flex flex-col">
            {/* Header */}
            <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-lg border-b border-gray-100">
                <div className="flex items-center gap-4 px-4 py-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ChevronLeft size={24} className="text-gray-600" />
                    </button>
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-full flex items-center justify-center"
                            style={{
                                background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--gradient-mid) 100%)'
                            }}
                        >
                            <span className="text-white text-lg">💬</span>
                        </div>
                        <div>
                            <h1 className="font-bold text-gray-900">Feedback</h1>
                            <p className="text-xs text-green-500 font-medium">● Online</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[80%] rounded-2xl px-4 py-3 ${message.sender === 'user'
                                    ? 'text-white rounded-br-md'
                                    : 'bg-white text-gray-900 shadow-sm border border-gray-100 rounded-bl-md'
                                }`}
                            style={message.sender === 'user' ? {
                                background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--gradient-mid) 100%)'
                            } : {}}
                        >
                            <p className="text-sm leading-relaxed">{message.text}</p>
                            <p
                                className={`text-xs mt-1 ${message.sender === 'user' ? 'text-white/70' : 'text-gray-400'
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
                    {quickResponses.map((quick) => (
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
            <div className="px-4 py-4 bg-white border-t border-gray-100 pb-24">
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
                            className="w-full px-4 py-3 bg-gray-100 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:bg-white transition-all text-sm"
                            rows={1}
                            style={{ minHeight: '44px', maxHeight: '120px' }}
                        />
                    </div>
                    <button
                        onClick={handleSend}
                        disabled={!inputValue.trim()}
                        className="p-3 rounded-full text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        style={{
                            background: inputValue.trim()
                                ? 'linear-gradient(135deg, var(--color-primary) 0%, var(--gradient-mid) 100%)'
                                : 'var(--color-gray-300)'
                        }}
                    >
                        <Send size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
}
