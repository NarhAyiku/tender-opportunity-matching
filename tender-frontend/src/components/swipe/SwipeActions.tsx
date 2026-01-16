import { X, Heart, Bookmark } from 'lucide-react';

interface SwipeActionsProps {
  onDislike: () => void;
  onLike: () => void;
  onSave: () => void;
  disabled?: boolean;
}

export function SwipeActions({
  onDislike,
  onLike,
  onSave,
  disabled = false,
}: SwipeActionsProps) {
  return (
    <div className="flex items-center justify-center gap-6 py-4">
      {/* Dislike button */}
      <button
        onClick={onDislike}
        disabled={disabled}
        className="w-14 h-14 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center text-red-500 hover:bg-red-50 hover:border-red-200 hover:scale-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
        aria-label="Dislike"
      >
        <X size={28} strokeWidth={2.5} />
      </button>

      {/* Save button */}
      <button
        onClick={onSave}
        disabled={disabled}
        className="w-12 h-12 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center text-amber-500 hover:bg-amber-50 hover:border-amber-200 hover:scale-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
        aria-label="Save for later"
      >
        <Bookmark size={22} strokeWidth={2.5} />
      </button>

      {/* Like button */}
      <button
        onClick={onLike}
        disabled={disabled}
        className="w-14 h-14 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center text-green-500 hover:bg-green-50 hover:border-green-200 hover:scale-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
        aria-label="Like"
      >
        <Heart size={28} strokeWidth={2.5} />
      </button>
    </div>
  );
}
