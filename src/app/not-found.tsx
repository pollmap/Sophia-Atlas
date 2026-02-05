import Link from 'next/link';
import { Landmark, ArrowLeft, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: 'var(--fresco-ivory)' }}
    >
      <div className="text-center max-w-md">
        <div
          className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-6"
          style={{ backgroundColor: 'var(--gold-muted)' }}
        >
          <Landmark className="w-8 h-8" style={{ color: 'var(--gold)' }} />
        </div>

        <h1
          className="text-6xl font-bold mb-2"
          style={{ color: 'var(--ink-dark)', fontFamily: "'Cormorant Garamond', serif" }}
        >
          404
        </h1>
        <h2
          className="text-xl font-semibold mb-3"
          style={{ color: 'var(--ink-dark)', fontFamily: "'Cormorant Garamond', serif" }}
        >
          페이지를 찾을 수 없습니다
        </h2>
        <p className="text-sm mb-8" style={{ color: 'var(--ink-light)' }}>
          요청하신 페이지가 존재하지 않거나 이동되었습니다.
          <br />
          인드라망의 다른 길을 탐색해 보세요.
        </p>

        <div className="flex items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded text-sm font-medium transition-colors"
            style={{
              backgroundColor: 'var(--gold)',
              color: 'var(--fresco-ivory)',
            }}
          >
            <ArrowLeft className="w-4 h-4" />
            홈으로
          </Link>
          <Link
            href="/search"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded text-sm font-medium transition-colors"
            style={{
              backgroundColor: 'var(--fresco-parchment)',
              color: 'var(--ink-medium)',
              border: '1px solid var(--fresco-shadow)',
            }}
          >
            <Search className="w-4 h-4" />
            검색하기
          </Link>
        </div>
      </div>
    </div>
  );
}
