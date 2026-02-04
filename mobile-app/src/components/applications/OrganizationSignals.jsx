import { CheckCircle, Eye, Clock, MessageSquare, AlertCircle, HelpCircle } from 'lucide-react';

/**
 * OrganizationSignals - Shows what the organization has or hasn't done
 * @param {Object} props
 * @param {Object} props.application - Application object with events
 * @param {string} [props.className] - Additional CSS classes
 */
export default function OrganizationSignals({ application, className = '' }) {
    if (!application) return null;

    const { events = [], status } = application;

    // Determine signal states from events
    const isReceived = events.some(e =>
        e.event_type === 'submitted' || e.event_type === 'application_received'
    );
    const isViewed = events.some(e => e.event_type === 'viewed_by_employer');
    const hasInfoRequest = events.some(e => e.event_type === 'info_requested');
    const hasInterview = events.some(e =>
        e.event_type === 'interview_scheduled' || e.event_type === 'interview_completed'
    );
    const hasFeedback = events.some(e =>
        e.event_type === 'feedback_received' || e.event_type === 'message_received'
    );
    const isFinal = status === 'offer' || status === 'rejected';

    // Find the most recent employer event for "last activity"
    const employerEvents = events.filter(e => !e.is_user_action);
    const lastEmployerEvent = employerEvents.length > 0
        ? employerEvents[employerEvents.length - 1]
        : null;

    const formatTimeSince = (timestamp) => {
        if (!timestamp) return '';
        const diff = Date.now() - new Date(timestamp).getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        if (days === 0) return 'Today';
        if (days === 1) return '1 day ago';
        if (days < 7) return `${days} days ago`;
        if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
        return `${Math.floor(days / 30)} months ago`;
    };

    const signals = [
        {
            key: 'received',
            icon: CheckCircle,
            label: 'Application received',
            status: isReceived ? 'complete' : 'pending',
            show: true
        },
        {
            key: 'viewed',
            icon: Eye,
            label: 'Employer viewed your profile',
            status: isViewed ? 'complete' : 'unknown',
            show: true
        },
        {
            key: 'info_request',
            icon: MessageSquare,
            label: 'Additional information requested',
            status: hasInfoRequest ? 'action_required' : 'none',
            show: hasInfoRequest
        },
        {
            key: 'interview',
            icon: AlertCircle,
            label: 'Interview scheduled',
            status: hasInterview ? 'complete' : 'none',
            show: hasInterview || status === 'interview'
        }
    ];

    const getSignalStyle = (status) => {
        switch (status) {
            case 'complete':
                return {
                    iconBg: 'bg-emerald-100',
                    iconColor: 'text-emerald-600',
                    textColor: 'text-slate-900',
                    indicator: '✓'
                };
            case 'action_required':
                return {
                    iconBg: 'bg-amber-100',
                    iconColor: 'text-amber-600',
                    textColor: 'text-amber-900',
                    indicator: '!'
                };
            case 'pending':
                return {
                    iconBg: 'bg-blue-100',
                    iconColor: 'text-blue-600',
                    textColor: 'text-slate-700',
                    indicator: '○'
                };
            case 'unknown':
            default:
                return {
                    iconBg: 'bg-slate-100',
                    iconColor: 'text-slate-400',
                    textColor: 'text-slate-500',
                    indicator: '?'
                };
        }
    };

    const visibleSignals = signals.filter(s => s.show);

    return (
        <div className={`bg-white rounded-2xl border border-slate-100 overflow-hidden ${className}`}>
            {/* Header */}
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
                <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-slate-700">Organization Status</h4>
                    {lastEmployerEvent && (
                        <span className="text-xs text-slate-400">
                            Last activity: {formatTimeSince(lastEmployerEvent.timestamp)}
                        </span>
                    )}
                </div>
            </div>

            {/* Signals list */}
            <div className="divide-y divide-slate-50">
                {visibleSignals.map((signal) => {
                    const style = getSignalStyle(signal.status);
                    const Icon = signal.icon;

                    return (
                        <div
                            key={signal.key}
                            className="flex items-center gap-3 px-4 py-3"
                        >
                            <div className={`p-1.5 rounded-lg ${style.iconBg}`}>
                                <Icon className={`w-4 h-4 ${style.iconColor}`} />
                            </div>
                            <span className={`flex-1 text-sm ${style.textColor}`}>
                                {signal.label}
                            </span>
                            <span className={`text-sm font-medium ${style.iconColor}`}>
                                {signal.status === 'complete' && '✓'}
                                {signal.status === 'action_required' && (
                                    <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">
                                        Action needed
                                    </span>
                                )}
                                {signal.status === 'unknown' && (
                                    <span className="text-slate-400">Not yet</span>
                                )}
                                {signal.status === 'pending' && (
                                    <span className="text-blue-500">Pending</span>
                                )}
                            </span>
                        </div>
                    );
                })}

                {/* Fallback message when no employer activity */}
                {!isViewed && !hasInfoRequest && !hasInterview && (
                    <div className="px-4 py-3 flex items-center gap-2 text-slate-500">
                        <HelpCircle className="w-4 h-4" />
                        <span className="text-sm italic">
                            Status not yet shared by the organization
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
