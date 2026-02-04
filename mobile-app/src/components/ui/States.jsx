import Button from './Button';
import Card from './Card';

export function EmptyState({ onRefresh }) {
  return (
    <Card className="p-6 text-center space-y-3">
      <div className="mx-auto h-14 w-14 rounded-full bg-slate-100 flex items-center justify-center">
        <span className="text-2xl">🔍</span>
      </div>
      <h3 className="font-semibold text-slate-900">No matches yet</h3>
      <p className="text-sm text-slate-500">We’ll fetch more opportunities soon. Try refreshing.</p>
      {onRefresh && <Button onClick={onRefresh}>Refresh feed</Button>}
    </Card>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <Card className="p-6 text-center space-y-3 border border-red-200 bg-red-50">
      <div className="mx-auto h-12 w-12 rounded-full bg-red-100 flex items-center justify-center text-red-600">!</div>
      <p className="text-sm text-red-600">{message || 'Something went wrong.'}</p>
      {onRetry && <Button onClick={onRetry}>Try again</Button>}
    </Card>
  );
}

export function NotAuthedState({ onRetry }) {
  return (
    <Card className="p-6 text-center space-y-3 border border-amber-200 bg-amber-50">
      <div className="mx-auto h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">🔒</div>
      <h3 className="font-semibold text-amber-800">You’re signed out</h3>
      <p className="text-sm text-amber-700">Log in again to see your matches.</p>
      {onRetry && <Button onClick={onRetry}>Check session</Button>}
    </Card>
  );
}
