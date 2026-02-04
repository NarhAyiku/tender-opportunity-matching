import { Candidate, CandidateStatus } from '../../types/recruiter';
import { CandidateCard } from './CandidateCard';

interface PipelineColumnProps {
    title: string;
    status: CandidateStatus;
    candidates: Candidate[];
    onApprove: (id: string) => void;
    onReject: (id: string) => void;
    onMessage: (id: string) => void;
}

/**
 * PipelineColumn displays a column in the Kanban board
 */
export function PipelineColumn({
    title,
    status,
    candidates,
    onApprove,
    onReject,
    onMessage,
}: PipelineColumnProps) {
    const getColumnColor = (status: CandidateStatus): string => {
        switch (status) {
            case 'new':
                return 'bg-blue-50 border-blue-200';
            case 'reviewed':
                return 'bg-purple-50 border-purple-200';
            case 'interview':
                return 'bg-amber-50 border-amber-200';
            case 'offer':
                return 'bg-emerald-50 border-emerald-200';
            case 'rejected':
                return 'bg-gray-50 border-gray-200';
            default:
                return 'bg-gray-50 border-gray-200';
        }
    };

    return (
        <div className="flex flex-col min-w-[320px] max-w-[380px]">
            {/* Column Header */}
            <div className={`rounded-t-xl border-2 ${getColumnColor(status)} px-4 py-3`}>
                <div className="flex items-center justify-between">
                    <h3 className="font-bold text-gray-900">{title}</h3>
                    <span className="px-2.5 py-1 bg-white rounded-full text-sm font-bold text-gray-700">
                        {candidates.length}
                    </span>
                </div>
            </div>

            {/* Cards Container */}
            <div className="flex-1 bg-gray-50 border-x-2 border-b-2 border-gray-200 rounded-b-xl p-3 space-y-3 overflow-y-auto max-h-[calc(100vh-300px)]">
                {candidates.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                        <p className="text-sm">No candidates</p>
                    </div>
                ) : (
                    candidates.map(candidate => (
                        <CandidateCard
                            key={candidate.id}
                            candidate={candidate}
                            onApprove={onApprove}
                            onReject={onReject}
                            onMessage={onMessage}
                        />
                    ))
                )}
            </div>
        </div>
    );
}
