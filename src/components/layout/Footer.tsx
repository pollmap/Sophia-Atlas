"use client";

import Link from "next/link";
import { Github, Heart, ExternalLink } from "lucide-react";

const footerLinks = [
  { label: "About", href: "/about" },
  { label: "인물 탐색", href: "/persons" },
  { label: "인드라망", href: "/connections" },
];

const sectionLinks = [
  { label: "철학", href: "/philosophy/timeline" },
  { label: "종교", href: "/religion/map" },
  { label: "과학", href: "/science" },
  { label: "역사", href: "/history" },
  { label: "문화", href: "/culture" },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="relative mt-auto"
      style={{
        background: 'linear-gradient(180deg, var(--fresco-parchment), var(--fresco-aged))',
        borderTop: '3px solid var(--gold)',
        color: 'var(--ink-medium)',
      }}
    >
      <div className="section-container">
        {/* Main Footer Content */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded flex items-center justify-center"
                style={{ backgroundColor: 'var(--gold-muted)' }}
              >
                <span style={{ color: 'var(--gold)', fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: '14px' }}>SA</span>
              </div>
              <span
                className="font-semibold text-lg tracking-[0.05em] uppercase"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", color: 'var(--ink-dark)' }}
              >
                Sophia Atlas
              </span>
            </div>
            <p className="text-sm leading-relaxed max-w-xs" style={{ color: 'var(--ink-light)' }}>
              인류의 위대한 사상과 지혜를 탐험하는 인터랙티브 아카이브.
              철학 · 종교 · 과학 · 역사 · 문화의 연결고리를 발견하세요.
            </p>
          </div>

          {/* Links Column */}
          <div className="space-y-3">
            <h3
              className="text-xs font-semibold uppercase tracking-[0.1em]"
              style={{ fontFamily: "'Pretendard', sans-serif", color: 'var(--gold)' }}
            >
              탐색
            </h3>
            <ul className="space-y-2">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm hover-underline inline-block transition-colors duration-200"
                    style={{ color: 'var(--ink-light)' }}
                    onMouseEnter={(e) => { (e.target as HTMLElement).style.color = 'var(--gold)'; }}
                    onMouseLeave={(e) => { (e.target as HTMLElement).style.color = 'var(--ink-light)'; }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Sections Column */}
          <div className="space-y-3">
            <h3
              className="text-xs font-semibold uppercase tracking-[0.1em]"
              style={{ fontFamily: "'Pretendard', sans-serif", color: 'var(--gold)' }}
            >
              영역
            </h3>
            <ul className="space-y-2">
              {sectionLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm hover-underline inline-block transition-colors duration-200"
                    style={{ color: 'var(--ink-light)' }}
                    onMouseEnter={(e) => { (e.target as HTMLElement).style.color = 'var(--gold)'; }}
                    onMouseLeave={(e) => { (e.target as HTMLElement).style.color = 'var(--ink-light)'; }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Project Column */}
          <div className="space-y-3">
            <h3
              className="text-xs font-semibold uppercase tracking-[0.1em]"
              style={{ fontFamily: "'Pretendard', sans-serif", color: 'var(--gold)' }}
            >
              프로젝트
            </h3>
            <div className="space-y-3">
              <a
                href="https://github.com/pollmap/Sophia-Atlas"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm group transition-colors duration-200"
                style={{ color: 'var(--ink-light)' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--ink-dark)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--ink-light)'; }}
              >
                <Github className="w-4 h-4" />
                <span>GitHub에서 보기</span>
                <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>

              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium"
                  style={{
                    background: 'var(--gold-muted)',
                    color: 'var(--gold)',
                    border: '1px solid rgba(184, 134, 11, 0.2)',
                    fontFamily: "'Pretendard', sans-serif",
                  }}
                >
                  오픈소스
                </span>
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium"
                  style={{
                    background: 'rgba(156, 139, 115, 0.1)',
                    color: 'var(--ink-light)',
                    border: '1px solid rgba(156, 139, 115, 0.2)',
                    fontFamily: "'Pretendard', sans-serif",
                  }}
                >
                  CC BY-SA 4.0
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(184, 134, 11, 0.3), transparent)' }} />

        {/* Bottom Bar */}
        <div className="py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs" style={{ color: 'var(--ink-faded)' }}>
            &copy; {currentYear} Sophia Atlas. All rights reserved.
          </p>
          <p className="text-xs flex items-center gap-1" style={{ color: 'var(--ink-faded)' }}>
            <span>지혜를 향한 여정에</span>
            <Heart className="w-3 h-3 inline" style={{ color: 'var(--cat-historical)', fill: 'var(--cat-historical)' }} />
            <span>을 담아 제작되었습니다</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
