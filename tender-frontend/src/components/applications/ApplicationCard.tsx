import { Building2, Clock, ChevronRight } from 'lucide-react';
import { Application } from '../../types';
import { Badge } from '../common';

interface ApplicationCardProps {
  application: Application;
  onClick: () => void;
}

const statusColors: Record<string, { bg: string; text: string }> = {
  pending: { bg: 'bg-gray-100', text: 'text-gray-800' },
  submitted: { bg: 'bg-blue-100', text: 'text-blue-800' },
  under_review: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  interview: { bg: 'bg-purple-100', text: 'text-purple-800' },
  offer: { bg: 'bg-green-100', text: 'text-green-800' },
  rejected: { bg: 'bg-red-100', text: 'text-red-800' },
  withdrawn: { bg: 'bg-gray-100', text: 'text-gray-800' },
};

export function ApplicationCard({ application, onClick }: ApplicationCardProps) {
  const { opportunity, status, created_at, submitted_at } = application;
  const colors = statusColors[status] || statusColors.pending;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <button
      onClick={onClick}
      className="w-full bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow text-left"
    >
      <div className="flex items-start gap-3">
        {opportunity?.company_logo_url ? (
          <img
            src={opportunity.company_logo_url}
            alt={opportunity.company_name || 'Company'}
            className="w-12 h-12 rounded-lg object-cover bg-gray-100"
          />
        ) : (
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
            <Building2 className="w-6 h-6 text-primary-600" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-gray-900 truncate">
                {opportunity?.title || 'Opportunity'}
              </h3>
              <p className="text-gray-600 text-sm">
                {opportunity?.company_name || 'Company'}
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
          </div>

          <div className="flex items-center gap-3 mt-2">
            <Badge
              className={`${colors.bg} ${colors.text}`}
              variant="default"
            >
              {status.replace('_', ' ')}
            </Badge>

            <span className="flex items-center text-gray-500 text-xs">
              <Clock size={12} className="mr-1" />
              {submitted_at ? `Submitted ${formatDate(submitted_at)}` : `Liked ${formatDate(created_at)}`}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}
