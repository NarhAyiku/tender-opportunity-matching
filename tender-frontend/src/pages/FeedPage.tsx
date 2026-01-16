import { useEffect } from 'react';
import { useFeedStore } from '../stores';
import { SwipeDeck, SwipeActions } from '../components/swipe';
import { AppLayout } from '../components/layout';
import { Spinner } from '../components/common';
import { SwipeAction } from '../types';

export function FeedPage() {
  const { opportunities, currentIndex, isLoading, error, fetchFeed, swipe } =
    useFeedStore();

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  const handleSwipe = (opportunityId: number, action: SwipeAction) => {
    swipe(opportunityId, action);
  };

  const handleDislike = () => {
    const currentOpp = opportunities[currentIndex];
    if (currentOpp) {
      handleSwipe(currentOpp.id, 'dislike');
    }
  };

  const handleLike = () => {
    const currentOpp = opportunities[currentIndex];
    if (currentOpp) {
      handleSwipe(currentOpp.id, 'like');
    }
  };

  const handleSave = () => {
    const currentOpp = opportunities[currentIndex];
    if (currentOpp) {
      handleSwipe(currentOpp.id, 'save');
    }
  };

  return (
    <AppLayout>
      <div className="h-screen flex flex-col pt-4">
        {/* Header */}
        <header className="px-4 pb-4">
          <h1 className="text-2xl font-bold text-primary-600">TENDER</h1>
          <p className="text-gray-600 text-sm">
            {opportunities.length - currentIndex} opportunities waiting
          </p>
        </header>

        {/* Main swipe area */}
        <div className="flex-1 relative px-4 min-h-0">
          {isLoading && opportunities.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Spinner size="lg" />
            </div>
          ) : error ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center p-8">
                <p className="text-red-500 mb-4">{error}</p>
                <button
                  onClick={() => fetchFeed()}
                  className="text-primary-600 font-medium hover:underline"
                >
                  Try again
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full max-w-md mx-auto">
              <SwipeDeck
                opportunities={opportunities}
                currentIndex={currentIndex}
                onSwipe={handleSwipe}
              />
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="px-4 pb-20">
          <SwipeActions
            onDislike={handleDislike}
            onLike={handleLike}
            onSave={handleSave}
            disabled={isLoading || currentIndex >= opportunities.length}
          />
        </div>
      </div>
    </AppLayout>
  );
}
