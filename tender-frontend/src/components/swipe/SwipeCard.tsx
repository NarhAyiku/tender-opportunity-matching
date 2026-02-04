import { OpportunityMatch } from '../../types';
import { MapPin, DollarSign, Building2, Briefcase, Zap, Sparkles } from 'lucide-react';

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
    salary_min,
    salary_max,
    salary_currency,
    is_salary_visible,
    opportunity_type,
    match_score,
    matched_skills,
    required_skills,
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

  // Calculate "Infinity" mode if score is exceptionally high (simulated logic for demo)
  const isInfinityMatch = match_score > 0.95;

  return (
    <div
      className="absolute w-full h-full bg-white rounded-[2.5rem] shadow-float overflow-hidden no-select border border-gray-100 flex flex-col"
      style={style}
    >
      {/* Header Section (White with Type Pill) */}
      <div className="p-6 pb-2 flex justify-between items-start">
        <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${opportunity_type === 'internship' ? 'bg-primary-50 text-primary-700 border border-primary-100' :
          opportunity_type === 'job' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
            'bg-gray-100 text-gray-700'
          }`}>
          {opportunity_type}
        </span>

        <div className="flex items-center text-gray-400 text-xs font-medium gap-1">
          <Briefcase size={12} />
          <span>New Match</span>
        </div>
      </div>

      {/* Main Content (Title, Company, Location) */}
      <div className="px-6 pb-6 pt-2">
        <h2 className="text-3xl font-display font-bold text-gray-900 leading-tight mb-2">
          {title}
        </h2>
        <div className="flex items-center gap-2 text-gray-500 font-medium text-base mb-4">
          <Building2 size={18} />
          {company_name}
        </div>

        <div className="flex flex-wrap gap-2">
          {(city || country) && (
            <div className="flex items-center gap-1.5 text-gray-600 text-sm bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
              <MapPin size={14} />
              {city}, {country}
            </div>
          )}
          {salaryText && (
            <div className="flex items-center gap-1.5 text-emerald-700 font-semibold text-sm bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
              <DollarSign size={14} className="text-emerald-600" />
              {salaryText}
            </div>
          )}
        </div>
      </div>

      {/* "Why you match" Box - Emerald Theme */}
      <div className="flex-1 px-4 pb-4">
        <div className="bg-gradient-to-br from-primary-50 to-white rounded-[2rem] p-6 h-full flex flex-col relative overflow-hidden ring-1 ring-primary-100/50">

          {/* Infinity / Score Badge */}
          <div className="absolute top-5 right-5 bg-white shadow-lg shadow-emerald-900/5 rounded-full px-4 py-1.5 flex items-center gap-1.5 border border-primary-100 z-10">
            <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span className={`font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent ${isInfinityMatch ? 'text-xl leading-none' : 'text-base'}`}>
              {isInfinityMatch ? '∞' : `${Math.round(match_score * 100)}% Match`}
            </span>
          </div>

          <h3 className="flex items-center gap-2 text-primary-800 font-bold mb-4 z-10 text-lg">
            <Sparkles className="w-5 h-5 text-primary-500" />
            Why you match
          </h3>

          <ul className="space-y-3 mb-6 z-10">
            {matched_skills?.slice(0, 3).map(skill => (
              <li key={skill} className="flex items-start gap-3 text-[15px] text-gray-700 font-medium">
                <div className="min-w-[8px] h-[8px] rounded-full bg-emerald-500 mt-2 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                <span>Your <strong>{skill}</strong> skills match</span>
              </li>
            ))}
            <li className="flex items-start gap-3 text-[15px] text-gray-700 font-medium">
              <div className="min-w-[8px] h-[8px] rounded-full bg-emerald-500 mt-2 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
              Matches your experience level
            </li>
          </ul>

          <div className="mt-auto pt-5 border-t border-primary-100/50 z-10">
            <h4 className="text-[11px] uppercase text-primary-400 font-bold tracking-wider mb-3">Core Requirements</h4>
            <div className="flex flex-wrap gap-2">
              {required_skills?.slice(0, 4).map(skill => (
                <span key={skill} className="text-xs bg-white text-gray-600 px-3 py-1.5 rounded-lg border border-gray-100 font-medium shadow-sm">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Background Glow */}
          <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-primary-200/20 rounded-full blur-3xl"></div>
          <div className="absolute -top-10 -left-10 w-48 h-48 bg-emerald-200/20 rounded-full blur-3xl"></div>
        </div>
      </div>

      {/* Swipe Overlay Hints */}
      <div className="absolute inset-0 pointer-events-none z-50 rounded-3xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-transparent opacity-0 swipe-left-hint transition-opacity duration-300" />
        <div className="absolute inset-0 bg-gradient-to-l from-green-500/20 to-transparent opacity-0 swipe-right-hint transition-opacity duration-300" />
      </div>
    </div>
  );
}
