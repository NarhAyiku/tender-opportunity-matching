import { CheckCircle, AlertTriangle, XCircle, Clock, CircleDot, Eye, Calendar, Gift, Send, HelpCircle } from 'lucide-react';

/**
 * StatusBadge - Displays application status with color-coded indicator
 * @param {Object} props
 * @param {'draft' | 'submitted' | 'in_progress' | 'viewed' | 'interview' | 'offer' | 'rejected' | 'withdrawn' | 'action_required' | 'pending'} props.status
 * @param {'sm' | 'md'} [props.size='md']
 * @param {string} [props.className]
 */
export default function StatusBadge({ status, size = 'md', className = '' }) {
    const statusConfig = {
        draft: {
            label: 'DRAFT',
            dotClass: 'bg-slate-400',
            bgClass: 'bg-slate-100',
            textClass: 'text-slate-700',
            icon: CircleDot,
        },
        pending: {
            label: 'PENDING',
            dotClass: 'bg-amber-500',
            bgClass: 'bg-amber-100',
            textClass: 'text-amber-700',
            icon: Clock,
        },
        submitted: {
            label: 'SUBMITTED',
            dotClass: 'bg-green-500',
            bgClass: 'bg-green-100',
            textClass: 'text-green-700',
            icon: Send,
        },
        in_progress: {
            label: 'IN REVIEW',
            dotClass: 'bg-blue-500',
            bgClass: 'bg-blue-100',
            textClass: 'text-blue-700',
            icon: Clock,
        },
        viewed: {
            label: 'VIEWED',
            dotClass: 'bg-purple-500',
            bgClass: 'bg-purple-100',
            textClass: 'text-purple-700',
            icon: Eye,
        },
        action_required: {
            label: 'ACTION NEEDED',
            dotClass: 'bg-amber-500',
            bgClass: 'bg-amber-100',
            textClass: 'text-amber-700',
            icon: AlertTriangle,
        },
        interview: {
            label: 'INTERVIEW',
            dotClass: 'bg-indigo-500',
            bgClass: 'bg-indigo-100',
            textClass: 'text-indigo-700',
            icon: Calendar,
        },
        offer: {
            label: 'OFFER',
            dotClass: 'bg-emerald-500',
            bgClass: 'bg-emerald-100',
            textClass: 'text-emerald-700',
            icon: Gift,
        },
        rejected: {
            label: 'CLOSED',
            dotClass: 'bg-red-500',
            bgClass: 'bg-red-100',
            textClass: 'text-red-700',
            icon: XCircle,
        },
        withdrawn: {
            label: 'WITHDRAWN',
            dotClass: 'bg-slate-500',
            bgClass: 'bg-slate-100',
            textClass: 'text-slate-700',
            icon: HelpCircle,
        },
    };

    const config = statusConfig[status] || statusConfig.draft;
    const sizeClasses = size === 'sm'
        ? 'px-2 py-0.5 text-xs gap-1.5'
        : 'px-3 py-1 text-sm gap-2';

    return (
        <div
            className={`
                inline-flex items-center rounded-full font-bold tracking-wide
                ${config.bgClass} ${config.textClass} ${sizeClasses} ${className}
            `}
        >
            <span className={`w-2 h-2 rounded-full ${config.dotClass}`} />
            <span>{config.label}</span>
        </div>
    );
}
