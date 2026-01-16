import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import TinderCard from 'react-tinder-card';
import OpportunityCard from '../components/OpportunityCard';
import SwipeLimitCounter from '../components/SwipeLimitCounter';
import { feed, swipes } from '../services/api';

export default function Feed() {
  const navigate = useNavigate();
  const [opportunities, setOpportunities] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [swipeError, setSwipeError] = useState(null);

  // Refs for programmatic swiping
  const cardRefs = useRef([]);

  useEffect(() => {
    loadFeed();
  }, []);

  const loadFeed = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await feed.getFeed(20);
      // Fix: API returns 'feed' not 'opportunities'
      const feedItems = data.feed || [];
      setOpportunities(feedItems.map(item => ({
        ...item.opportunity,
        score: item.score,
        matched_skills: item.matched_skills
      })));
      setCurrentIndex(feedItems.length - 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = async (direction, opportunity) => {
    const action = direction === 'right' ? 'like' : 'dislike';
    try {
      setSwipeError(null);
      const swipe = await swipes.create(opportunity.id, action);
      
      // If it's a like, navigate to preview screen
      if (action === 'like' && swipe.id) {
        navigate(`/preview/${swipe.id}`);
      }
    } catch (err) {
      console.error('Swipe failed:', err);
      setSwipeError(err.message || 'Failed to record swipe');
      // If it's a limit error, show it prominently
      if (err.message && err.message.includes('limit')) {
        // Error will be shown in the UI
      }
    }
  };

  const handleCardLeftScreen = (idx) => {
    setCurrentIndex(idx - 1);
  };

  const swipe = async (dir) => {
    if (currentIndex >= 0 && cardRefs.current[currentIndex]) {
      await cardRefs.current[currentIndex].swipe(dir);
    }
  };

  const saveOpportunity = async () => {
    if (currentIndex >= 0) {
      const opp = opportunities[currentIndex];
      try {
        await swipes.create(opp.id, 'save');
        // Remove from stack
        if (cardRefs.current[currentIndex]) {
          await cardRefs.current[currentIndex].swipe('up');
        }
      } catch (err) {
        console.error('Save failed:', err);
      }
    }
  };

  // Note: childRefs not used, keeping for potential future use

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={loadFeed}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (opportunities.length === 0 || currentIndex < 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No more opportunities</h3>
        <p className="text-gray-500 mb-4">Check back later for new matches!</p>
        <button
          onClick={loadFeed}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
        >
          Refresh Feed
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Swipe Limit Counter */}
      <SwipeLimitCounter />
      
      {/* Swipe Error Message */}
      {swipeError && (
        <div className="mx-4 mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{swipeError}</p>
        </div>
      )}
      
      {/* Card Stack */}
      <div className="flex-1 relative overflow-hidden">
        {opportunities.map((opp, idx) => (
          <TinderCard
            key={opp.id}
            ref={(el) => (cardRefs.current[idx] = el)}
            onSwipe={(dir) => handleSwipe(dir, opp)}
            onCardLeftScreen={() => handleCardLeftScreen(idx)}
            preventSwipe={['up', 'down']}
            className="absolute inset-0"
          >
            <OpportunityCard opportunity={opp} />
          </TinderCard>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center items-center gap-6 py-4 px-4">
        <button
          onClick={() => swipe('left')}
          className="w-14 h-14 bg-white border-2 border-red-200 rounded-full flex items-center justify-center shadow-lg hover:bg-red-50 transition-colors"
        >
          <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <button
          onClick={saveOpportunity}
          className="w-12 h-12 bg-white border-2 border-amber-200 rounded-full flex items-center justify-center shadow-lg hover:bg-amber-50 transition-colors"
        >
          <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </button>

        <button
          onClick={() => swipe('right')}
          className="w-14 h-14 bg-white border-2 border-green-200 rounded-full flex items-center justify-center shadow-lg hover:bg-green-50 transition-colors"
        >
          <svg className="w-7 h-7 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
