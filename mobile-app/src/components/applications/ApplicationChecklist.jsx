import { CheckCircle, Circle, Clock, FileText, Briefcase, Link, Users, ClipboardList, Calendar } from 'lucide-react';

/**
 * Generates a dynamic checklist based on application and opportunity requirements
 * @param {Object} application
 * @param {Object} [userProfile]
 * @returns {Array} Checklist items
 */
const generateChecklist = (application, userProfile = {}) => {
    const { opportunity, events = [], resume_id, transcript_id, cover_letter_id, answers } = application;
    const opp = opportunity || {};

    // Base checklist items
    const items = [
        {
            key: 'profile',
            icon: Circle,
            label: 'Profile submitted',
            description: 'Your basic information has been shared',
            status: 'complete', // Always complete if application exists
            priority: 1
        },
        {
            key: 'resume',
            icon: FileText,
            label: 'Resume uploaded',
            description: resume_id ? 'Your resume is attached' : 'Resume required for this application',
            status: resume_id ? 'complete' : 'pending',
            priority: 2
        }
    ];

    // Add transcript if required
    if (opp.requires_transcript || transcript_id) {
        items.push({
            key: 'transcript',
            icon: FileText,
            label: 'Transcript uploaded',
            description: transcript_id ? 'Academic transcript attached' : 'Transcript required',
            status: transcript_id ? 'complete' : 'pending',
            priority: 3
        });
    }

    // Add cover letter if required or provided
    if (opp.requires_cover_letter || cover_letter_id) {
        items.push({
            key: 'cover_letter',
            icon: FileText,
            label: 'Cover letter',
            description: cover_letter_id ? 'Cover letter attached' : 'Cover letter recommended',
            status: cover_letter_id ? 'complete' : 'optional',
            priority: 4
        });
    }

    // Add screening questions if applicable
    if (answers && answers.length > 0) {
        items.push({
            key: 'questions',
            icon: ClipboardList,
            label: 'Screening questions',
            description: `${answers.length} question${answers.length > 1 ? 's' : ''} answered`,
            status: 'complete',
            priority: 5
        });
    }

    // Add portfolio if required
    if (opp.requires_portfolio) {
        const hasPortfolio = userProfile?.portfolio_url;
        items.push({
            key: 'portfolio',
            icon: Link,
            label: 'Portfolio',
            description: hasPortfolio ? 'Portfolio linked' : 'Portfolio link recommended',
            status: hasPortfolio ? 'complete' : 'pending',
            priority: 6
        });
    }

    // Check for assessment requirement from events
    const hasAssessment = events.some(e => e.event_type === 'assessment_requested');
    const assessmentComplete = events.some(e => e.event_type === 'assessment_completed');
    if (hasAssessment || opp.requires_assessment) {
        items.push({
            key: 'assessment',
            icon: ClipboardList,
            label: 'Assessment',
            description: assessmentComplete ? 'Completed' : 'Assessment required by employer',
            status: assessmentComplete ? 'complete' : 'pending',
            priority: 7
        });
    }

    // Check for interview scheduling
    const hasInterviewRequest = events.some(e => e.event_type === 'interview_scheduled');
    const interviewComplete = events.some(e => e.event_type === 'interview_completed');
    if (hasInterviewRequest) {
        items.push({
            key: 'interview',
            icon: Calendar,
            label: 'Interview',
            description: interviewComplete ? 'Interview completed' : 'Interview scheduled',
            status: interviewComplete ? 'complete' : 'pending',
            priority: 8
        });
    }

    // Check for references
    const hasReferencesRequest = events.some(e => e.event_type === 'references_requested');
    const referencesSubmitted = events.some(e => e.event_type === 'references_submitted');
    if (hasReferencesRequest) {
        items.push({
            key: 'references',
            icon: Users,
            label: 'References',
            description: referencesSubmitted ? 'References provided' : 'References requested by employer',
            status: referencesSubmitted ? 'complete' : 'pending',
            priority: 9
        });
    }

    // Sort by priority
    return items.sort((a, b) => a.priority - b.priority);
};

/**
 * ApplicationChecklist - Dynamic checklist of application requirements
 * @param {Object} props
 * @param {Object} props.application - Application object
 * @param {Object} [props.userProfile] - User profile for additional context
 * @param {string} [props.className] - Additional CSS classes
 */
export default function ApplicationChecklist({ application, userProfile, className = '' }) {
    if (!application) return null;

    const checklist = generateChecklist(application, userProfile);

    const getStatusStyle = (status) => {
        switch (status) {
            case 'complete':
                return {
                    iconBg: 'bg-emerald-100',
                    iconColor: 'text-emerald-600',
                    textColor: 'text-slate-900',
                    badge: null
                };
            case 'pending':
                return {
                    iconBg: 'bg-amber-100',
                    iconColor: 'text-amber-600',
                    textColor: 'text-amber-900',
                    badge: { text: 'Pending', bg: 'bg-amber-100', color: 'text-amber-700' }
                };
            case 'optional':
                return {
                    iconBg: 'bg-slate-100',
                    iconColor: 'text-slate-400',
                    textColor: 'text-slate-600',
                    badge: { text: 'Optional', bg: 'bg-slate-100', color: 'text-slate-500' }
                };
            default:
                return {
                    iconBg: 'bg-slate-100',
                    iconColor: 'text-slate-400',
                    textColor: 'text-slate-600',
                    badge: null
                };
        }
    };

    const completedCount = checklist.filter(item => item.status === 'complete').length;
    const pendingCount = checklist.filter(item => item.status === 'pending').length;
    const totalRequired = checklist.filter(item => item.status !== 'optional').length;
    const progress = totalRequired > 0 ? Math.round((completedCount / totalRequired) * 100) : 100;

    return (
        <div className={`bg-white rounded-2xl border border-slate-100 overflow-hidden ${className}`}>
            {/* Header with progress */}
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
                <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-slate-700">Application Checklist</h4>
                    <span className="text-xs font-medium text-slate-500">
                        {completedCount}/{totalRequired} complete
                    </span>
                </div>

                {/* Progress bar */}
                <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-500 ${progress === 100 ? 'bg-emerald-500' : 'bg-purple-500'
                            }`}
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {pendingCount > 0 && (
                    <p className="text-xs text-amber-600 mt-2 font-medium">
                        ⚠️ {pendingCount} item{pendingCount > 1 ? 's' : ''} need{pendingCount === 1 ? 's' : ''} your attention
                    </p>
                )}
            </div>

            {/* Checklist items */}
            <div className="divide-y divide-slate-50">
                {checklist.map((item) => {
                    const style = getStatusStyle(item.status);
                    const Icon = item.status === 'complete' ? CheckCircle : item.icon;

                    return (
                        <div
                            key={item.key}
                            className={`flex items-start gap-3 px-4 py-3 ${item.status === 'pending' ? 'bg-amber-50/50' : ''
                                }`}
                        >
                            {/* Status icon */}
                            <div className={`p-1.5 rounded-lg mt-0.5 ${style.iconBg}`}>
                                <Icon className={`w-4 h-4 ${style.iconColor}`} />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className={`text-sm font-medium ${style.textColor}`}>
                                        {item.label}
                                    </span>
                                    {style.badge && (
                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${style.badge.bg} ${style.badge.color}`}>
                                            {style.badge.text}
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    {item.description}
                                </p>
                            </div>

                            {/* Checkmark for complete items */}
                            {item.status === 'complete' && (
                                <span className="text-emerald-500 text-sm">✓</span>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* All complete message */}
            {pendingCount === 0 && (
                <div className="px-4 py-3 bg-emerald-50 border-t border-emerald-100">
                    <p className="text-sm text-emerald-700 font-medium flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        All required items submitted!
                    </p>
                </div>
            )}
        </div>
    );
}
