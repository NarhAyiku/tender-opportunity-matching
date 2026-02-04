import { RecruiterMetrics } from '../../types/recruiter';
import { Users, TrendingUp, Target, Zap } from 'lucide-react';

interface MetricsCardsProps {
    metrics: RecruiterMetrics;
}

/**
 * MetricsCards displays key recruiting metrics in card format
 */
export function MetricsCards({ metrics }: MetricsCardsProps) {
    const metricItems = [
        {
            label: 'New Applications',
            value: metrics.newApplications,
            icon: Users,
            color: 'bg-blue-50 text-blue-600',
            bgColor: 'bg-blue-500',
        },
        {
            label: 'Average Fit',
            value: `${metrics.averageFitScore}%`,
            icon: Target,
            color: 'bg-emerald-50 text-emerald-600',
            bgColor: 'bg-emerald-500',
        },
        {
            label: 'Conversion Rate',
            value: `${metrics.conversionRate}%`,
            icon: TrendingUp,
            color: 'bg-purple-50 text-purple-600',
            bgColor: 'bg-purple-500',
        },
        {
            label: 'Total Candidates',
            value: metrics.totalCandidates,
            icon: Zap,
            color: 'bg-amber-50 text-amber-600',
            bgColor: 'bg-amber-500',
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {metricItems.map((item, index) => {
                const Icon = item.icon;
                return (
                    <div
                        key={index}
                        className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className={`w-10 h-10 rounded-lg ${item.color} flex items-center justify-center`}>
                                <Icon size={20} />
                            </div>
                        </div>
                        <div className="text-3xl font-bold text-gray-900 mb-1">{item.value}</div>
                        <div className="text-sm text-gray-500 font-medium">{item.label}</div>
                    </div>
                );
            })}
        </div>
    );
}
