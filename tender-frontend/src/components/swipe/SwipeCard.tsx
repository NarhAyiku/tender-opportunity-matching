import { OpportunityMatch } from '../../types';
import { Badge } from '../common';
import { MapPin, DollarSign, Building2, Briefcase } from 'lucide-react';

interface SwipeCardProps {
  opportunity: OpportunityMatch;
  style?: React.CSSProperties;
}

export function SwipeCard({ opportunity, style }: SwipeCardProps) {
  const {
    title,
    company_name,
    company_logo_url,
    city,
    country,
    is_remote,
    salary_min,
    salary_max,
    salary_currency,
    salary_period,
    is_salary_visible,
    opportunity_type,
    work_arrangement,
    experience_level,
    match_score,
    matched_skills,
    required_skills,
    description,
  } = opportunity;

  const formatSalary = () => {
    if (!is_salary_visible || (!salary_min && !salary_max)) return null;
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: salary_currency || 'USD',
      maximumFractionDigits: 0,
    });
    if (salary_min && salary_max) {
      return `${formatter.format(salary_min)} - ${formatter.format(salary_max)}`;
    }
    if (salary_min) return `From ${formatter.format(salary_min)}`;
    if (salary_max) return `Up to ${formatter.format(salary_max)}`;
    return null;
  };

  const salaryText = formatSalary();

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case 'job':
        return 'info';
      case 'internship':
        return 'warning';
      case 'scholarship':
        return 'success';
      case 'grant':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <div
      className="absolute w-full h-full bg-white rounded-2xl shadow-xl overflow-hidden no-select"
      style={style}
    >
      {/* Header with logo and match score */}
      <div className="p-4 pb-0">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {company_logo_url ? (
              <img
                src={company_logo_url}
                alt={company_name || 'Company'}
                className="w-14 h-14 rounded-xl object-cover bg-gray-100"
              />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                <Building2 className="w-7 h-7 text-primary-600" />
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold text-gray-900 line-clamp-1">
                {title}
              </h2>
              <p className="text-gray-600 font-medium">{company_name || 'Company'}</p>
            </div>
          </div>

          {/* Match score badge */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1.5 rounded-full text-sm font-bold">
            {Math.round(match_score * 100)}% Match
          </div>
        </div>
      </div>

      {/* Location and salary */}
      <div className="px-4 py-3 flex flex-wrap gap-3">
        {(city || country || is_remote) && (
          <div className="flex items-center text-gray-600 text-sm">
            <MapPin size={16} className="mr-1" />
            {is_remote ? 'Remote' : `${city}${country ? `, ${country}` : ''}`}
          </div>
        )}
        {salaryText && (
          <div className="flex items-center text-gray-600 text-sm">
            <DollarSign size={16} className="mr-1" />
            {salaryText}
            {salary_period && ` / ${salary_period}`}
          </div>
        )}
      </div>

      {/* Badges */}
      <div className="px-4 flex flex-wrap gap-2">
        <Badge variant={getBadgeVariant(opportunity_type)}>
          <Briefcase size={12} className="mr-1" />
          {opportunity_type}
        </Badge>
        {work_arrangement && (
          <Badge variant="default">{work_arrangement}</Badge>
        )}
        {experience_level && (
          <Badge variant="default">{experience_level}</Badge>
        )}
      </div>

      {/* Description */}
      <div className="px-4 py-3">
        <p className="text-gray-700 text-sm line-clamp-4">{description}</p>
      </div>

      {/* Skills */}
      <div className="px-4 pb-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Skills</h3>
        <div className="flex flex-wrap gap-1.5">
          {required_skills?.slice(0, 8).map((skill) => (
            <span
              key={skill}
              className={`px-2 py-1 rounded-md text-xs font-medium ${
                matched_skills?.includes(skill)
                  ? 'bg-green-100 text-green-800 ring-1 ring-green-300'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Swipe hint gradient overlays */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-0 bg-gradient-to-r from-red-500/30 to-transparent transition-opacity swipe-left-hint" />
        <div className="absolute inset-0 opacity-0 bg-gradient-to-l from-green-500/30 to-transparent transition-opacity swipe-right-hint" />
      </div>
    </div>
  );
}
