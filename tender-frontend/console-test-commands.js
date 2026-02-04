/**
 * Browser Console Test Helper for Recruiter Dashboard
 * 
 * Open browser console on /recruiter page and run these commands:
 */

// 1. Get current store state
console.log('Recruiter Store State:', window.useRecruiterStore?.getState());

// 2. Test filter by name
window.useRecruiterStore?.getState().setFilters({ search: 'Sarah' });
console.log('Filtered by "Sarah":', window.useRecruiterStore?.getState().getFilteredCandidates());

// 3. Test filter by fit score
window.useRecruiterStore?.getState().setFilters({ minFitScore: 90 });
console.log('Filtered by fit ≥90%:', window.useRecruiterStore?.getState().getFilteredCandidates());

// 4. Test filter by source
window.useRecruiterStore?.getState().setFilters({ source: 'QualityMatch' });
console.log('Filtered by QualityMatch:', window.useRecruiterStore?.getState().getFilteredCandidates());

// 5. Clear all filters
window.useRecruiterStore?.getState().setFilters({});
console.log('All candidates:', window.useRecruiterStore?.getState().candidates);

// 6. Test status update
const firstCandidateId = window.useRecruiterStore?.getState().candidates[0]?.id;
if (firstCandidateId) {
    window.useRecruiterStore?.getState().updateCandidateStatus(firstCandidateId, 'interview');
    console.log('Updated candidate to interview:', window.useRecruiterStore?.getState().candidates.find(c => c.id === firstCandidateId));
}

// 7. Get candidates by status
console.log('New candidates:', window.useRecruiterStore?.getState().getCandidatesByStatus('new'));
console.log('Interview candidates:', window.useRecruiterStore?.getState().getCandidatesByStatus('interview'));

// Export store to window for testing
if (typeof window !== 'undefined') {
    // @ts-ignore
    window.useRecruiterStore = require('./stores/recruiterStore').useRecruiterStore;
}
