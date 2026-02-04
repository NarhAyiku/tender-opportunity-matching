import { useState, useEffect, useRef, useMemo, createRef } from 'react';
import { useNavigate } from 'react-router-dom';
import TinderCard from 'react-tinder-card';
import { AnimatePresence, motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import OpportunityCard from '../components/OpportunityCard';
import Skeleton from '../components/ui/Skeleton';
import Toast from '../components/ui/Toast';
import { X, Heart, RotateCcw, Share2, Send, Zap, SlidersHorizontal, Eye, Building, ChevronDown, Sparkles } from 'lucide-react';

const EmptyState = ({ onRefresh }) => (
  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[60vh]">
    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6 animate-pulse">
      <Zap className="w-10 h-10 text-slate-300" />
    </div>
    <h3 className="text-xl font-bold text-slate-900 mb-2">No more opportunities</h3>
    <p className="text-slate-500 mb-8 max-w-xs mx-auto">
      You've seen all the matches for now. Check back later or adjust your preferences!
    </p>
    <button
      onClick={onRefresh}
      className="px-8 py-3 bg-[var(--color-primary)] text-white font-semibold rounded-full shadow-lg shadow-purple-200 hover:shadow-xl hover:scale-105 transition-all"
    >
      Refresh Feed
    </button>
  </div>
);

const ErrorState = ({ message, onRetry }) => (
  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[60vh]">
    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
      <X className="w-8 h-8 text-red-400" />
    </div>
    <h3 className="text-lg font-semibold text-slate-900 mb-2">Something went wrong</h3>
    <p className="text-red-500 mb-6 text-sm bg-red-50 p-3 rounded-lg border border-red-100 max-w-xs">{message}</p>
    <button
      onClick={onRetry}
      className="px-6 py-2.5 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 transition-colors"
    >
      Try Again
    </button>
  </div>
);

const NotAuthedState = ({ onRetry }) => (
  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[60vh]">
    <p className="text-slate-500 mb-4">Please log in to see opportunities.</p>
    <button
      onClick={onRetry}
      className="px-6 py-2 bg-purple-600 text-white rounded-lg font-medium"
    >
      Log In
    </button>
  </div>
);

// Quick View Modal for job details
const QuickViewModal = ({ opportunity, onClose, onApply, onViewCompany }) => {
  if (!opportunity) return null;

  const {
    title, company_name, company, description, requirements,
    required_skills = [], match_score, salary_min, salary_max,
    salary_currency, work_arrangement, experience_level, education_level
  } = opportunity;

  const displayCompany = company_name || company || 'Company';
  const score = match_score || opportunity.score;
  const currencySymbol = { USD: '$', EUR: '€', GBP: '£', GHS: 'GH₵' }[salary_currency] || '$';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-h-[85vh] rounded-t-3xl overflow-hidden"
      >
        {/* Handle bar */}
        <div className="flex justify-center py-3">
          <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
        </div>

        {/* Header with match score */}
        <div className="px-6 pb-4 border-b border-slate-100">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-slate-900 mb-1">{title}</h2>
              <button
                onClick={() => onViewCompany(displayCompany)}
                className="flex items-center gap-1.5 text-purple-600 font-medium hover:text-purple-700"
              >
                <Building className="w-4 h-4" />
                {displayCompany}
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>
            {score && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-400 to-amber-500 text-white rounded-full shadow-lg">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-bold">{Math.round(score * 100)}% Match</span>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4 overflow-y-auto max-h-[50vh] space-y-6">
          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-3">
            {(salary_min || salary_max) && (
              <div className="bg-emerald-50 rounded-xl p-3 text-center">
                <p className="text-xs text-emerald-600 mb-1">Salary</p>
                <p className="font-bold text-emerald-700">
                  {currencySymbol}{salary_min ? (salary_min / 1000).toFixed(0) : '?'}k
                </p>
              </div>
            )}
            {work_arrangement && (
              <div className="bg-blue-50 rounded-xl p-3 text-center">
                <p className="text-xs text-blue-600 mb-1">Type</p>
                <p className="font-bold text-blue-700 capitalize">{work_arrangement}</p>
              </div>
            )}
            {experience_level && (
              <div className="bg-purple-50 rounded-xl p-3 text-center">
                <p className="text-xs text-purple-600 mb-1">Level</p>
                <p className="font-bold text-purple-700 capitalize">{experience_level}</p>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-2">About this role</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{description || 'No description available.'}</p>
          </div>

          {/* Requirements */}
          {requirements && (
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Requirements</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{requirements}</p>
            </div>
          )}

          {/* Skills */}
          {required_skills.length > 0 && (
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Required Skills</h3>
              <div className="flex flex-wrap gap-2">
                {required_skills.slice(0, 8).map((skill, i) => (
                  <span key={i} className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl"
          >
            Close
          </button>
          <button
            onClick={() => onApply(opportunity)}
            className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg"
          >
            Apply Now
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default function Feed() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [opportunities, setOpportunities] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [swipeError, setSwipeError] = useState(null);
  const [toast, setToast] = useState(null);
  const [quickViewOpp, setQuickViewOpp] = useState(null);
  const [preferences, setPreferences] = useState(null);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  // Ref to track card references for programmatic swipes
  const cardRefs = useRef([]);

  // Track whether screening status has been verified
  const [screeningChecked, setScreeningChecked] = useState(false);

  // Constants
  const maxRetries = 3;

  // Init card refs array
  useMemo(() => {
    cardRefs.current = new Array(opportunities.length).fill(0).map(() => createRef());
  }, [opportunities.length]);

  // Load user preferences for filtering
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const loadPreferences = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('preferences')
          .eq('id', user.id)
          .single();

        if (!error && data?.preferences) {
          setPreferences(data.preferences);
          // Count active filters
          const prefs = data.preferences;
          let count = 0;
          if (prefs.opportunity_types?.length) count++;
          if (prefs.work_arrangements?.length) count++;
          if (prefs.job_levels?.length) count++;
          if (prefs.salary_min || prefs.salary_max) count++;
          if (prefs.preferred_locations?.length) count++;
          if (prefs.preferred_industries?.length) count++;
          setActiveFiltersCount(count);
        }
      } catch (err) {
        console.warn('Preferences load error:', err.message);
      }
    };

    loadPreferences();
  }, [isAuthenticated, user]);

  // Screening gate: redirect if not completed
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    let cancelled = false;

    const checkScreening = async () => {
      try {
        const { data, error: fetchErr } = await supabase
          .from('profiles')
          .select('screening_completed')
          .eq('id', user.id)
          .single();

        if (cancelled) return;

        if (fetchErr) {
          // AbortErrors are expected during auth transitions — silently allow through
          if (!(fetchErr.message?.includes('aborted') || fetchErr.name === 'AbortError')) {
            console.warn('Screening check query error — allowing through:', fetchErr.message);
          }
          setScreeningChecked(true); // Mark as checked even on error to avoid re-checking
          return;
        }

        if (data?.screening_completed === true) {
          setScreeningChecked(true);
        } else {
          navigate('/screening', { replace: true });
        }
      } catch (err) {
        if (cancelled) return;
        if (!(err?.name === 'AbortError' || err?.message?.includes('aborted'))) {
          console.warn('Screening check failed — allowing through:', err.message);
        }
        setScreeningChecked(true); // Mark as checked even on error to avoid re-checking
      }
    };

    checkScreening();

    return () => { cancelled = true; };
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    let isMounted = true;
    let retryCount = 0;

    const load = async () => {
      if (!isAuthenticated || !user || !screeningChecked) {
        setLoading(false);
        return;
      }

      // 1. Try to load from cache first for instant display
      const cached = localStorage.getItem('feed_opportunities');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setOpportunities(parsed);
            setCurrentIndex(parsed.length - 1);
            setLoading(false); // Show cached content immediately
          }
        } catch (e) {
          console.warn('Cache parse error', e);
        }
      }

      while (retryCount < maxRetries && isMounted) {
        try {
          if (!cached) setLoading(true); // Only show loading if no cache
          setError(null);

          // Get user's existing swipes to exclude
          const { data: existingSwipes, error: swipeError } = await supabase
            .from('swipes')
            .select('opportunity_id')
            .eq('user_id', user.id);

          if (!isMounted) return;

          // Check for abort errors
          if (swipeError?.message?.includes('aborted')) {
            retryCount++;
            await new Promise(r => setTimeout(r, 500 * retryCount));
            continue;
          }

          const swipedIds = existingSwipes?.map(s => s.opportunity_id) || [];

          // Fetch opportunities not yet swiped
          let query = supabase
            .from('opportunities')
            .select('*')
            .eq('is_active', true)
            .limit(50); // Fetch more to allow for filtering

          // Exclude already swiped opportunities
          if (swipedIds.length > 0) {
            query = query.not('id', 'in', `(${swipedIds.join(',')})`);
          }

          // Apply preference filters if available
          if (preferences) {
            // Filter by opportunity type
            if (preferences.opportunity_types?.length > 0) {
              query = query.in('opportunity_type', preferences.opportunity_types);
            }

            // Filter by work arrangement
            if (preferences.work_arrangements?.length > 0) {
              query = query.in('work_arrangement', preferences.work_arrangements);
            }

            // Filter by experience/job level
            if (preferences.job_levels?.length > 0) {
              query = query.in('experience_level', preferences.job_levels);
            }

            // Filter by minimum salary
            if (preferences.salary_min) {
              query = query.gte('salary_min', preferences.salary_min);
            }
          }

          const { data, error: fetchError } = await query;

          if (!isMounted) return;

          // Check for abort errors
          if (fetchError?.message?.includes('aborted')) {
            retryCount++;
            await new Promise(r => setTimeout(r, 500 * retryCount));
            continue;
          }

          if (fetchError) throw fetchError;

          // Client-side filtering for more complex preferences
          let filteredData = data || [];
          if (preferences && filteredData.length > 0) {
            // Filter by preferred industries (client-side)
            if (preferences.preferred_industries?.length > 0) {
              filteredData = filteredData.filter(opp =>
                !opp.industry || preferences.preferred_industries.some(ind =>
                  opp.industry?.toLowerCase().includes(ind.toLowerCase())
                )
              );
            }

            // Limit to 20 after filtering
            filteredData = filteredData.slice(0, 20);
          }

          if (filteredData.length > 0) {
            setOpportunities(filteredData);
            setCurrentIndex(filteredData.length - 1);
            // Update cache
            localStorage.setItem('feed_opportunities', JSON.stringify(filteredData));
          } else if (!cached) {
            // Only clear if we didn't have cache and found nothing
            setOpportunities([]);
          }

          setLoading(false);
          return; // Success - exit the retry loop
        } catch (err) {
          if (!isMounted) return;
          if (err.message?.includes('aborted') || err.name === 'AbortError') {
            // Silent retry for aborts
            retryCount++;
            await new Promise(r => setTimeout(r, 500 * retryCount));
            continue;
          }
          console.error('Feed load error:', err);
          // If we have cache, don't show full error, just toast? Or keep showing cache.
          if (!cached) setError(err.message || 'Failed to load opportunities');
          setLoading(false);
          return;
        }
      }

      if (isMounted && retryCount >= maxRetries && !cached) {
        setError('Connection issues. Please try again.');
        setLoading(false);
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, user, screeningChecked]);

  // Reload function for retry buttons
  const loadFeed = () => {
    window.location.reload();
  };

  const handleSwipe = async (direction, opportunity) => {
    // Right = Save (Heart), Left = Skip (X)
    const action = direction === 'right' ? 'save' : 'skip';

    try {
      setSwipeError(null);

      const { error: insertError } = await supabase
        .from('swipes')
        .upsert({
          user_id: user.id,
          opportunity_id: opportunity.id,
          action: action,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id,opportunity_id' }); // Use upsert to handle re-swipes if needed

      if (insertError) throw insertError;

      if (action === 'save') {
        setToast('Saved for later!');
      }
    } catch (err) {
      console.error('Swipe failed:', err);
    }
  };

  const handleApply = async (opportunity) => {
    // Send / Apply action
    try {
      // Swipe the card visually right
      if (currentIndex >= 0 && cardRefs.current[currentIndex].current) {
        await cardRefs.current[currentIndex].current.swipe('right');
      } else {
        // Fallback if ref is missing
        console.warn('Card ref missing for swipe', currentIndex);
      }

      const { error: insertError } = await supabase
        .from('swipes')
        .upsert({
          user_id: user.id,
          opportunity_id: opportunity.id,
          action: 'interested', // Maps to DB check constraint: interested/skip/save
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id,opportunity_id' });

      if (insertError) throw insertError;
      setToast('Application sent!');

    } catch (err) {
      console.error('Apply failed:', err);
      setToast('Failed to apply');
    }
  };

  const handleCardLeftScreen = (idx) => {
    setCurrentIndex(idx - 1);
  };

  const swipe = async (dir) => {
    if (currentIndex >= 0 && cardRefs.current[currentIndex].current) {
      await cardRefs.current[currentIndex].current.swipe(dir);
    }
  };

  // Undo functionality
  const handleUndo = async () => {
    // Check if we can undo (is there a card to restore?)
    const potentialNextIndex = currentIndex + 1;
    if (potentialNextIndex < opportunities.length && cardRefs.current[potentialNextIndex].current) {
      await cardRefs.current[potentialNextIndex].current.restoreCard();
      setCurrentIndex(potentialNextIndex);
    }
  };

  const handleShare = async () => {
    if (currentIndex >= 0 && opportunities[currentIndex]) {
      const opp = opportunities[currentIndex];
      try {
        await navigator.share({
          title: opp.title,
          text: `Check out this ${opp.opportunity_type} at ${opp.company_name}: ${opp.title}`,
          url: `${window.location.origin}/opportunity/${opp.id}`
        });
      } catch (err) {
        setToast('Link copied to clipboard');
        navigator.clipboard.writeText(`${opp.title} at ${opp.company}`);
      }
    }
  };

  const LoadingSkeleton = () => (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex gap-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <div className="h-[60vh] w-full rounded-3xl bg-white/50 backdrop-blur-sm border border-white/40 p-4 space-y-4">
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-8 w-3/4" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    if (loading) return <LoadingSkeleton />;
    if (!isAuthenticated) return <NotAuthedState onRetry={() => navigate('/login')} />;
    if (error) return <ErrorState message={error} onRetry={loadFeed} />;
    if (opportunities.length === 0 || currentIndex < 0) return <EmptyState onRefresh={loadFeed} />;

    return (
      <div className="flex-1 relative mx-4 mt-2 mb-24 min-h-[60vh]">
        {/* Buttons integrated over the card stack bottom area */}
        <div className="absolute -bottom-4 left-0 right-0 z-50 flex justify-center items-center pointer-events-none">
          <div className="bg-white/90 backdrop-blur-md p-2 rounded-full shadow-2xl border border-white/50 pointer-events-auto flex items-center gap-4">
            <button onClick={handleUndo} className="p-3 rounded-full hover:bg-slate-100 transition-colors text-yellow-500 shadow-sm border border-slate-100">
              <RotateCcw className="w-5 h-5" />
            </button>
            <button onClick={() => swipe('left')} className="p-4 rounded-full bg-white hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors shadow-lg border border-slate-100" title="Pass">
              <X className="w-6 h-6" />
            </button>
            <button
              onClick={() => opportunities[currentIndex] && handleApply(opportunities[currentIndex])}
              className="p-5 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-xl shadow-purple-500/30 hover:scale-110 transition-transform relative -top-3"
              title="Send Transcript (Apply)"
            >
              <Send className="w-7 h-7 ml-0.5 fill-white/20" />
            </button>
            <button onClick={() => swipe('right')} className="p-4 rounded-full bg-white hover:bg-green-50 text-slate-400 hover:text-green-500 transition-colors shadow-lg border border-slate-100" title="Save">
              <Heart className="w-6 h-6" />
            </button>
            <button onClick={handleShare} className="p-3 rounded-full hover:bg-slate-100 transition-colors text-blue-500 shadow-sm border border-slate-100">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {opportunities.map((opp, idx) => (
            <TinderCard
              ref={cardRefs.current[idx]}
              key={opp.id}
              onSwipe={(dir) => handleSwipe(dir, opp)}
              onCardLeftScreen={() => handleCardLeftScreen(idx)}
              preventSwipe={['up', 'down']}
              className="absolute inset-0 z-10"
              swipeRequirementType="position"
              swipeThreshold={100}
            >
              <motion.div
                initial={{ scale: 1 }}
                animate={{
                  scale: idx === currentIndex ? 1 : 0.95,
                  opacity: idx === currentIndex ? 1 : 0,
                  y: idx === currentIndex ? 0 : 20
                }}
                className="h-full w-full cursor-pointer"
                onClick={() => navigate(`/opportunity/${opp.id}`)}
              >
                <OpportunityCard opportunity={opp} />
              </motion.div>
            </TinderCard>
          ))}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-purple-200/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-200/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      {/* Header */}
      <div className="px-6 pt-6 pb-2 relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="h-11 w-11 rounded-full bg-gradient-premium p-[2px]">
              <div className="h-full w-full rounded-full bg-slate-900 border-2 border-slate-900 flex items-center justify-center">
                <Zap className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              </div>
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Discover</p>
            <h1 className="text-xl font-bold text-slate-900">Opportunities</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Quick View Button */}
          {opportunities[currentIndex] && (
            <button
              onClick={() => setQuickViewOpp(opportunities[currentIndex])}
              className="p-2.5 bg-white/60 backdrop-blur-md rounded-full border border-white/50 shadow-sm hover:bg-white/80 transition-colors"
              title="Quick View"
            >
              <Eye className="w-5 h-5 text-slate-600" />
            </button>
          )}
          {/* Filter/Preferences Button */}
          <button
            onClick={() => navigate('/preferences')}
            className="relative p-2.5 bg-white/60 backdrop-blur-md rounded-full border border-white/50 shadow-sm hover:bg-white/80 transition-colors"
            title="Filters"
          >
            <SlidersHorizontal className="w-5 h-5 text-slate-600" />
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-purple-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Swipe Error Message */}
      {swipeError && (
        <div className="mx-6 mt-2 p-3 bg-red-50/90 backdrop-blur-sm border border-red-200 rounded-2xl shadow-sm z-20">
          <p className="text-sm text-red-600 font-medium text-center">{swipeError}</p>
        </div>
      )}

      {/* Content Area */}
      {renderContent()}

      <Toast message={toast} onClose={() => setToast(null)} />

      {/* Quick View Modal */}
      <AnimatePresence>
        {quickViewOpp && (
          <QuickViewModal
            opportunity={quickViewOpp}
            onClose={() => setQuickViewOpp(null)}
            onApply={(opp) => {
              setQuickViewOpp(null);
              handleApply(opp);
            }}
            onViewCompany={(companyName) => {
              setQuickViewOpp(null);
              // Navigate to a filtered view of company's opportunities
              navigate(`/feed?company=${encodeURIComponent(companyName)}`);
              setToast(`Viewing ${companyName} opportunities`);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
