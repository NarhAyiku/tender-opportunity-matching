import {
    CheckCircle,
    Heart,
    Play,
    HelpCircle,
    CheckSquare,
    Paperclip,
    Send,
    Eye,
    Calendar,
    Video,
    Gift,
    XCircle,
    Undo,
    Mail,
    FileText,
    Circle,
} from 'lucide-react';

/**
 * Event type configuration with icons and colors
 */
const EVENT_CONFIG = {
    swiped_right: { icon: Heart, color: 'purple', bgColor: 'bg-purple-100', iconColor: 'text-purple-600' },
    application_started: { icon: Play, color: 'blue', bgColor: 'bg-blue-100', iconColor: 'text-blue-600' },
    questions_requested: { icon: HelpCircle, color: 'amber', bgColor: 'bg-amber-100', iconColor: 'text-amber-600' },
    questions_answered: { icon: CheckSquare, color: 'green', bgColor: 'bg-green-100', iconColor: 'text-green-600' },
    documents_attached: { icon: Paperclip, color: 'slate', bgColor: 'bg-slate-100', iconColor: 'text-slate-600' },
    submitted: { icon: Send, color: 'purple', bgColor: 'bg-purple-100', iconColor: 'text-purple-600' },
    viewed_by_employer: { icon: Eye, color: 'blue', bgColor: 'bg-blue-100', iconColor: 'text-blue-600' },
    interview_scheduled: { icon: Calendar, color: 'purple', bgColor: 'bg-purple-100', iconColor: 'text-purple-600' },
    interview_completed: { icon: Video, color: 'green', bgColor: 'bg-green-100', iconColor: 'text-green-600' },
    offer_received: { icon: Gift, color: 'emerald', bgColor: 'bg-emerald-100', iconColor: 'text-emerald-600' },
    offer_accepted: { icon: CheckCircle, color: 'emerald', bgColor: 'bg-emerald-100', iconColor: 'text-emerald-600' },
    offer_declined: { icon: XCircle, color: 'red', bgColor: 'bg-red-100', iconColor: 'text-red-600' },
    rejected: { icon: XCircle, color: 'red', bgColor: 'bg-red-100', iconColor: 'text-red-600' },
    withdrawn: { icon: Undo, color: 'slate', bgColor: 'bg-slate-100', iconColor: 'text-slate-600' },
    follow_up_sent: { icon: Mail, color: 'blue', bgColor: 'bg-blue-100', iconColor: 'text-blue-600' },
    note_added: { icon: FileText, color: 'slate', bgColor: 'bg-slate-100', iconColor: 'text-slate-600' },
};

/**
 * TimelineItem - Single event in the timeline
 * @param {Object} props
 * @param {Object} props.event - Application event object
 * @param {boolean} props.isFirst - Is this the first item in the group
 * @param {boolean} props.isLast - Is this the last item in the group
 * @param {boolean} [props.showConnector=true] - Show the vertical connector line
 * @param {string} [props.className]
 */
export default function TimelineItem({
    event,
    isFirst,
    isLast,
    showConnector = true,
    className = ''
}) {
    const config = EVENT_CONFIG[event.event_type] || {
        icon: Circle,
        color: 'slate',
        bgColor: 'bg-slate-100',
        iconColor: 'text-slate-600'
    };

    const Icon = config.icon;
    const isMilestone = event.is_milestone;

    const formatTime = (isoDate) => {
        const d = new Date(isoDate);
        return d.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    };

    return (
        <div className={`flex gap-3 ${className}`}>
            {/* Connector and Icon */}
            <div className="flex flex-col items-center">
                {/* Top connector line */}
                {showConnector && !isFirst && (
                    <div className="w-0.5 h-3 bg-purple-200" />
                )}
                {showConnector && isFirst && (
                    <div className="w-0.5 h-3 bg-transparent" />
                )}

                {/* Event icon */}
                <div
                    className={`
            flex items-center justify-center rounded-full flex-shrink-0
            ${isMilestone
                            ? `w-8 h-8 ${config.bgColor} ring-2 ring-purple-200 ring-offset-2`
                            : `w-6 h-6 ${config.bgColor}`
                        }
          `}
                >
                    <Icon className={`${isMilestone ? 'w-4 h-4' : 'w-3.5 h-3.5'} ${config.iconColor}`} />
                </div>

                {/* Bottom connector line */}
                {showConnector && !isLast && (
                    <div className="w-0.5 flex-1 min-h-[12px] bg-purple-200" />
                )}
            </div>

            {/* Content */}
            <div className={`flex-1 pb-4 ${isLast ? 'pb-0' : ''}`}>
                <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                        <p className={`text-sm ${isMilestone ? 'font-semibold text-slate-900' : 'font-medium text-slate-700'}`}>
                            {event.label}
                        </p>
                        {event.description && (
                            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                                {event.description}
                            </p>
                        )}
                    </div>
                    <span className="text-xs text-slate-400 font-medium tabular-nums flex-shrink-0">
                        {formatTime(event.timestamp)}
                    </span>
                </div>
            </div>
        </div>
    );
}

export { EVENT_CONFIG };
