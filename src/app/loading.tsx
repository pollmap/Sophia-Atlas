export default function Loading() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: 'var(--fresco-ivory)' }}
    >
      <div className="text-center">
        <div className="relative w-12 h-12 mx-auto mb-4">
          <div
            className="absolute inset-0 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: 'var(--fresco-shadow)', borderTopColor: 'var(--gold)' }}
          />
        </div>
        <p className="text-sm" style={{ color: 'var(--ink-light)' }}>
          불러오는 중...
        </p>
      </div>
    </div>
  );
}
