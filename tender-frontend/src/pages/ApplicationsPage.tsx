import { useEffect, useState } from 'react';
import { useApplicationsStore } from '../stores';
import { AppLayout } from '../components/layout';
import { ApplicationCard, Timeline } from '../components/applications';
import { Card, Spinner, Button } from '../components/common';
import { ApplicationStatus, Application } from '../types';
import { ArrowLeft, Send, X, Building2 } from 'lucide-react';

const STATUS_TABS: { value: ApplicationStatus | null; label: string }[] = [
  { value: null, label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'interview', label: 'Interview' },
  { value: 'offer', label: 'Offers' },
];

export function ApplicationsPage() {
  const {
    applications,
    selectedApplication,
    isLoading,
    filter,
    fetchApplications,
    fetchApplication,
    submitApplication,
    withdrawApplication,
    setFilter,
    clearSelected,
  } = useApplicationsStore();

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleApplicationClick = (id: number) => {
    fetchApplication(id);
  };

  const handleSubmit = async (id: number) => {
    setIsSubmitting(true);
    await submitApplication(id);
    setIsSubmitting(false);
  };

  const handleWithdraw = async (id: number) => {
    setIsSubmitting(true);
    await withdrawApplication(id);
    setIsSubmitting(false);
  };

  // Detail view
  if (selectedApplication) {
    const app = selectedApplication;
    const canSubmit = app.status === 'pending';
    const canWithdraw = ['pending', 'submitted', 'under_review'].includes(app.status);

    return (
      <AppLayout>
        <div className="max-w-lg mx-auto px-4 py-6 pb-24">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={clearSelected}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-xl font-bold">Application Details</h1>
          </div>

          {/* Opportunity info */}
          <Card className="mb-4">
            <div className="flex items-start gap-3">
              {app.opportunity?.company_logo_url ? (
                <img
                  src={app.opportunity.company_logo_url}
                  alt={app.opportunity.company_name || 'Company'}
                  className="w-14 h-14 rounded-xl object-cover bg-gray-100"
                />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                  <Building2 className="w-7 h-7 text-primary-600" />
                </div>
              )}
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {app.opportunity?.title || 'Opportunity'}
                </h2>
                <p className="text-gray-600">
                  {app.opportunity?.company_name || 'Company'}
                </p>
                <p className="text-sm text-gray-500 mt-1 capitalize">
                  Status: <span className="font-medium">{app.status.replace('_', ' ')}</span>
                </p>
              </div>
            </div>
          </Card>

          {/* Actions */}
          {(canSubmit || canWithdraw) && (
            <Card className="mb-4">
              <div className="flex gap-3">
                {canSubmit && (
                  <Button
                    onClick={() => handleSubmit(app.id)}
                    isLoading={isSubmitting}
                    className="flex-1"
                  >
                    <Send size={16} className="mr-2" />
                    Submit Application
                  </Button>
                )}
                {canWithdraw && (
                  <Button
                    onClick={() => handleWithdraw(app.id)}
                    variant="outline"
                    isLoading={isSubmitting}
                    className={canSubmit ? '' : 'flex-1'}
                  >
                    <X size={16} className="mr-2" />
                    Withdraw
                  </Button>
                )}
              </div>
            </Card>
          )}

          {/* Timeline */}
          <Card>
            <h3 className="font-semibold text-gray-900 mb-4">Timeline</h3>
            <Timeline events={app.events || []} />
          </Card>
        </div>
      </AppLayout>
    );
  }

  // List view
  return (
    <AppLayout>
      <div className="max-w-lg mx-auto px-4 py-6 pb-24">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Applications</h1>

        {/* Status tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {STATUS_TABS.map(({ value, label }) => (
            <button
              key={label}
              onClick={() => setFilter(value)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                filter === value
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Applications list */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : applications.length === 0 ? (
          <Card>
            <div className="text-center py-8">
              <div className="text-5xl mb-4">📝</div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                No applications yet
              </h2>
              <p className="text-gray-600">
                Start swiping right on opportunities to create applications
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {applications.map((app) => (
              <ApplicationCard
                key={app.id}
                application={app}
                onClick={() => handleApplicationClick(app.id)}
              />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
