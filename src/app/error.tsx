'use client';

import { Landmark, RefreshCw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: 'var(--fresco-ivory)' }}
    >
      <div className="text-center max-w-md">
        <div
          className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-6"
          style={{ backgroundColor: 'rgba(139, 64, 64, 0.1)' }}
        >
          <Landmark className="w-8 h-8" style={{ color: '#8B4040' }} />
        </div>

        <h2
          className="text-2xl font-bold mb-3"
          style={{ color: 'var(--ink-dark)', fontFamily: "'Cormorant Garamond', serif" }}
        >
          오류가 발생했습니다
        </h2>
        <p className="text-sm mb-6" style={{ color: 'var(--ink-light)' }}>
          페이지를 불러오는 중 문제가 발생했습니다.
          <br />
          다시 시도하거나 홈으로 돌아가 주세요.
        </p>

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded text-sm font-medium transition-colors"
            style={{
              backgroundColor: 'var(--gold)',
              color: 'var(--fresco-ivory)',
            }}
          >
            <RefreshCw className="w-4 h-4" />
            다시 시도
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded text-sm font-medium transition-colors"
            style={{
              backgroundColor: 'var(--fresco-parchment)',
              color: 'var(--ink-medium)',
              border: '1px solid var(--fresco-shadow)',
            }}
          >
            <ArrowLeft className="w-4 h-4" />
            홈으로
          </Link>
        </div>
      </div>
    </div>
  );
}
