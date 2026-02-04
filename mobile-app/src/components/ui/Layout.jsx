export function PageContainer({ children }) {
  return <div className="px-4 pb-6">{children}</div>;
}

export function PageHeader({ title, subtitle, right }) {
  return (
    <div className="flex items-center justify-between py-4">
      <div>
        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        <h1 className="text-xl font-bold text-slate-900">{title}</h1>
      </div>
      {right}
    </div>
  );
}
