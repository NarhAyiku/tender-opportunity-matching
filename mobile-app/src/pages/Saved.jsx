import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  Bookmark,
  BookmarkX,
  MapPin,
  Briefcase,
  Users,
  GraduationCap,
  Gift,
  ChevronRight,
  Share2,
} from 'lucide-react';
import Card from '../components/ui/Card';
import Skeleton from '../components/ui/Skeleton';
import Toast from '../components/ui/Toast';

const TYPE_TABS = [
  { id: 'all', label: 'All' },
  { id: 'job', label: 'Jobs', icon: Briefcase },
  { id: 'internship', label: 'Internships', icon: Users },
  { id: 'scholarship', label: 'Scholarships', icon: GraduationCap },
  { id: 'grant', label: 'Grants', icon: Gift },
];

const TYPE_ICONS = {
  job: Briefcase,
  internship: Users,
  scholarship: GraduationCap,
  grant: Gift,
};

function SavedCard({ opportunity, onUnsave, onShare, onTap }) {
  const TypeIcon = TYPE_ICONS[opportunity.opportunity_type] || Briefcase;

  const formatSalary = (min, max, currency) => {
    if (!min && !max) return null;
    const fmt = (n) => {
      if (n >= 1000) return `${Math.round(n / 1000)}k`;
      return n;
    };
    const cur = currency || '$';
    if (min && max) return `${cur}${fmt(min)} - ${cur}${fmt(max)}`;
    if (min) return `From ${cur}${fmt(min)}`;
    return `Up to ${cur}${fmt(max)}`;
  };

  const salary = formatSalary(
    opportunity.salary_min,
    opportunity.salary_max,
    opportunity.salary_currency
  );

  return (
    <button
      onClick={onTap}
      className="w-full flex items-start gap-3 p-4 bg-white border-b border-slate-100 hover:bg-slate-50 transition-colors text-left"
    >
      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
        {opportunity.company_logo ? (
          <img
            src={opportunity.company_logo}
            alt=""
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <TypeIcon className="w-5 h-5 text-slate-500" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-medium text-slate-900 truncate">{opportunity.title}</p>
        <p className="text-sm text-slate-600 truncate mb-1">
          {opportunity.company_name || 'Company'}
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
            <TypeIcon className="w-3 h-3" />
            {opportunity.opportunity_type}
          </span>
          {opportunity.location && (
            <span className="inline-flex items-center gap-1 text-xs text-slate-400">
              <MapPin className="w-3 h-3" />
              {opportunity.location}
            </span>
          )}
          {salary && (
            <span className="text-xs text-slate-400">{salary}</span>
          )}
        </div>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onUnsave();
        }}
        className="p-2 hover:bg-red-50 rounded-lg flex-shrink-0 group"
        aria-label="Remove from saved"
      >
        <BookmarkX className="w-5 h-5 text-slate-400 group-hover:text-red-500" />
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onShare();
        }}
        className="p-2 hover:bg-blue-50 rounded-lg flex-shrink-0 group"
        aria-label="Share opportunity"
      >
        <Share2 className="w-5 h-5 text-slate-400 group-hover:text-blue-500" />
      </button>

      <ChevronRight className="w-4 h-4 text-slate-300 mt-2 flex-shrink-0" />
    </button>
  );
}

export default function Saved() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [saved, setSaved] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeType, setActiveType] = useState('all');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadSaved();
  }, [user]);

  const loadSaved = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('swipes')
        .select(`
          id,
          created_at,
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
            salary_currency,
            industry
          )
        `)
        .eq('user_id', user.id)
        .eq('action', 'save')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      const mapped = (data || [])
        .filter((s) => s.opportunity)
        .map((s) => ({
          swipe_id: s.id,
          saved_at: s.created_at,
          ...s.opportunity,
        }));

      setSaved(mapped);
    } catch (err) {
      if (err.name === 'AbortError' || err.message?.includes('AbortError')) return;
      console.error('Saved load error:', err);
      setError(err.message || 'Failed to load saved opportunities');
    } finally {
      setLoading(false);
    }
  };

  const handleUnsave = async (swipeId, title) => {
    const previous = saved;
    setSaved((prev) => prev.filter((o) => o.swipe_id !== swipeId));
    setToast(`Removed "${title}"`);

    try {
      const { error: deleteError } = await supabase
        .from('swipes')
        .delete()
        .eq('id', swipeId)
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;
    } catch (err) {
      console.error('Unsave failed:', err);
      setSaved(previous);
      setToast('Failed to unsave. Please try again.');
    }
  };

  const filtered = saved.filter((opp) => {
    const matchType = activeType === 'all' || opp.opportunity_type === activeType;
    const matchSearch =
      !searchQuery ||
      (opp.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (opp.company_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchType && matchSearch;
  });

  const countByType = (type) =>
    saved.filter((o) => type === 'all' || o.opportunity_type === type).length;

  // Loading state
  if (loading) {
    return (
      <div className="flex-1 flex flex-col bg-[var(--color-bg)]">
        <div className="bg-white border-b border-slate-100 px-4 py-3">
          <Skeleton className="h-7 w-20" />
        </div>
        <div className="p-4 space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-4 flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[var(--color-bg)]">
      {/* Header */}
      <div className="bg-white border-b border-slate-100">
        <div className="px-4 py-3 flex items-center gap-3">
          <h1 className="text-lg font-semibold text-slate-900">Saved</h1>
          {saved.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
              {saved.length}
            </span>
          )}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search saved"
              className="w-full pl-9 pr-4 py-2 bg-slate-50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Type Tabs */}
        <div className="px-4 pb-3 flex gap-2 overflow-x-auto">
          {TYPE_TABS.map((tab) => {
            const count = countByType(tab.id);
            const isActive = activeType === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveType(tab.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${isActive
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
              >
                {tab.label}
                {count > 0 && tab.id !== 'all' && (
                  <span
                    className={`w-5 h-5 rounded-full text-xs flex items-center justify-center ${isActive ? 'bg-white/20' : 'bg-slate-200'
                      }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
          <button onClick={loadSaved} className="ml-2 underline">
            Retry
          </button>
        </div>
      )}

      {/* List */}
      <div className="flex-1 overflow-y-auto pb-20">
        {filtered.length > 0 ? (
          filtered.map((opp) => (
            <SavedCard
              key={opp.swipe_id}
              opportunity={opp}
              onUnsave={() => handleUnsave(opp.swipe_id, opp.title)}
              onShare={() => {
                const text = `Check out this ${opp.opportunity_type} at ${opp.company_name}: ${opp.title}`;
                const url = `${window.location.origin}/opportunity/${opp.id}`;
                if (navigator.share) {
                  navigator.share({ title: opp.title, text, url });
                } else {
                  navigator.clipboard.writeText(`${text} ${url}`);
                  setToast('Link copied to clipboard');
                }
              }}
              onTap={() => navigate(`/opportunity/${opp.id}`)}
            />
          ))
        ) : saved.length > 0 ? (
          // Has saved items but search/filter returned nothing
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <Search className="w-6 h-6 text-slate-400" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-1">No results</h3>
            <p className="text-sm text-slate-500">
              Try a different search term or filter.
            </p>
          </div>
        ) : (
          // No saved items at all
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center mb-4">
              <Bookmark className="w-8 h-8 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No saved opportunities</h3>
            <p className="text-sm text-slate-500 max-w-xs">
              Swipe up or tap the Save button on opportunities to save them for later.
            </p>
          </div>
        )}
      </div>

      <Toast message={toast} onClose={() => setToast(null)} />
    </div>
  );
}
