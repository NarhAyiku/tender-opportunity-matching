import { useEffect } from 'react';
import { useRecruiterStore } from '../stores/recruiterStore';
import { Candidate, CandidateStatus } from '../types/recruiter';
import { MetricsCards } from '../components/recruiter/MetricsCards';
import { FiltersBar } from '../components/recruiter/FiltersBar';
import { PipelineColumn } from '../components/recruiter/PipelineColumn';
import { Spinner } from '../components/common/Spinner';
import { AppLayout } from '../components/layout';


/**
 * RecruiterDashboard - Main dashboard for recruiters
 * Features: Kanban pipeline, metrics, filters, candidate management
 */
export function RecruiterDashboard() {
    const {
        candidates,
        metrics,
        isLoading,
        error,
        fetchCandidates,
        updateCandidateStatus,
        setFilters,
        getCandidatesByStatus,
    } = useRecruiterStore();

    useEffect(() => {
        fetchCandidates();
    }, [fetchCandidates]);

    const handleApprove = (candidateId: string) => {
        const candidate = candidates.find((c: Candidate) => c.id === candidateId);
        if (!candidate) return;

        // Move to next status
        const statusFlow: Record<CandidateStatus, CandidateStatus> = {
            new: 'reviewed',
            reviewed: 'interview',
            interview: 'offer',
            offer: 'offer', // Stay at offer
            rejected: 'rejected', // Stay at rejected
        };

        const nextStatus = statusFlow[candidate.status];
        updateCandidateStatus(candidateId, nextStatus);
        console.log(`Approved candidate ${candidateId}, moved to ${nextStatus}`);
    };

    const handleReject = (candidateId: string) => {
        updateCandidateStatus(candidateId, 'rejected');
        console.log(`Rejected candidate ${candidateId}`);
    };

    const handleMessage = (candidateId: string) => {
        const candidate = candidates.find((c: Candidate) => c.id === candidateId);
        if (candidate) {
            // TODO: Open email composer or messaging modal
            console.log(`Opening message composer for ${candidate.name} (${candidate.email})`);
            window.open(`mailto:${candidate.email}?subject=Regarding your application`, '_blank');
        }
    };

    const pipelineColumns: Array<{ title: string; status: CandidateStatus }> = [
        { title: 'New', status: 'new' },
        { title: 'Reviewed', status: 'reviewed' },
        { title: 'Interview', status: 'interview' },
        { title: 'Offer', status: 'offer' },
        { title: 'Rejected', status: 'rejected' },
    ];

    if (isLoading && candidates.length === 0) {
        return (
            <AppLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <Spinner size="lg" />
                </div>
            </AppLayout>
        );
    }

    if (error) {
        return (
            <AppLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <p className="text-red-500 font-semibold mb-2">Error loading candidates</p>
                        <p className="text-gray-500 text-sm">{error}</p>
                        <button
                            onClick={() => fetchCandidates()}
                            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="max-w-[1800px] mx-auto p-4 lg:p-6">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Recruiter Dashboard</h1>
                    <p className="text-gray-600">Manage your candidate pipeline and hiring process</p>
                </div>

                {/* Metrics */}
                <MetricsCards metrics={metrics} />

                {/* Filters */}
                <FiltersBar onFiltersChange={setFilters} />

                {/* Pipeline - Kanban Columns */}
                <div className="overflow-x-auto pb-4">
                    <div className="flex gap-4 min-w-max">
                        {pipelineColumns.map(({ title, status }) => (
                            <PipelineColumn
                                key={status}
                                title={title}
                                status={status}
                                candidates={getCandidatesByStatus(status)}
                                onApprove={handleApprove}
                                onReject={handleReject}
                                onMessage={handleMessage}
                            />
                        ))}
                    </div>
                </div>

                {/* Empty State */}
                {candidates.length === 0 && !isLoading && (
                    <div className="text-center py-12">
                        <p className="text-gray-400 text-lg">No candidates yet</p>
                        <p className="text-gray-500 text-sm mt-2">
                            New applications will appear here automatically
                        </p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
