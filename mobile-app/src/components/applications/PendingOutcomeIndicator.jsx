import { CheckCircle, Clock, Eye, MessageSquare, Calendar, HelpCircle, XCircle, Gift } from 'lucide-react';

/**
 * Stage definitions for application pipeline
 */
const STAGES = [
    { key: 'submitted', label: 'Submitted', icon: CheckCircle, completedColor: 'text-green-500', bgColor: 'bg-green-500' },
    { key: 'under_review', label: 'Under Review', icon: Clock, completedColor: 'text-blue-500', bgColor: 'bg-blue-500' },
    { key: 'viewed', label: 'Viewed', icon: Eye, completedColor: 'text-purple-500', bgColor: 'bg-purple-500' },
    { key: 'interview', label: 'Interview', icon: Calendar, completedColor: 'text-indigo-500', bgColor: 'bg-indigo-500' },
    { key: 'decision', label: 'Decision', icon: HelpCircle, completedColor: 'text-amber-500', bgColor: 'bg-amber-500' },
];

/**
 * Determines which stages are complete based on application state
 * @param {Object} application
 * @returns {Object} Map of stage key to completion status
 */
const getStageCompletion = (application) => {
    const { status, events = [] } = application;
    const hasViewed = events.some(e => e.event_type === 'viewed_by_employer');
    const hasInterview = events.some(e => e.event_type === 'interview_scheduled' || e.event_type === 'interview_completed');

    const stages = {
        submitted: ['submitted', 'in_progress', 'interview', 'offer', 'rejected'].includes(status),
        under_review: ['in_progress', 'interview', 'offer', 'rejected'].includes(status) || hasViewed,
        viewed: hasViewed,
        interview: hasInterview || status === 'interview' || status === 'offer',
        decision: ['offer', 'rejected'].includes(status),
    };

    return stages;
};

/**
 * Gets the current active stage
 * @param {Object} application
 * @returns {string} Current stage key
 */
const getCurrentStage = (application) => {
    const { status, events = [] } = application;
    const hasViewed = events.some(e => e.event_type === 'viewed_by_employer');

    if (status === 'offer' || status === 'rejected') return 'decision';
    if (status === 'interview') return 'interview';
    if (hasViewed) return 'viewed';
    if (status === 'in_progress') return 'under_review';
    return 'submitted';
};

/**
 * PendingOutcomeIndicator - Visual pipeline showing application progress
 * @param {Object} props
 * @param {Object} props.application - Application object
 * @param {'compact' | 'full'} [props.variant='full'] - Display variant
 * @param {string} [props.className] - Additional CSS classes
 */
export default function PendingOutcomeIndicator({
    application,
    variant = 'full',
    className = ''
}) {
    if (!application) return null;

    const completion = getStageCompletion(application);
    const currentStage = getCurrentStage(application);
    const { status } = application;

    // For rejected/offer, show final outcome
    const isFinal = status === 'offer' || status === 'rejected';
    const isRejected = status === 'rejected';
    const isOffer = status === 'offer';

    if (variant === 'compact') {
        // Compact: Just show current stage badge
        const current = STAGES.find(s => s.key === currentStage) || STAGES[0];
        const Icon = current.icon;

        return (
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${isRejected ? 'bg-red-100 text-red-700' : isOffer ? 'bg-emerald-100 text-emerald-700' : 'bg-purple-100 text-purple-700'} ${className}`}>
                <Icon className="w-3.5 h-3.5" />
                <span>{isRejected ? 'Not Selected' : isOffer ? 'Offer Received' : current.label}</span>
            </div>
        );
    }

    // Full: Show all stages with progress
    return (
        <div className={`bg-white rounded-2xl border border-slate-100 p-4 ${className}`}>
            <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-slate-700">Application Progress</h4>
                {isFinal && (
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isRejected ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {isRejected ? 'Closed' : 'Complete'}
                    </span>
                )}
            </div>

            {/* Progress bar */}
            <div className="relative">
                {/* Background track */}
                <div className="absolute top-3 left-0 right-0 h-1 bg-slate-100 rounded-full" />

                {/* Progress fill */}
                <div
                    className={`absolute top-3 left-0 h-1 rounded-full transition-all duration-500 ${isRejected ? 'bg-red-400' : isOffer ? 'bg-emerald-400' : 'bg-purple-400'}`}
                    style={{
                        width: isFinal ? '100%' : `${(STAGES.findIndex(s => s.key === currentStage) / (STAGES.length - 1)) * 100}%`
                    }}
                />

                {/* Stage dots */}
                <div className="relative flex justify-between">
                    {STAGES.map((stage, index) => {
                        const isComplete = completion[stage.key];
                        const isCurrent = stage.key === currentStage;
                        const Icon = stage.icon;

                        return (
                            <div key={stage.key} className="flex flex-col items-center" style={{ width: '56px' }}>
                                {/* Dot */}
                                <div
                                    className={`
                                        w-6 h-6 rounded-full flex items-center justify-center transition-all
                                        ${isComplete
                                            ? isRejected && stage.key === 'decision'
                                                ? 'bg-red-500'
                                                : isOffer && stage.key === 'decision'
                                                    ? 'bg-emerald-500'
                                                    : stage.bgColor
                                            : isCurrent
                                                ? 'bg-purple-100 ring-2 ring-purple-400'
                                                : 'bg-slate-100'
                                        }
                                    `}
                                >
                                    <Icon
                                        className={`w-3.5 h-3.5 ${isComplete
                                            ? 'text-white'
                                            : isCurrent
                                                ? 'text-purple-600'
                                                : 'text-slate-400'
                                            }`}
                                    />
                                </div>

                                {/* Label */}
                                <span
                                    className={`
                                        text-[10px] mt-1.5 text-center leading-tight
                                        ${isCurrent ? 'font-bold text-purple-700' : 'font-medium text-slate-500'}
                                    `}
                                >
                                    {stage.key === 'decision' && isRejected
                                        ? 'Closed'
                                        : stage.key === 'decision' && isOffer
                                            ? 'Offer!'
                                            : stage.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
