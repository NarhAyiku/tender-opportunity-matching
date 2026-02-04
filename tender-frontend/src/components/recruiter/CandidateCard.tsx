import { Candidate } from '../../types/recruiter';
import { Button } from '../common/Button';
import { Check, X, Mail, ExternalLink } from 'lucide-react';


interface CandidateCardProps {
    candidate: Candidate;
    onApprove: (id: string) => void;
    onReject: (id: string) => void;
    onMessage: (id: string) => void;
}

/**
 * CandidateCard component displays candidate information with quick actions
 */
export function CandidateCard({
    candidate,
    onApprove,
    onReject,
    onMessage,
}: CandidateCardProps) {
    const getFitScoreColor = (score: number): string => {
        if (score >= 85) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
        if (score >= 70) return 'bg-blue-100 text-blue-700 border-blue-200';
        return 'bg-gray-100 text-gray-700 border-gray-200';
    };

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffHours < 1) return 'Just now';
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
            {/* Header with Avatar and Name */}
            <div className="flex items-start gap-3 mb-3">
                {candidate.avatar ? (
                    <img
                        src={candidate.avatar}
                        alt={candidate.name}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-100"
                    />
                ) : (
                    <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center ring-2 ring-gray-100">
                        <span className="text-lg font-bold text-primary-700">
                            {candidate.name[0]}
                        </span>
                    </div>
                )}
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{candidate.name}</h3>
                    <p className="text-sm text-gray-500 truncate">{candidate.email}</p>
                </div>
                <div className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getFitScoreColor(candidate.fitScore)}`}>
                    {candidate.fitScore}% Fit
                </div>
            </div>

            {/* Opportunity Title */}
            <div className="mb-3">
                <p className="text-sm text-gray-600 line-clamp-1">{candidate.opportunityTitle}</p>
            </div>

            {/* Skills Tags */}
            <div className="flex flex-wrap gap-1.5 mb-3">
                {candidate.skills.slice(0, 4).map((skill, index) => (
                    <span
                        key={index}
                        className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-medium"
                    >
                        {skill}
                    </span>
                ))}
                {candidate.skills.length > 4 && (
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-xs">
                        +{candidate.skills.length - 4}
                    </span>
                )}
            </div>

            {/* Cover Letter Excerpt */}
            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                {candidate.coverExcerpt}
            </p>

            {/* Metadata */}
            <div className="flex items-center gap-2 mb-3 text-xs text-gray-500">
                <span>{formatDate(candidate.appliedAt)}</span>
                <span>•</span>
                <span>{candidate.source}</span>
                {candidate.atsSynced && (
                    <>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-emerald-600">
                            <ExternalLink size={12} />
                            Synced
                        </span>
                    </>
                )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
                <Button
                    onClick={() => onReject(candidate.id)}
                    variant="outline"
                    size="sm"
                    className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                    aria-label="Reject candidate"
                >
                    <X size={16} />
                    Reject
                </Button>
                <Button
                    onClick={() => onMessage(candidate.id)}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    aria-label="Message candidate"
                >
                    <Mail size={16} />
                    Message
                </Button>
                <Button
                    onClick={() => onApprove(candidate.id)}
                    variant="primary"
                    size="sm"
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                    aria-label="Approve candidate"
                >
                    <Check size={16} />
                    Approve
                </Button>
            </div>
        </div>
    );
}
