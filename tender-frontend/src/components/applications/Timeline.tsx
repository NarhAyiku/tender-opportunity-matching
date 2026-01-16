import { CheckCircle2, Circle, Clock } from 'lucide-react';
import { ApplicationEvent } from '../../types';

interface TimelineProps {
  events: ApplicationEvent[];
}

export function Timeline({ events }: TimelineProps) {
  if (!events || events.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No timeline events yet
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getEventIcon = (eventType: string) => {
    if (eventType.includes('submitted') || eventType.includes('completed')) {
      return <CheckCircle2 className="w-5 h-5 text-green-500" />;
    }
    if (eventType.includes('pending') || eventType.includes('review')) {
      return <Clock className="w-5 h-5 text-yellow-500" />;
    }
    return <Circle className="w-5 h-5 text-gray-400" />;
  };

  const getEventLabel = (eventType: string) => {
    const labels: Record<string, string> = {
      swiped_right: 'Liked opportunity',
      application_created: 'Application created',
      submitted: 'Application submitted',
      under_review: 'Under review',
      interview_scheduled: 'Interview scheduled',
      offer_received: 'Offer received',
      rejected: 'Application rejected',
      withdrawn: 'Application withdrawn',
    };
    return labels[eventType] || eventType.replace(/_/g, ' ');
  };

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-[10px] top-3 bottom-3 w-0.5 bg-gray-200" />

      <div className="space-y-4">
        {events.map((event, index) => (
          <div key={event.id || index} className="relative flex gap-4">
            <div className="relative z-10 bg-white">
              {getEventIcon(event.event_type)}
            </div>
            <div className="flex-1 pb-4">
              <p className="font-medium text-gray-900">
                {getEventLabel(event.event_type)}
              </p>
              {event.description && (
                <p className="text-sm text-gray-600 mt-0.5">{event.description}</p>
              )}
              <p className="text-xs text-gray-400 mt-1">
                {formatDate(event.created_at)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
