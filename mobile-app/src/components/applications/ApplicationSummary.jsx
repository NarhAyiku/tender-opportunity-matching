import { Info, CheckCircle, Eye, AlertCircle, Calendar, Clock, XCircle, Gift, Sparkles } from 'lucide-react';

/**
 * Generates a dynamic, human-readable application summary
 * @param {Object} application - Application object with status and events
 * @returns {{ text: string, subtext: string, icon: any, color: string }}
 */
const generateSummary = (application) => {
    const { status, events = [], opportunity } = application;
    const companyName = opportunity?.company_name || 'the employer';

    // Find key events
    const viewedEvent = events.find(e => e.event_type === 'viewed_by_employer');
    const interviewEvent = events.find(e => e.event_type === 'interview_scheduled');
    const submittedEvent = events.find(e => e.event_type === 'submitted');
    const infoRequestedEvent = events.find(e => e.event_type === 'info_requested');

    // Calculate days since submission
    const daysSinceSubmission = submittedEvent
        ? Math.floor((Date.now() - new Date(submittedEvent.timestamp).getTime()) / (1000 * 60 * 60 * 24))
        : 0;

    switch (status) {
        case 'submitted':
            if (viewedEvent) {
                return {
                    text: `${companyName} has viewed your application`,
                    subtext: 'Your profile is under consideration. Stay tuned for updates.',
                    icon: Eye,
                    color: 'blue'
                };
            }
            if (daysSinceSubmission > 7) {
                return {
                    text: 'Your application is with the employer',
                    subtext: `Submitted ${daysSinceSubmission} days ago. Most employers respond within 2-3 weeks.`,
                    icon: Clock,
                    color: 'amber'
                };
            }
            return {
                text: 'Your application has been submitted',
                subtext: 'Pending employer review. You\'ll be notified of any updates.',
                icon: CheckCircle,
                color: 'green'
            };

        case 'in_progress':
            if (infoRequestedEvent) {
                return {
                    text: `${companyName} requested additional information`,
                    subtext: 'Please review and submit the requested details.',
                    icon: AlertCircle,
                    color: 'amber'
                };
            }
            return {
                text: 'Your application is being reviewed',
                subtext: `${companyName} is actively considering your profile.`,
                icon: Eye,
                color: 'blue'
            };

        case 'interview':
            const interviewDate = interviewEvent?.metadata?.interview_date;
            const formattedDate = interviewDate
                ? new Date(interviewDate).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
                : 'soon';
            return {
                text: 'You have an interview scheduled!',
                subtext: `Interview with ${companyName} on ${formattedDate}.`,
                icon: Calendar,
                color: 'purple'
            };

        case 'offer':
            return {
                text: 'Congratulations! You received an offer!',
                subtext: `${companyName} wants to move forward with you. Review the details below.`,
                icon: Gift,
                color: 'emerald'
            };

        case 'rejected':
            return {
                text: 'Application not selected',
                subtext: `${companyName} has decided to proceed with other candidates. Keep applying!`,
                icon: XCircle,
                color: 'red'
            };

        case 'withdrawn':
            return {
                text: 'You withdrew this application',
                subtext: 'This application is no longer active.',
                icon: XCircle,
                color: 'slate'
            };

        case 'draft':
            return {
                text: 'Application draft saved',
                subtext: 'Complete and submit your application to be considered.',
                icon: Info,
                color: 'slate'
            };

        default:
            return {
                text: 'Application status unknown',
                subtext: 'We\'ll update you when more information is available.',
                icon: Info,
                color: 'slate'
            };
    }
};

/**
 * Color configurations for summary cards
 */
const colorConfig = {
    green: {
        bg: 'bg-gradient-to-r from-emerald-50 to-green-50',
        border: 'border-emerald-200',
        iconBg: 'bg-emerald-100',
        iconColor: 'text-emerald-600',
        textColor: 'text-emerald-900',
        subtextColor: 'text-emerald-700'
    },
    blue: {
        bg: 'bg-gradient-to-r from-blue-50 to-cyan-50',
        border: 'border-blue-200',
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-600',
        textColor: 'text-blue-900',
        subtextColor: 'text-blue-700'
    },
    purple: {
        bg: 'bg-gradient-to-r from-purple-50 to-violet-50',
        border: 'border-purple-200',
        iconBg: 'bg-purple-100',
        iconColor: 'text-purple-600',
        textColor: 'text-purple-900',
        subtextColor: 'text-purple-700'
    },
    amber: {
        bg: 'bg-gradient-to-r from-amber-50 to-yellow-50',
        border: 'border-amber-200',
        iconBg: 'bg-amber-100',
        iconColor: 'text-amber-600',
        textColor: 'text-amber-900',
        subtextColor: 'text-amber-700'
    },
    red: {
        bg: 'bg-gradient-to-r from-red-50 to-rose-50',
        border: 'border-red-200',
        iconBg: 'bg-red-100',
        iconColor: 'text-red-600',
        textColor: 'text-red-900',
        subtextColor: 'text-red-700'
    },
    emerald: {
        bg: 'bg-gradient-to-r from-emerald-50 to-teal-50',
        border: 'border-emerald-200',
        iconBg: 'bg-emerald-100',
        iconColor: 'text-emerald-600',
        textColor: 'text-emerald-900',
        subtextColor: 'text-emerald-700'
    },
    slate: {
        bg: 'bg-gradient-to-r from-slate-50 to-gray-50',
        border: 'border-slate-200',
        iconBg: 'bg-slate-100',
        iconColor: 'text-slate-600',
        textColor: 'text-slate-900',
        subtextColor: 'text-slate-600'
    }
};

/**
 * ApplicationSummary - Dynamic human-readable application status summary
 * @param {Object} props
 * @param {Object} props.application - Application object
 * @param {string} [props.className] - Additional CSS classes
 */
export default function ApplicationSummary({ application, className = '' }) {
    if (!application) return null;

    const summary = generateSummary(application);
    const colors = colorConfig[summary.color] || colorConfig.slate;
    const Icon = summary.icon;

    return (
        <div
            className={`
                rounded-2xl p-4 border
                ${colors.bg} ${colors.border}
                ${className}
            `}
        >
            <div className="flex items-start gap-3">
                {/* Icon */}
                <div className={`p-2 rounded-xl ${colors.iconBg} flex-shrink-0`}>
                    <Icon className={`w-5 h-5 ${colors.iconColor}`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <p className={`font-semibold leading-tight ${colors.textColor}`}>
                        {summary.text}
                    </p>
                    <p className={`text-sm mt-1 leading-relaxed ${colors.subtextColor}`}>
                        {summary.subtext}
                    </p>
                </div>

                {/* Optional AI sparkle indicator */}
                <div className="flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-purple-300" />
                </div>
            </div>
        </div>
    );
}
