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
    <div className="flex items-center justify-center gap-8 py-6">
      {/* Dislike button (Red X) */}
      <button
        onClick={onDislike}
        disabled={disabled}
        className="w-16 h-16 rounded-full bg-white shadow-float border border-red-100 flex items-center justify-center text-red-500 hover:bg-red-50 hover:scale-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
        aria-label="Pass"
      >
        <X size={32} strokeWidth={3} />
      </button>

      {/* Save button (Smaller) */}
      <button
        onClick={onSave}
        disabled={disabled}
        className="w-12 h-12 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center text-gray-400 hover:text-amber-500 hover:bg-amber-50 hover:scale-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
        aria-label="Save for later"
      >
        <Bookmark size={20} strokeWidth={2.5} />
      </button>

      {/* Like button (Green Heart) */}
      <button
        onClick={onLike}
        disabled={disabled}
        className="w-16 h-16 rounded-full bg-white shadow-float border border-emerald-100 flex items-center justify-center text-emerald-500 hover:bg-emerald-50 hover:scale-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
        aria-label="Apply"
      >
        <Heart size={32} strokeWidth={3} fill="currentColor" className="text-emerald-500" />
      </button>
    </div>
  );
}
