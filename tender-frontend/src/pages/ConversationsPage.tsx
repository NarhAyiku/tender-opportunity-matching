import { useEffect, useState } from 'react';
import { AppLayout } from '../components/layout';
import { Spinner, Modal, Button } from '../components/common';
import { conversationsApi } from '../api';
import { Conversation, ConversationEvent } from '../types';
import {
    MessageSquare,
    Building2,
    Clock,
    CheckCircle2,
    Send,
    Eye,
    Calendar,
    Briefcase,
    GraduationCap,
    Award,
    ChevronRight,
    Inbox,
    Bell
} from 'lucide-react';

export function ConversationsPage() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [events, setEvents] = useState<ConversationEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingEvents, setIsLoadingEvents] = useState(false);
    const [filter, setFilter] = useState<string | null>(null);

    useEffect(() => {
        fetchConversations();
    }, [filter]);

    const fetchConversations = async () => {
        try {
            setIsLoading(true);
            const data = await conversationsApi.getConversations(filter || undefined);
            setConversations(data);
        } catch (error) {
            console.error('Failed to fetch conversations:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectConversation = async (conv: Conversation) => {
        setSelectedConversation(conv);
        setIsLoadingEvents(true);
        try {
            const eventsData = await conversationsApi.getConversationEvents(conv.id);
            setEvents(eventsData);
        } catch (error) {
            console.error('Failed to fetch events:', error);
        } finally {
            setIsLoadingEvents(false);
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'job': return <Briefcase size={16} className="text-blue-500" />;
            case 'internship': return <GraduationCap size={16} className="text-purple-500" />;
            case 'scholarship': return <Award size={16} className="text-amber-500" />;
            default: return <MessageSquare size={16} className="text-gray-500" />;
        }
    };

    const getEventIcon = (kind: string, status?: string) => {
        if (kind === 'status_update') {
            switch (status) {
                case 'applied': return <Send size={16} className="text-primary-500" />;
                case 'viewed': return <Eye size={16} className="text-blue-500" />;
                case 'interview': return <Calendar size={16} className="text-purple-500" />;
                case 'offer': return <CheckCircle2 size={16} className="text-green-500" />;
                default: return <Clock size={16} className="text-gray-400" />;
            }
        }
        return <MessageSquare size={16} className="text-gray-400" />;
    };

    const getEventColor = (status?: string) => {
        switch (status) {
            case 'applied': return 'bg-primary-50 border-primary-200 text-primary-700';
            case 'viewed': return 'bg-blue-50 border-blue-200 text-blue-700';
            case 'interview': return 'bg-purple-50 border-purple-200 text-purple-700';
            case 'offer': return 'bg-green-50 border-green-200 text-green-700';
            default: return 'bg-gray-50 border-gray-200 text-gray-700';
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays < 7) {
            return `${diffDays} days ago`;
        } else {
            return date.toLocaleDateString();
        }
    };

    const filters = [
        { label: 'All', value: null },
        { label: 'Jobs', value: 'job' },
        { label: 'Internships', value: 'internship' },
        { label: 'Scholarships', value: 'scholarship' },
    ];

    if (isLoading) {
        return (
            <AppLayout>
                <div className="flex justify-center items-center h-[calc(100vh-100px)]">
                    <Spinner size="lg" />
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="px-4 py-6 pb-24 max-w-2xl mx-auto">
                {/* Header */}
                <header className="mb-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-primary-100 rounded-xl">
                            <Inbox size={24} className="text-primary-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-display font-bold text-gray-900">Inbox</h1>
                            <p className="text-sm text-gray-500">Track your applications & messages</p>
                        </div>
                    </div>
                </header>

                {/* Filters */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                    {filters.map((f) => (
                        <button
                            key={f.label}
                            onClick={() => setFilter(f.value)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${filter === f.value
                                    ? 'bg-primary-600 text-white shadow-md'
                                    : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-300 hover:text-primary-600'
                                }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>

                {/* Conversations List */}
                {conversations.length === 0 ? (
                    <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                            <MessageSquare size={28} className="text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">No conversations yet</h3>
                        <p className="text-gray-500 text-sm max-w-xs mx-auto">
                            Apply to opportunities and your conversations will appear here
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {conversations.map((conv) => (
                            <button
                                key={conv.id}
                                onClick={() => handleSelectConversation(conv)}
                                className="w-full bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-primary-200 transition-all text-left group"
                            >
                                <div className="flex items-start gap-4">
                                    {/* Icon */}
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center flex-shrink-0">
                                        {getTypeIcon(conv.type)}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <h3 className="font-semibold text-gray-900 truncate group-hover:text-primary-700 transition-colors">
                                                    {conv.opportunity?.title || `Application #${conv.application_id}`}
                                                </h3>
                                                <div className="flex items-center gap-1 text-sm text-gray-500 mt-0.5">
                                                    <Building2 size={12} />
                                                    <span className="truncate">{conv.opportunity?.company_name || 'Unknown Company'}</span>
                                                </div>
                                            </div>

                                            {/* Unread badge */}
                                            {conv.unread_count > 0 && (
                                                <span className="bg-primary-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                                    {conv.unread_count}
                                                </span>
                                            )}
                                        </div>

                                        {/* Meta row */}
                                        <div className="flex items-center justify-between mt-3">
                                            <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md border uppercase tracking-wide ${conv.type === 'job' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                    conv.type === 'internship' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                                                        'bg-amber-50 text-amber-600 border-amber-100'
                                                }`}>
                                                {getTypeIcon(conv.type)}
                                                {conv.type}
                                            </span>
                                            <span className="text-xs text-gray-400">
                                                {conv.last_message_at ? formatDate(conv.last_message_at) : formatDate(conv.created_at)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Arrow */}
                                    <ChevronRight size={20} className="text-gray-300 group-hover:text-primary-500 transition-colors flex-shrink-0 mt-1" />
                                </div>
                            </button>
                        ))}
                    </div>
                )}

                {/* Conversation Detail Modal */}
                <Modal
                    isOpen={!!selectedConversation}
                    onClose={() => setSelectedConversation(null)}
                    title={selectedConversation?.opportunity?.title || 'Conversation'}
                >
                    {selectedConversation && (
                        <div>
                            {/* Company Header */}
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center">
                                    <Building2 size={20} className="text-primary-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">
                                        {selectedConversation.opportunity?.company_name || 'Organization'}
                                    </h3>
                                    <span className={`inline-flex items-center gap-1 text-xs font-medium mt-1 uppercase tracking-wide ${selectedConversation.type === 'job' ? 'text-blue-600' :
                                            selectedConversation.type === 'internship' ? 'text-purple-600' :
                                                'text-amber-600'
                                        }`}>
                                        {getTypeIcon(selectedConversation.type)}
                                        {selectedConversation.type}
                                    </span>
                                </div>
                            </div>

                            {/* Events Timeline */}
                            <div className="mb-4">
                                <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                                    <Bell size={16} />
                                    Activity Timeline
                                </h4>

                                {isLoadingEvents ? (
                                    <div className="flex justify-center py-8">
                                        <Spinner size="md" />
                                    </div>
                                ) : events.length === 0 ? (
                                    <p className="text-center text-gray-500 py-8">No activity yet</p>
                                ) : (
                                    <div className="relative">
                                        {/* Timeline line */}
                                        <div className="absolute left-5 top-2 bottom-2 w-0.5 bg-gray-100" />

                                        <div className="space-y-4">
                                            {events.map((event) => (
                                                <div key={event.id} className="relative flex gap-4 pl-2">
                                                    {/* Icon circle */}
                                                    <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center border-2 bg-white ${getEventColor(event.status)}`}>
                                                        {getEventIcon(event.kind, event.status)}
                                                    </div>

                                                    {/* Content */}
                                                    <div className="flex-1 pb-4">
                                                        <div className={`inline-block px-3 py-1 rounded-lg text-sm font-medium ${getEventColor(event.status)}`}>
                                                            {event.status ? event.status.charAt(0).toUpperCase() + event.status.slice(1) : event.kind}
                                                        </div>
                                                        {event.message && (
                                                            <p className="text-sm text-gray-600 mt-1">{event.message}</p>
                                                        )}
                                                        <p className="text-xs text-gray-400 mt-1">
                                                            {formatDate(event.created_at)} • {event.actor}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </Modal>
            </div>
        </AppLayout>
    );
}
