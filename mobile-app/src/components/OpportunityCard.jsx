import { forwardRef } from 'react';

const typeColors = {
  job: 'bg-blue-100 text-blue-700',
  internship: 'bg-purple-100 text-purple-700',
  scholarship: 'bg-green-100 text-green-700',
  grant: 'bg-amber-100 text-amber-700'
};

const OpportunityCard = forwardRef(({ opportunity, style }, ref) => {
  const {
    title,
    company_name,
    company_logo,
    location,
    opportunity_type,
    salary_min,
    salary_max,
    description,
    required_skills,
    match_score
  } = opportunity;

  const formatSalary = (min, max) => {
    if (!min && !max) return null;
    const fmt = (n) => n >= 1000 ? `$${(n/1000).toFixed(0)}k` : `$${n}`;
    if (min && max) return `${fmt(min)} - ${fmt(max)}`;
    return min ? `From ${fmt(min)}` : `Up to ${fmt(max)}`;
  };

  return (
    <div
      ref={ref}
      style={style}
      className="absolute inset-4 bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col"
    >
      {/* Header with company info */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden">
            {company_logo ? (
              <img src={company_logo} alt={company_name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xl font-bold text-gray-400">
                {company_name?.charAt(0) || '?'}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{company_name || 'Company'}</h3>
            <p className="text-sm text-gray-500 truncate">{location || 'Remote'}</p>
          </div>
          {match_score && (
            <div className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
              {Math.round(match_score * 100)}% match
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="flex items-center gap-2 mb-2">
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeColors[opportunity_type] || 'bg-gray-100 text-gray-700'}`}>
            {opportunity_type || 'Job'}
          </span>
          {formatSalary(salary_min, salary_max) && (
            <span className="text-sm font-medium text-gray-700">
              {formatSalary(salary_min, salary_max)}
            </span>
          )}
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-3">{title}</h2>

        <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-4">
          {description || 'No description available.'}
        </p>

        {required_skills?.length > 0 && (
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">Required Skills</p>
            <div className="flex flex-wrap gap-1.5">
              {required_skills.slice(0, 6).map((skill, i) => (
                <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs">
                  {skill}
                </span>
              ))}
              {required_skills.length > 6 && (
                <span className="px-2 py-1 text-gray-500 text-xs">
                  +{required_skills.length - 6} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Swipe hint */}
      <div className="p-3 bg-gray-50 text-center">
        <p className="text-xs text-gray-400">Swipe right to apply, left to skip</p>
      </div>
    </div>
  );
});

OpportunityCard.displayName = 'OpportunityCard';

export default OpportunityCard;
