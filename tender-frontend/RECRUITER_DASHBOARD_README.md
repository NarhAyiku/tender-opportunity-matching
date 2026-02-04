# Recruiter Dashboard - Feature Documentation

## Overview
Premium web/desktop-optimized feature for recruiters to manage candidate pipelines in a Kanban-style interface.

## Features Implemented

### 1. **Kanban Pipeline**
- 5 columns: New → Reviewed → Interview → Offer → Rejected
- Drag-and-drop ready (structure in place, DnD library optional)
- Color-coded columns for visual clarity

### 2. **Candidate Cards**
- **Display**: Avatar, name, email, fit score badge, skills tags, cover letter excerpt
- **Metadata**: Applied date, source (QualityMatch/LinkedIn/etc.), ATS sync status
- **Quick Actions**:
  - ✅ **Approve** (green) - Moves candidate to next pipeline stage
  - ❌ **Reject** (red) - Moves to Rejected column
  - 📧 **Message** (blue) - Opens email composer

### 3. **Metrics Summary**
- **New Applications**: Count of candidates in "New" status
- **Average Fit Score**: Calculated from all candidates
- **Conversion Rate**: Mock 20% (ready for real data)
- **Total Candidates**: Total count across all statuses

### 4. **Filters Bar**
- **Search**: Filter by name, email, or skills (real-time)
- **Fit Score**: Filter by minimum fit % (90+, 80+, 70+, All)
- **Source**: Filter by QualityMatch, LinkedIn, Direct, Referral
- **Advanced filters**: Placeholder for future date range, status filters

### 5. **State Management**
- Zustand store with:
  - Candidate fetching (mock API with 500ms delay)
  - Status updates (optimistic UI)
  - Dynamic filtering logic
  - Status-based grouping

## File Structure
```
src/
├── types/
│   └── recruiter.ts              # Candidate, Metrics, Filters types
├── lib/
│   └── mockData.ts               # 10 sample candidates + metrics
├── stores/
│   └── recruiterStore.ts         # Zustand state management
├── components/
│   └── recruiter/
│       ├── CandidateCard.tsx     # Individual candidate card
│       ├── PipelineColumn.tsx    # Kanban column
│       ├── MetricsCards.tsx      # Summary metrics
│       ├── FiltersBar.tsx        # Search & filters
│       └── index.ts              # Exports
├── pages/
│   └── RecruiterDashboard.tsx    # Main dashboard page
└── tests/
    └── recruiterStore.test.ts    # Unit tests for store
```

## Tech Stack
- **React 19** + **TypeScript** (strict mode)
- **Tailwind CSS** for styling
- **Zustand** for state management
- **Lucide React** for icons
- **Vitest** for testing

## Routing
Access the dashboard at: **`/recruiter`** (protected route, requires authentication)

## Testing

### Manual Testing
1. **Start the app**: `npm run dev`
2. **Navigate**: Go to `http://localhost:5173/recruiter`
3. **Test filters**:
   - Search for "Sarah" or "React"
   - Set fit score to "90% and above"
   - Filter by source "QualityMatch"
4. **Test actions**:
   - Click "Approve" on a "New" candidate → should move to "Reviewed"
   - Click "Reject" → should move to "Rejected" column
   - Click "Message" → should open email client
5. **Test responsiveness**: Resize browser window

### Unit Tests
Run tests with:
```bash
npm run test
```

Tests cover:
- Initial state
- Status updates
- Search filtering
- Fit score filtering
- Source filtering
- Status-based grouping

## Future Enhancements (Placeholders)
- [ ] **Real-time updates**: WebSocket integration
- [ ] **Drag-and-drop**: Add `react-beautiful-dnd` or `@dnd-kit/core`
- [ ] **ATS Integration**: Merge.dev sync for Greenhouse/Lever
- [ ] **Date range filters**: Advanced filtering
- [ ] **Messaging modal**: In-app communication
- [ ] **Candidate detail view**: Full profile modal
- [ ] **Bulk actions**: Select multiple candidates
- [ ] **Analytics**: Charts and trends

## Design Decisions
1. **No new dependencies**: Used existing Tailwind, Lucide, Zustand
2. **Mobile-first**: Responsive from 320px to 1800px
3. **Color scheme**: Matches existing Emerald Green theme
4. **Accessibility**: ARIA labels on all interactive elements
5. **Performance**: React.memo on CandidateCard, filtered data memoized

## Code Quality
- ✅ TypeScript strict mode
- ✅ PascalCase components, camelCase variables
- ✅ JSDoc comments on main functions
- ✅ Unit tests with 6 test cases
- ✅ Linted and type-checked

## Known Limitations (MVP)
- Mock data only (no real API integration yet)
- No drag-and-drop (structure ready, lib not added to keep deps minimal)
- No WebSocket real-time updates (polling or manual refresh)
- Email composer uses mailto: (no in-app messaging)
- Date filters UI present but not wired up

## Screenshots
(See running app at `/recruiter`)
