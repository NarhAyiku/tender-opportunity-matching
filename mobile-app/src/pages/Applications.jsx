import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  Briefcase,
  MapPin,
  Clock,
  CheckCircle,
  ExternalLink,
  ChevronRight,
  Filter,
  Sparkles,
  TrendingUp
} from 'lucide-react';
import Card from '../components/ui/Card';
import Skeleton from '../components/ui/Skeleton';
import Toast from '../components/ui/Toast';
import CompanyLogo from '../components/ui/CompanyLogo';
import { PendingOutcomeIndicator } from '../components/applications';
import { getAllMockApplications } from '../data/mockApplications';

/**
 * Applications - Enhanced applications list with clear status and guidance
 */
export default function Applications() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [toast, setToast] = useState(null);

  // Use mock data for demo, real data from Supabase
  const [useMockData, setUseMockData] = useState(true);

  useEffect(() => {
    loadApplications();
  }, [user, useMockData]);

  const loadApplications = async () => {
    if (!user && !useMockData) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (useMockData) {
        // Use enhanced mock data
        const mockApps = getAllMockApplications();
        setApplications(mockApps);
      } else {
        // Real Supabase query
        const { data, error: fetchError } = await supabase
          .from('swipes')
          .select(`
                        id,
                        created_at,
                        action,
                        opportunity:opportunities (
                            id,
                            title,
                            company_name,
                            company_logo,
                            location,
                            opportunity_type,
                            work_arrangement,
                            salary_min,
                            salary_max,
                            salary_currency
                        )
                    `)
          .eq('user_id', user.id)
          .in('action', ['applied', 'interested'])
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;

        const mapped = (data || [])
          .filter((s) => s.opportunity)
          .map((s) => ({
            id: s.id,
            applied_at: s.created_at,
            status: 'submitted',
            opportunity: s.opportunity,
            events: []
          }));

        setApplications(mapped);
      }
    } catch (err) {
      if (err.name === 'AbortError' || err.message?.includes('AbortError')) return;
      console.error('Applications load error:', err);
      setError(err.message || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  // Filter applications
  const filtered = applications.filter((app) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      (app.opportunity?.title || '').toLowerCase().includes(q) ||
      (app.opportunity?.company_name || '').toLowerCase().includes(q);

    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Group by status for summary
  const statusCounts = applications.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {});

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getStatusLabel = (status) => {
    const labels = {
      submitted: 'Submitted',
      in_progress: 'In Review',
      interview: 'Interview',
      offer: 'Offer!',
      rejected: 'Closed',
      withdrawn: 'Withdrawn',
      draft: 'Draft'
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col bg-[var(--color-bg)]">
        <div className="bg-white border-b border-slate-100 px-4 py-3">
          <Skeleton className="h-7 w-48" />
        </div>
        <div className="p-4 space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-4 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
              <Skeleton className="h-8 w-full rounded-lg" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[var(--color-bg)] min-h-screen pb-24">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-10">
        <div className="px-4 py-4">
          {/* Title and greeting */}
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-slate-900">
              Your Applications
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {applications.length === 0
                ? "You haven't applied to any opportunities yet"
                : `Tracking ${applications.length} application${applications.length !== 1 ? 's' : ''}`
              }
            </p>
          </div>

          {/* Stats row */}
          {applications.length > 0 && (
            <div className="flex gap-2 mb-4 overflow-x-auto pb-1 -mx-1 px-1">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${statusFilter === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
              >
                All ({applications.length})
              </button>
              {statusCounts.submitted && (
                <button
                  onClick={() => setStatusFilter('submitted')}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${statusFilter === 'submitted'
                    ? 'bg-green-600 text-white'
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                >
                  Submitted ({statusCounts.submitted})
                </button>
              )}
              {statusCounts.in_progress && (
                <button
                  onClick={() => setStatusFilter('in_progress')}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${statusFilter === 'in_progress'
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    }`}
                >
                  In Review ({statusCounts.in_progress})
                </button>
              )}
              {statusCounts.interview && (
                <button
                  onClick={() => setStatusFilter('interview')}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${statusFilter === 'interview'
                    ? 'bg-purple-600 text-white'
                    : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                    }`}
                >
                  Interview ({statusCounts.interview})
                </button>
              )}
              {statusCounts.offer && (
                <button
                  onClick={() => setStatusFilter('offer')}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${statusFilter === 'offer'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                    }`}
                >
                  Offers ({statusCounts.offer})
                </button>
              )}
            </div>
          )}

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by role or company..."
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 border border-slate-100 placeholder:text-slate-400"
            />
          </div>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex justify-between items-center">
          <span>{error}</span>
          <button onClick={loadApplications} className="font-semibold hover:underline">
            Retry
          </button>
        </div>
      )}

      {/* Application cards */}
      <div className="flex-1 p-4 space-y-3">
        {filtered.length > 0 ? (
          filtered.map((app) => (
            <button
              key={app.id}
              onClick={() => navigate(`/application/${app.id}`)}
              className="w-full bg-white rounded-2xl p-4 border border-slate-100 hover:border-purple-200 hover:shadow-md transition-all text-left group"
            >
              {/* Header: Logo + Title + Date */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  <CompanyLogo
                    logoUrl={app.opportunity?.company_logo}
                    companyName={app.opportunity?.company_name || 'Company'}
                    size="lg"
                  />
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-900 leading-tight line-clamp-2">
                      {app.opportunity?.title}
                    </h3>
                    <p className="text-sm text-slate-500 mt-0.5">
                      {app.opportunity?.company_name}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-slate-400 font-medium whitespace-nowrap ml-2">
                  {formatDate(app.applied_at)}
                </span>
              </div>

              {/* Status indicator */}
              <div className="flex items-center justify-between">
                <PendingOutcomeIndicator application={app} variant="compact" />

                <div className="flex items-center gap-2">
                  {/* Show if employer has viewed */}
                  {app.events?.some(e => e.event_type === 'viewed_by_employer') && (
                    <span className="text-xs text-blue-600 font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      Viewed
                    </span>
                  )}
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-purple-500 transition-colors" />
                </div>
              </div>

              {/* Location & type */}
              {(app.opportunity?.location || app.opportunity?.opportunity_type) && (
                <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-50">
                  {app.opportunity?.location && (
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {app.opportunity.location}
                    </span>
                  )}
                  {app.opportunity?.opportunity_type && (
                    <span className="text-xs text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full capitalize">
                      {app.opportunity.opportunity_type}
                    </span>
                  )}
                </div>
              )}
            </button>
          ))
        ) : applications.length > 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500 text-sm">
              No applications found matching "{searchQuery}"
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
              }}
              className="mt-2 text-purple-600 font-medium text-sm hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-2xl flex items-center justify-center mb-6">
              <Briefcase className="w-10 h-10 text-purple-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              No applications yet
            </h3>
            <p className="text-sm text-slate-500 max-w-xs mx-auto mb-6 leading-relaxed">
              When you swipe right on opportunities you're interested in, they'll appear here so you can track your progress.
            </p>
            <button
              onClick={() => navigate('/feed')}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-full shadow-lg shadow-purple-200 hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Discover Opportunities
            </button>
          </div>
        )}
      </div>

      <Toast message={toast} onClose={() => setToast(null)} />
    </div>
  );
}
