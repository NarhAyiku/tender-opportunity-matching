import { useState } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';
import { SwipeCard } from './SwipeCard';
import { OpportunityMatch, SwipeAction } from '../../types';

interface SwipeDeckProps {
  opportunities: OpportunityMatch[];
  currentIndex: number;
  onSwipe: (opportunityId: number, action: SwipeAction) => void;
}

const SWIPE_THRESHOLD = 100;
const ROTATION_FACTOR = 0.1;

export function SwipeDeck({ opportunities, currentIndex, onSwipe }: SwipeDeckProps) {
  const [isGone, setIsGone] = useState(false);

  const [{ x, rotate, scale }, api] = useSpring(() => ({
    x: 0,
    rotate: 0,
    scale: 1,
    config: { tension: 300, friction: 30 },
  }));

  const currentOpp = opportunities[currentIndex];
  const nextOpp = opportunities[currentIndex + 1];

  const triggerSwipe = (direction: 'left' | 'right' | 'up') => {
    if (!currentOpp || isGone) return;

    setIsGone(true);
    const exitX = direction === 'left' ? -500 : direction === 'right' ? 500 : 0;
    const exitRotate = direction === 'up' ? 0 : direction === 'left' ? -30 : 30;

    api.start({
      x: exitX,
      rotate: exitRotate,
      scale: 0.8,
      config: { tension: 200, friction: 25 },
      onRest: () => {
        const action: SwipeAction =
          direction === 'right' ? 'like' : direction === 'left' ? 'dislike' : 'save';
        onSwipe(currentOpp.id, action);
        setIsGone(false);
        api.start({ x: 0, rotate: 0, scale: 1, immediate: true });
      },
    });
  };

  const bind = useDrag(
    ({ down, movement: [mx], velocity: [vx], direction: [dx] }) => {
      if (isGone || !currentOpp) return;

      const trigger = Math.abs(mx) > SWIPE_THRESHOLD || vx > 0.5;

      if (!down && trigger) {
        const dir = dx > 0 ? 'right' : 'left';
        triggerSwipe(dir);
      } else if (!down) {
        // Snap back
        api.start({ x: 0, rotate: 0, scale: 1 });
      } else {
        // Follow finger
        api.start({
          x: mx,
          rotate: mx * ROTATION_FACTOR,
          scale: down ? 1.02 : 1,
          immediate: (key) => key === 'x' || key === 'rotate',
        });
      }
    },
    { axis: 'x' }
  );

  if (opportunities.length === 0 || currentIndex >= opportunities.length) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center p-8">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            You've seen it all!
          </h2>
          <p className="text-gray-600">
            Check back later for new opportunities
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {/* Next card (behind) */}
      {nextOpp && (
        <div className="absolute inset-0 transform scale-95 opacity-50">
          <SwipeCard opportunity={nextOpp} />
        </div>
      )}

      {/* Current card (interactive) */}
      {currentOpp && (
        <animated.div
          {...bind()}
          className="absolute inset-0 touch-pan-y cursor-grab active:cursor-grabbing"
          style={{
            x,
            rotate: rotate.to((r) => `${r}deg`),
            scale,
          }}
        >
          <SwipeCard opportunity={currentOpp} />

          {/* Swipe indicators */}
          <animated.div
            className="absolute top-8 left-8 bg-red-500 text-white px-4 py-2 rounded-lg font-bold text-xl transform -rotate-12 border-4 border-white shadow-lg"
            style={{
              opacity: x.to((val) => (val < -30 ? Math.min(1, Math.abs(val) / 100) : 0)),
            }}
          >
            NOPE
          </animated.div>
          <animated.div
            className="absolute top-8 right-8 bg-green-500 text-white px-4 py-2 rounded-lg font-bold text-xl transform rotate-12 border-4 border-white shadow-lg"
            style={{
              opacity: x.to((val) => (val > 30 ? Math.min(1, val / 100) : 0)),
            }}
          >
            LIKE
          </animated.div>
        </animated.div>
      )}
    </div>
  );
}

