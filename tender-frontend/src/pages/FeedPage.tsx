import { useEffect, useState } from 'react';
import { useFeedStore } from '../stores';
import { SwipeDeck, SwipeActions, OpportunityDetailsModal } from '../components/swipe';
import { AppLayout } from '../components/layout';
import { Spinner } from '../components/common';
import { SwipeAction, OpportunityMatch } from '../types';


export function FeedPage() {
  const { opportunities, currentIndex, isLoading, error, fetchFeed, swipe } = useFeedStore();
  const [selectedOpp, setSelectedOpp] = useState<OpportunityMatch | null>(null);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  const handleSwipe = (opportunityId: number, action: SwipeAction) => {
    swipe(opportunityId, action);
    setSelectedOpp(null); // Close modal if open (though modal usually blocks interaction)
  };

  const handleDislike = () => {
    const currentOpp = opportunities[currentIndex];
    if (currentOpp) handleSwipe(currentOpp.id, 'dislike');
  };

  const handleLike = () => {
    const currentOpp = opportunities[currentIndex];
    if (currentOpp) handleSwipe(currentOpp.id, 'like');
  };

  const handleSave = () => {
    const currentOpp = opportunities[currentIndex];
    if (currentOpp) handleSwipe(currentOpp.id, 'save');
  };

  const handleShare = async () => {
    if (!selectedOpp) return;
    const url = window.location.origin + `/opportunities/${selectedOpp.id}`; // Hypothetical URL
    const shareData = {
      title: selectedOpp.title,
      text: `Check out this ${selectedOpp.title} role at ${selectedOpp.company_name}!`,
      url: url,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(url);
        alert('Link copied to clipboard!');
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  return (
    <AppLayout>
      <div className="h-[calc(100vh-8rem)] md:h-[calc(100vh-6rem)] flex flex-col pt-4 max-w-md mx-auto relative">
        {/* Main swipe area */}
        <div className="flex-1 relative min-h-0 w-full">
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
            <div className="w-full h-full relative">
              <SwipeDeck
                opportunities={opportunities}
                currentIndex={currentIndex}
                onSwipe={handleSwipe}
                onSelect={setSelectedOpp}
              />
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="pb-4 pt-4 px-4">
          <SwipeActions
            onDislike={handleDislike}
            onLike={handleLike}
            onSave={handleSave}
            disabled={isLoading || currentIndex >= opportunities.length}
          />
        </div>

        {/* Opportunity Details Modal */}
        <OpportunityDetailsModal
          opportunity={selectedOpp}
          isOpen={!!selectedOpp}
          onClose={() => setSelectedOpp(null)}
          onShare={handleShare}
        />
      </div>
    </AppLayout>
  );
}
