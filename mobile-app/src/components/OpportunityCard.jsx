import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { MapPin, DollarSign, Briefcase, GraduationCap, Building, Globe, Zap, Clock, Award, CheckCircle2 } from 'lucide-react';

const OpportunityCard = forwardRef(({ opportunity, style }, ref) => {
  const {
    title,
    company_name,
    company,
    company_logo,
    company_logo_url,
    location,
    city,
    country,
    opportunity_type,
    job_type,
    category,
    salary_min,
    salary_max,
    salary_currency,
    salary_period,
    description,
    requirements,
    required_skills = [],
    matched_skills = [],
    match_score,
    work_arrangement,
    remote,
    is_remote,
    experience_level,
    education_level,
    education_requirement,
    industry,
    benefits = [],
    eligibility_criteria = [],
    application_deadline,
  } = opportunity;

  const currencySymbol = { USD: '$', EUR: '\u20AC', GBP: '\u00A3', GHS: 'GH\u20B5' }[salary_currency] || salary_currency || '$';

  const formatSalary = (min, max) => {
    if (!min && !max) return null;
    const fmt = (n) => {
      if (n >= 1000) return `${currencySymbol}${(n/1000).toFixed(0)}k`;
      return `${currencySymbol}${n}`;
    };
    let range = '';
    if (min && max) range = `${fmt(min)}-${fmt(max)}`;
    else range = min ? `From ${fmt(min)}` : `Up to ${fmt(max)}`;
    if (salary_period && salary_period !== 'yearly') range += `/${salary_period}`;
    return range;
  };

  const score = match_score || opportunity.score;
  const displayCompany = company_name || company || 'Company';
  const logo = company_logo_url || company_logo;
  const displayLocation = location || [city, country].filter(Boolean).join(', ') || (is_remote || remote ? 'Remote' : 'On-site');
  const displayType = category || opportunity_type || job_type || 'Job';
  const displayArrangement = work_arrangement || (is_remote || remote ? 'remote' : 'onsite');
  const displayEducation = education_requirement || education_level;

  // Format experience level display
  const getExperienceLabel = (level) => {
    const labels = {
      'entry': 'Entry Level',
      'mid': 'Mid Level',
      'senior': 'Senior Level',
      'lead': 'Lead',
      'executive': 'Executive'
    };
    return labels[level] || level || 'Any Level';
  };

  // Format education level display
  const getEducationLabel = (level) => {
    const labels = {
      'high_school': 'High School',
      'associate': "Associate's",
      'bachelor': "Bachelor's",
      'master': "Master's",
      'phd': 'PhD'
    };
    return labels[level] || level || 'Any';
  };

  // Determine work arrangement icon/label
  const getWorkArrangementBadge = () => {
    const arrangement = displayArrangement;
    const config = {
      'remote': { label: 'Remote', color: 'bg-green-100 text-green-700', icon: Globe },
      'hybrid': { label: 'Hybrid', color: 'bg-blue-100 text-blue-700', icon: Building },
      'onsite': { label: 'On-site', color: 'bg-slate-100 text-slate-700', icon: MapPin }
    };
    return config[arrangement] || config['onsite'];
  };

  const arrangementBadge = getWorkArrangementBadge();
  const ArrangementIcon = arrangementBadge.icon;

  return (
    <motion.div
      ref={ref}
      style={style}
      className="absolute inset-4 bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col border border-slate-100"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      {/* Category/Industry Label */}
      {industry && (
        <div className="px-5 pt-4">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">
            {industry}
          </span>
        </div>
      )}

      {/* Title & Company */}
      <div className="px-5 pt-3 pb-4">
        <h2 className="text-2xl font-bold text-slate-900 leading-tight mb-2">
          {title}
        </h2>
        <div className="flex items-center gap-3">
          {/* Company Logo */}
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0">
            {logo ? (
              <img src={logo} alt={displayCompany} className="w-full h-full object-cover" />
            ) : (
              <span className="text-lg font-bold text-slate-400">
                {displayCompany.charAt(0)}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-slate-700 truncate">{displayCompany}</p>
            <div className="flex items-center gap-1 text-slate-500 text-sm">
              <MapPin className="w-3.5 h-3.5" />
              <span className="truncate">{displayLocation}</span>
            </div>
          </div>
          {/* Match Score */}
          {score && (
            <div className="flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-700 rounded-full">
              <Zap className="w-3.5 h-3.5" />
              <span className="text-xs font-semibold">{Math.round(score * 100)}%</span>
            </div>
          )}
        </div>
      </div>

      {/* Info Pills */}
      <div className="px-5 pb-4">
        <div className="flex flex-wrap gap-2">
          {/* Salary */}
          {formatSalary(salary_min, salary_max) && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full">
              <DollarSign className="w-4 h-4" />
              <span className="text-sm font-medium">{formatSalary(salary_min, salary_max)}</span>
            </div>
          )}

          {/* Work Arrangement */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${arrangementBadge.color}`}>
            <ArrangementIcon className="w-4 h-4" />
            <span className="text-sm font-medium">{arrangementBadge.label}</span>
          </div>

          {/* Job Type */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full">
            <Briefcase className="w-4 h-4" />
            <span className="text-sm font-medium capitalize">{displayType}</span>
          </div>
        </div>
      </div>

      {/* Experience & Education */}
      <div className="px-5 pb-4 flex gap-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
            <Briefcase className="w-4 h-4 text-slate-500" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Experience level</p>
            <p className="text-sm font-medium text-slate-700">{getExperienceLabel(experience_level)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
            <GraduationCap className="w-4 h-4 text-slate-500" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Education</p>
            <p className="text-sm font-medium text-slate-700">{getEducationLabel(displayEducation)}</p>
          </div>
        </div>
      </div>

      {/* Description & Requirements */}
      <div className="px-5 pb-4 flex-1 overflow-y-auto space-y-4">
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">
            About this role
          </p>
          <p className="text-sm text-slate-600 leading-relaxed">
            {description || 'No description available for this position.'}
          </p>
        </div>

        {requirements && (
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">
              Requirements
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              {requirements}
            </p>
          </div>
        )}

        {/* Eligibility / Rules (PRD: rules_requirements) */}
        {(() => {
          const criteria = Array.isArray(eligibility_criteria) ? eligibility_criteria :
            (typeof eligibility_criteria === 'string' ? JSON.parse(eligibility_criteria || '[]') : []);
          if (criteria.length > 0) {
            return (
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">
                  Eligibility & Rules
                </p>
                <ul className="space-y-1">
                  {criteria.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>{typeof item === 'string' ? item : item.label || JSON.stringify(item)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          }
          return null;
        })()}

        {/* Benefits */}
        {(() => {
          const bens = Array.isArray(benefits) ? benefits :
            (typeof benefits === 'string' ? JSON.parse(benefits || '[]') : []);
          if (bens.length > 0) {
            return (
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">
                  Benefits
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {bens.slice(0, 6).map((b, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-full text-xs font-medium bg-teal-50 text-teal-700">
                      {typeof b === 'string' ? b : b.label || ''}
                    </span>
                  ))}
                </div>
              </div>
            );
          }
          return null;
        })()}

        {/* Application Deadline */}
        {application_deadline && (
          <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 px-3 py-2 rounded-lg">
            <Clock className="w-4 h-4" />
            <span className="font-medium">Deadline: {new Date(application_deadline).toLocaleDateString()}</span>
          </div>
        )}
      </div>

      {/* Skills */}
      {(() => {
        // Parse skills if it's a string
        const skills = Array.isArray(required_skills) ? required_skills :
          (typeof required_skills === 'string' ? JSON.parse(required_skills || '[]') : []);
        const matchedSkillsArr = Array.isArray(matched_skills) ? matched_skills : [];

        if (matchedSkillsArr.length > 0 || skills.length > 0) {
          return (
            <div className="px-5 pb-4">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">
                {matchedSkillsArr.length > 0 ? 'Matching skills' : 'Required skills'}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {(matchedSkillsArr.length > 0 ? matchedSkillsArr : skills).slice(0, 6).map((skill, i) => (
                  <span
                    key={i}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      matchedSkillsArr.includes(skill)
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          );
        }
        return null;
      })()}

      {/* Swipe hint */}
      <div className="p-4 bg-gradient-to-t from-slate-50 to-white border-t border-slate-100">
        <div className="flex justify-center gap-8 text-xs text-slate-400">
          <span>← Skip</span>
          <span className="font-medium text-emerald-500">Swipe to decide</span>
          <span>Apply →</span>
        </div>
      </div>
    </motion.div>
  );
});

OpportunityCard.displayName = 'OpportunityCard';

export default OpportunityCard;
