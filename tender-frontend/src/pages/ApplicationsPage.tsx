import { useEffect, useState } from 'react';
import { AppLayout } from '../components/layout';
import {
  Building2,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  MessageSquare,
  FileText,
  Send,
  Eye,
  Gift,
  Search,
  Sparkles,
  MapPin,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { applicationsApi, swipesApi } from '../api';
import { Application, Swipe } from '../types';
import { Spinner, Button } from '../components/common';

// Generate gradient for company logo fallback
const generateGradient = (name: string): string => {
  const gradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    'linear-gradient(135deg, #5ee7df 0%, #b490ca 100%)',
    'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)',
  ];
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return gradients[hash % gradients.length];
};

// Get initials from company name
const getInitials = (name: string): string => {
  if (!name) return '?';
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
};

// Company logo component with fallback
function CompanyLogo({ logoUrl, companyName, size = 'md' }: { logoUrl?: string; companyName: string; size?: 'sm' | 'md' | 'lg' }) {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  const shouldShowImage = logoUrl && !imageError;

  return (
    <div
      className={`relative rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0 border border-gray-100 ${sizeClasses[size]}`}
      style={!shouldShowImage ? { background: generateGradient(companyName || 'Company') } : undefined}
    >
      {shouldShowImage ? (
        <img
          src={logoUrl}
          alt={`${companyName} logo`}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <span className="font-bold text-white drop-shadow-sm">
          {getInitials(companyName)}
        </span>
      )}
    </div>
  );
}

// Application summary generator
function getApplicationSummary(app: Application): { text: string; subtext: string; color: string; icon: React.ReactNode } {
  const companyName = app.opportunity?.company_name || 'the employer';

  switch (app.status?.toLowerCase()) {
    case 'viewed':
      return {
        text: `${companyName} has viewed your application`,
        subtext: 'Your profile is under consideration.',
        color: 'blue',
        icon: <Eye size={16} />
      };
    case 'interview':
      return {
        text: 'Interview scheduled!',
        subtext: `You have an upcoming interview with ${companyName}.`,
        color: 'purple',
        icon: <Calendar size={16} />
      };
    case 'offer':
      return {
        text: 'Congratulations! Offer received',
        subtext: `${companyName} wants to move forward with you.`,
        color: 'emerald',
        icon: <Gift size={16} />
      };
    case 'rejected':
      return {
        text: 'Application closed',
        subtext: `${companyName} has decided to proceed with other candidates.`,
        color: 'red',
        icon: <XCircle size={16} />
      };
    case 'submitted':
    default:
      return {
        text: 'Application submitted',
        subtext: 'Pending employer review.',
        color: 'green',
        icon: <CheckCircle2 size={16} />
      };
  }
}

// Status badge component
function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { color: string; bg: string; label: string }> = {
    viewed: { color: 'text-blue-700', bg: 'bg-blue-50 border-blue-100', label: 'Viewed' },
    interview: { color: 'text-purple-700', bg: 'bg-purple-50 border-purple-100', label: 'Interview' },
    offer: { color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-100', label: 'Offer' },
    rejected: { color: 'text-red-700', bg: 'bg-red-50 border-red-100', label: 'Closed' },
    submitted: { color: 'text-green-700', bg: 'bg-green-50 border-green-100', label: 'Submitted' },
  };

  const c = config[status?.toLowerCase()] || config.submitted;

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${c.bg} ${c.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.color.replace('text-', 'bg-')}`} />
      {c.label}
    </span>
  );
}

export function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [pendingSwipes, setPendingSwipes] = useState<Swipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isApproving, setIsApproving] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const fetchData = async () => {
    try {
      const [apps, pending] = await Promise.all([
        applicationsApi.getApplications(),
        swipesApi.getPending()
      ]);
      setApplications(apps);
      setPendingSwipes(pending);
    } catch (error) {
      console.error('Failed to fetch applications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (swipeId: number) => {
    setIsApproving(swipeId);
    try {
      await swipesApi.approveSwipe(swipeId);
      await fetchData();
    } catch (error) {
      console.error('Failed to approve application:', error);
    } finally {
      setIsApproving(null);
    }
  };

  // Filter applications
  const filteredApps = applications.filter((app) => {
    const matchesSearch =
      app.opportunity?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.opportunity?.company_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status?.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Status counts
  const statusCounts = applications.reduce((acc, app) => {
    const status = app.status?.toLowerCase() || 'submitted';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center h-[calc(100vh-100px)]">
          <Spinner size="lg" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="px-6 py-8 pb-24 max-w-3xl mx-auto">
        {/* Header */}
        <header className="mb-6">
          <h1 className="text-3xl font-display font-bold text-gray-900">Your Applications</h1>
          <p className="text-gray-500 mt-1">
            {applications.length === 0
              ? "You haven't applied to any opportunities yet"
              : `Tracking ${applications.length} application${applications.length !== 1 ? 's' : ''}`}
          </p>
        </header>

        {/* Summary cards */}
        {applications.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <button
              onClick={() => setStatusFilter('all')}
              className={`p-4 rounded-xl border transition-all ${statusFilter === 'all'
                ? 'bg-primary-50 border-primary-200 ring-2 ring-primary-200'
                : 'bg-white border-gray-100 hover:border-gray-200'
                }`}
            >
              <p className="text-2xl font-bold text-gray-900">{applications.length}</p>
              <p className="text-xs font-medium text-gray-500">All</p>
            </button>
            {statusCounts.submitted && (
              <button
                onClick={() => setStatusFilter('submitted')}
                className={`p-4 rounded-xl border transition-all ${statusFilter === 'submitted'
                  ? 'bg-green-50 border-green-200 ring-2 ring-green-200'
                  : 'bg-white border-gray-100 hover:border-gray-200'
                  }`}
              >
                <p className="text-2xl font-bold text-green-600">{statusCounts.submitted}</p>
                <p className="text-xs font-medium text-gray-500">Submitted</p>
              </button>
            )}
            {statusCounts.interview && (
              <button
                onClick={() => setStatusFilter('interview')}
                className={`p-4 rounded-xl border transition-all ${statusFilter === 'interview'
                  ? 'bg-purple-50 border-purple-200 ring-2 ring-purple-200'
                  : 'bg-white border-gray-100 hover:border-gray-200'
                  }`}
              >
                <p className="text-2xl font-bold text-purple-600">{statusCounts.interview}</p>
                <p className="text-xs font-medium text-gray-500">Interviews</p>
              </button>
            )}
            {statusCounts.offer && (
              <button
                onClick={() => setStatusFilter('offer')}
                className={`p-4 rounded-xl border transition-all ${statusFilter === 'offer'
                  ? 'bg-emerald-50 border-emerald-200 ring-2 ring-emerald-200'
                  : 'bg-white border-gray-100 hover:border-gray-200'
                  }`}
              >
                <p className="text-2xl font-bold text-emerald-600">{statusCounts.offer}</p>
                <p className="text-xs font-medium text-gray-500">Offers</p>
              </button>
            )}
          </div>
        )}

        {/* Search */}
        {applications.length > 0 && (
          <div className="relative mb-6">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by role or company..."
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 border border-gray-100"
            />
          </div>
        )}

        {/* Pending Drafts Section */}
        {pendingSwipes.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText size={20} className="text-amber-500" />
              Drafts ({pendingSwipes.length})
            </h2>
            <div className="space-y-3">
              {pendingSwipes.map((swipe) => (
                <div key={swipe.id} className="bg-white rounded-2xl p-5 border border-amber-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <CompanyLogo
                        logoUrl={swipe.opportunity?.company_logo_url}
                        companyName={swipe.opportunity?.company_name || 'Company'}
                        size="md"
                      />
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          {swipe.opportunity?.title || 'Untitled Opportunity'}
                        </h3>
                        <p className="text-sm text-gray-500">{swipe.opportunity?.company_name || 'Unknown Company'}</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleApprove(swipe.id)}
                      isLoading={isApproving === swipe.id}
                      className="bg-primary-600 hover:bg-primary-700 text-white"
                    >
                      Submit
                    </Button>
                  </div>
                  <div className="mt-3 text-xs text-amber-600 font-medium bg-amber-50 inline-flex items-center gap-1.5 px-2 py-1 rounded-full">
                    <AlertCircle size={12} />
                    Needs Review
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Applications List */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Send size={20} className="text-primary-500" />
            Recent Applications
            {filteredApps.length > 0 && statusFilter !== 'all' && (
              <button
                onClick={() => setStatusFilter('all')}
                className="ml-2 text-xs text-primary-600 hover:underline"
              >
                Clear filter
              </button>
            )}
          </h2>

          {filteredApps.length === 0 ? (
            applications.length > 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <p className="text-gray-500">No applications match your search.</p>
                <button
                  onClick={() => { setSearchQuery(''); setStatusFilter('all'); }}
                  className="mt-2 text-primary-600 font-medium text-sm hover:underline"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-primary-50/30 rounded-2xl border border-dashed border-gray-200">
                <div className="w-16 h-16 mx-auto bg-primary-100 rounded-2xl flex items-center justify-center mb-4">
                  <Sparkles size={28} className="text-primary-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">No applications yet</h3>
                <p className="text-gray-500 text-sm max-w-sm mx-auto mb-6">
                  When you swipe right on opportunities, they'll appear here so you can track your progress.
                </p>
                <Button variant="primary" onClick={() => window.location.href = '/feed'}>
                  <Sparkles size={16} className="mr-2" />
                  Discover Opportunities
                </Button>
              </div>
            )
          ) : (
            <div className="space-y-3">
              {filteredApps.map((app) => {
                const summary = getApplicationSummary(app);

                return (
                  <div
                    key={app.id}
                    className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-primary-200 transition-all cursor-pointer group"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3">
                        <CompanyLogo
                          logoUrl={app.opportunity?.company_logo_url}
                          companyName={app.opportunity?.company_name || 'Company'}
                          size="lg"
                        />
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                            {app.opportunity?.title}
                          </h3>
                          <p className="text-sm text-gray-500">{app.opportunity?.company_name}</p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-400 whitespace-nowrap">
                        {formatDate(app.created_at)}
                      </span>
                    </div>

                    {/* Summary */}
                    <div className={`p-3 rounded-xl mb-3 ${summary.color === 'green' ? 'bg-green-50' :
                      summary.color === 'blue' ? 'bg-blue-50' :
                        summary.color === 'purple' ? 'bg-purple-50' :
                          summary.color === 'emerald' ? 'bg-emerald-50' :
                            summary.color === 'red' ? 'bg-red-50' : 'bg-gray-50'
                      }`}>
                      <div className="flex items-start gap-2">
                        <span className={`${summary.color === 'green' ? 'text-green-600' :
                          summary.color === 'blue' ? 'text-blue-600' :
                            summary.color === 'purple' ? 'text-purple-600' :
                              summary.color === 'emerald' ? 'text-emerald-600' :
                                summary.color === 'red' ? 'text-red-600' : 'text-gray-600'
                          }`}>
                          {summary.icon}
                        </span>
                        <div>
                          <p className={`text-sm font-semibold ${summary.color === 'green' ? 'text-green-800' :
                            summary.color === 'blue' ? 'text-blue-800' :
                              summary.color === 'purple' ? 'text-purple-800' :
                                summary.color === 'emerald' ? 'text-emerald-800' :
                                  summary.color === 'red' ? 'text-red-800' : 'text-gray-800'
                            }`}>
                            {summary.text}
                          </p>
                          <p className={`text-xs mt-0.5 ${summary.color === 'green' ? 'text-green-600' :
                            summary.color === 'blue' ? 'text-blue-600' :
                              summary.color === 'purple' ? 'text-purple-600' :
                                summary.color === 'emerald' ? 'text-emerald-600' :
                                  summary.color === 'red' ? 'text-red-600' : 'text-gray-600'
                            }`}>
                            {summary.subtext}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                      <StatusBadge status={app.status} />
                      <ChevronRight size={18} className="text-gray-300 group-hover:text-primary-500 transition-colors" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
