import clsx from 'clsx';

export default function Skeleton({ className = '' }) {
  return (
    <div
      className={clsx(
        'animate-pulse bg-slate-200 rounded-md',
        className
      )}
    />
  );
}
