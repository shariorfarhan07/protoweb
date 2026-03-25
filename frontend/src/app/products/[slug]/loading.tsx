export default function ProductLoading() {
  return (
    <div className="max-w-7xl mx-auto px-8 py-10">
      <div className="skeleton h-4 w-48 rounded mb-8" />
      <div className="flex gap-14">
        <div className="skeleton rounded-card flex-shrink-0" style={{ width: 480, height: 480 }} />
        <div className="flex-1 space-y-4">
          <div className="skeleton h-4 w-24 rounded" />
          <div className="skeleton h-10 w-3/4 rounded" />
          <div className="skeleton h-4 w-full rounded" />
          <div className="skeleton h-4 w-2/3 rounded" />
          <div className="skeleton h-12 w-1/3 rounded-pill mt-4" />
          <div className="skeleton h-12 w-full rounded-pill" />
        </div>
      </div>
    </div>
  );
}
