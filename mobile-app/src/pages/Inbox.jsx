import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  GraduationCap,
  Users,
  Clock,
  CheckCircle2,
  Eye,
  Star,
  Calendar,
  Gift,
  XCircle,
  UserCheck,
  MessageSquare,
} from 'lucide-react';

const TYPE_TABS = [
  { id: 'all', label: 'All' },
  { id: 'job', label: 'Jobs', icon: Briefcase },
  { id: 'internship', label: 'Internships', icon: Users },
  { id: 'scholarship', label: 'Scholarships', icon: GraduationCap },
  { id: 'interview', label: 'Interviews', icon: Calendar },
];

const STATUS_CONFIG = {
  applied: { label: 'Applied', icon: CheckCircle2, color: 'text-blue-600 bg-blue-50' },
  viewed: { label: 'Viewed', icon: Eye, color: 'text-purple-600 bg-purple-50' },
  shortlisted: { label: 'Shortlisted', icon: Star, color: 'text-amber-600 bg-amber-50' },
  interview: { label: 'Interview', icon: Calendar, color: 'text-indigo-600 bg-indigo-50' },
  offer: { label: 'Offer', icon: Gift, color: 'text-emerald-600 bg-emerald-50' },
  rejected: { label: 'Rejected', icon: XCircle, color: 'text-red-500 bg-red-50' },
  hired: { label: 'Hired', icon: UserCheck, color: 'text-green-600 bg-green-50' },
};

function ConversationCard({ conversation, onClick }) {
  const latestStatus = conversation.latest_status || 'applied';
  const config = STATUS_CONFIG[latestStatus] || STATUS_CONFIG.applied;
  const StatusIcon = config.icon;

  const timeAgo = (dateStr) => {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <button
      onClick={onClick}
      className="w-full flex items-start gap-3 p-4 bg-white border-b border-slate-100 hover:bg-slate-50 transition-colors text-left"
    >
      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${config.color}`}>
        <StatusIcon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="font-medium text-slate-900 truncate">
            {conversation.opportunity_title || 'Opportunity'}
          </span>
          <span className="text-xs text-slate-400 flex-shrink-0">
            {timeAgo(conversation.last_message_at || conversation.created_at)}
          </span>
        </div>
        <p className="text-sm text-slate-600 truncate mb-0.5">
          {conversation.company_name || 'Company'}
        </p>
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
            <StatusIcon className="w-3 h-3" />
            {config.label}
          </span>
          <span className="text-xs text-slate-400 capitalize">{conversation.type}</span>
        </div>
      </div>
      {conversation.unread_count > 0 && (
        <div className="w-5 h-5 rounded-full bg-purple-500 text-white text-xs flex items-center justify-center flex-shrink-0 mt-1">
          {conversation.unread_count}
        </div>
      )}
      <ChevronRight className="w-4 h-4 text-slate-300 mt-2 flex-shrink-0" />
    </button>
  );
}

function EventTimeline({ events }) {
  if (!events || events.length === 0) {
    return (
      <div className="p-6 text-center text-slate-400 text-sm">
        No events yet.
      </div>
    );
  }

  return (
    <div className="py-4 px-5">
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-slate-200" />

        {events.map((event, idx) => {
          const config = STATUS_CONFIG[event.status] || STATUS_CONFIG.applied;
          const EventIcon = config.icon || Clock;

          return (
            <div key={event.id || idx} className="relative flex gap-4 pb-6 last:pb-0">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${config.color}`}>
                <EventIcon className="w-4 h-4" />
              </div>
              <div className="flex-1 pt-1.5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-900">{config.label}</p>
                  <span className="text-xs text-slate-400">
                    {event.created_at ? new Date(event.created_at).toLocaleDateString() : ''}
                  </span>
                </div>
                {event.message && (
                  <p className="text-sm text-slate-500 mt-0.5">{event.message}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[50vh]">
      <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mb-6 animate-pulse">
        <MessageSquare className="w-10 h-10 text-purple-400" />
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">No conversations yet</h3>
      <p className="text-slate-500 max-w-xs mx-auto mb-8">
        Your conversations with recruiters and companies will appear here once you start applying.
      </p>
    </div>
  );
}

export default function Inbox() {
  const { user } = useAuth();
  const [activeType, setActiveType] = useState('all');
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedConv, setSelectedConv] = useState(null);
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadConversations();
  }, [user]);

  const loadConversations = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('conversations')
        .select(`
          *,
          opportunities ( title, company_name )
        `)
        .eq('user_id', user.id)
        .order('last_message_at', { ascending: false, nullsFirst: false });

      if (fetchError) throw fetchError;

      // Map to include opportunity info at top level
      const mapped = (data || []).map((conv) => ({
        ...conv,
        opportunity_title: conv.opportunities?.title || 'Opportunity',
        company_name: conv.opportunities?.company_name || 'Company',
      }));

      setConversations(mapped);

      // Load latest status for each conversation
      if (mapped.length > 0) {
        const convIds = mapped.map((c) => c.id);
        const { data: latestEvents } = await supabase
          .from('conversation_events')
          .select('conversation_id, status')
          .in('conversation_id', convIds)
          .eq('kind', 'status_update')
          .order('created_at', { ascending: false });

        if (latestEvents) {
          const statusMap = {};
          latestEvents.forEach((e) => {
            if (!statusMap[e.conversation_id] && e.status) {
              statusMap[e.conversation_id] = e.status;
            }
          });

          setConversations((prev) =>
            prev.map((c) => ({
              ...c,
              latest_status: statusMap[c.id] || 'applied',
            }))
          );
        }
      }
    } catch (err) {
      if (err.name === 'AbortError' || err.message?.includes('AbortError')) return;
      console.error('Conversations load error:', err);
      setError(err.message || 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const loadEvents = async (conversationId) => {
    setEventsLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('conversation_events')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setEvents(data || []);

      // Mark as read (reset unread count)
      await supabase
        .from('conversations')
        .update({ unread_count: 0 })
        .eq('id', conversationId);
    } catch (err) {
      console.error('Events load error:', err);
    } finally {
      setEventsLoading(false);
    }
  };

  const openConversation = (conv) => {
    setSelectedConv(conv);
    loadEvents(conv.id);
  };

  const filtered = conversations.filter((c) => {
    const matchType = activeType === 'all' || c.type === activeType;
    const matchSearch =
      !searchQuery ||
      (c.opportunity_title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.company_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchType && matchSearch;
  });

  const unreadByType = (type) =>
    conversations.filter((c) => (type === 'all' || c.type === type) && (c.unread_count || 0) > 0).length;

  // ── Detail view ──
  if (selectedConv) {
    const config = STATUS_CONFIG[selectedConv.latest_status] || STATUS_CONFIG.applied;

    return (
      <div className="flex-1 flex flex-col bg-[var(--color-bg)] min-h-screen">
        <div className="bg-white border-b border-slate-100 px-4 py-3 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button onClick={() => setSelectedConv(null)} className="p-1 hover:bg-slate-100 rounded-lg">
              <ChevronLeft className="w-6 h-6 text-slate-600" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-base font-semibold text-slate-900 truncate">
                {selectedConv.opportunity_title}
              </h1>
              <p className="text-xs text-slate-500 truncate">{selectedConv.company_name}</p>
            </div>
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
              {config.label}
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pb-20">
          {eventsLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full" />
            </div>
          ) : (
            <EventTimeline events={events} />
          )}
        </div>
      </div>
    );
  }

  // ── List view ──
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[var(--color-bg)]">
      {/* Header */}
      <div className="bg-white border-b border-slate-100">
        <div className="px-4 py-3 flex items-center gap-3">
          <h1 className="text-lg font-semibold text-slate-900">Inbox</h1>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations"
              className="w-full pl-9 pr-4 py-2 bg-slate-50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Type Tabs */}
        <div className="px-4 pb-3 flex gap-2 overflow-x-auto">
          {TYPE_TABS.map((tab) => {
            const count = unreadByType(tab.id);
            const isActive = activeType === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveType(tab.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${isActive
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
              >
                {tab.label}
                {count > 0 && (
                  <span
                    className={`w-5 h-5 rounded-full text-xs flex items-center justify-center ${isActive ? 'bg-white/20' : 'bg-purple-500 text-white'
                      }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
          <button onClick={loadConversations} className="ml-2 underline">
            Retry
          </button>
        </div>
      )}

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto pb-20">
        {filtered.length > 0 ? (
          filtered.map((conv) => (
            <ConversationCard key={conv.id} conversation={conv} onClick={() => openConversation(conv)} />
          ))
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}
