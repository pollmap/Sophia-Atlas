"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Landmark,
  Menu,
  X,
  Search,
  BookOpen,
  Scroll,
  Atom,
  Crown,
  Palette,
  Users,
  Network,
  ChevronDown,
  Sun,
  Moon,
  ArrowLeftRight,
  Globe,
  Clock,
  Route,
} from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

// ── Types ──

interface DropdownChild {
  label: string;
  description: string;
  href: string;
}

interface NavGroup {
  kind: "group";
  label: string;
  icon: React.ReactNode;
  basePath: string;
  children: DropdownChild[];
}

interface NavLink {
  kind: "link";
  label: string;
  icon: React.ReactNode;
  href: string;
}

type NavEntry = NavGroup | NavLink;

// ── Navigation Data ──

const navEntries: NavEntry[] = [
  {
    kind: "link",
    label: "인드라망",
    icon: <Network className="w-4 h-4" />,
    href: "/connections",
  },
  {
    kind: "link",
    label: "세계지도",
    icon: <Globe className="w-4 h-4" />,
    href: "/map",
  },
  {
    kind: "link",
    label: "인물",
    icon: <Users className="w-4 h-4" />,
    href: "/persons",
  },
  {
    kind: "link",
    label: "비교",
    icon: <ArrowLeftRight className="w-4 h-4" />,
    href: "/compare",
  },
  {
    kind: "group",
    label: "탐색",
    icon: <BookOpen className="w-4 h-4" />,
    basePath: "/explore",
    children: [
      { label: "철학 타임라인", description: "시대별 철학사 흐름", href: "/philosophy/timeline" },
      { label: "영향관계 그래프", description: "사상가 간 영향 그래프", href: "/philosophy/graph" },
      { label: "근본질문", description: "철학의 핵심 물음들", href: "/philosophy/questions" },
      { label: "종교 분파트리", description: "종교 분파 계보", href: "/religion/tree" },
      { label: "종교 비교표", description: "종교 간 비교 매트릭스", href: "/religion/compare" },
      { label: "과학사 타임라인", description: "주요 발견과 발명", href: "/science/timeline" },
      { label: "역사 사건", description: "주요 역사적 사건", href: "/history/timeline" },
    ],
  },
  {
    kind: "link",
    label: "학습",
    icon: <Route className="w-4 h-4" />,
    href: "/learn",
  },
  {
    kind: "link",
    label: "검색",
    icon: <Search className="w-4 h-4" />,
    href: "/search",
  },
];

// ── Component ──

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setExpandedGroup(null);
  }, [pathname]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/" || pathname === "";
    const normalized = href.replace(/\/+$/, "");
    return pathname?.startsWith(normalized);
  };

  const isGroupActive = (basePath: string) => {
    return pathname?.startsWith(basePath);
  };

  const toggleMobileGroup = (label: string) => {
    setExpandedGroup((prev) => (prev === label ? null : label));
  };

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50",
          "glass-header",
          "transition-all duration-300",
          isScrolled && "shadow-sepia"
        )}
        style={{ height: '72px' }}
      >
        <div className="section-container h-full">
          <div className="flex items-center justify-between h-full">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="flex items-center justify-center w-9 h-9 rounded transition-colors duration-200 group-hover:opacity-80"
                style={{ backgroundColor: 'var(--gold-muted)', color: 'var(--gold)' }}
              >
                <Landmark className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span
                  className="text-lg font-semibold tracking-[0.08em] uppercase leading-tight"
                  style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", color: 'var(--ink-dark)' }}
                >
                  Sophia Atlas
                </span>
                <span
                  className="text-[10px] leading-none tracking-wider uppercase hidden sm:block"
                  style={{ fontFamily: "'Pretendard', sans-serif", color: 'var(--ink-faded)' }}
                >
                  인류 지성의 인드라망
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navEntries.map((entry) => {
                if (entry.kind === "link") {
                  return (
                    <Link
                      key={entry.href}
                      href={entry.href}
                      className={cn(
                        "flex items-center gap-2 px-3.5 py-2 rounded",
                        "text-sm font-medium transition-all duration-200",
                        isActive(entry.href)
                          ? "text-gold"
                          : "text-ink-medium hover:text-gold"
                      )}
                      style={{
                        fontFamily: "'Pretendard', sans-serif",
                        letterSpacing: '0.03em',
                        ...(isActive(entry.href) ? { borderBottom: '2px solid var(--gold)' } : {}),
                      }}
                    >
                      <span className={isActive(entry.href) ? "text-gold" : "text-ink-faded"}>
                        {entry.icon}
                      </span>
                      {entry.label}
                    </Link>
                  );
                }

                const groupActive = isGroupActive(entry.basePath);
                return (
                  <div key={entry.label} className="relative group">
                    <button
                      className={cn(
                        "flex items-center gap-2 px-3.5 py-2 rounded",
                        "text-sm font-medium transition-all duration-200",
                        groupActive
                          ? "text-gold"
                          : "text-ink-medium hover:text-gold"
                      )}
                      style={{
                        fontFamily: "'Pretendard', sans-serif",
                        letterSpacing: '0.03em',
                        ...(groupActive ? { borderBottom: '2px solid var(--gold)' } : {}),
                      }}
                    >
                      <span className={groupActive ? "text-gold" : "text-ink-faded"}>
                        {entry.icon}
                      </span>
                      {entry.label}
                      <ChevronDown className="w-3 h-3 transition-transform duration-200 group-hover:rotate-180" />
                    </button>

                    {/* Dropdown Panel */}
                    <div
                      className={cn(
                        "absolute top-full left-0 pt-2",
                        "opacity-0 invisible translate-y-1",
                        "group-hover:opacity-100 group-hover:visible group-hover:translate-y-0",
                        "transition-all duration-200"
                      )}
                    >
                      <div
                        className="w-56 rounded border py-1.5"
                        style={{
                          background: 'var(--fresco-parchment)',
                          borderColor: 'var(--fresco-shadow)',
                          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                        }}
                      >
                        {entry.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={cn(
                              "flex flex-col gap-0.5 px-4 py-2.5",
                              "transition-colors duration-150",
                              isActive(child.href)
                                ? "text-gold"
                                : "text-ink-medium hover:text-gold"
                            )}
                            style={{
                              ...(isActive(child.href) ? { backgroundColor: 'var(--gold-muted)' } : {}),
                            }}
                            onMouseEnter={(e) => {
                              if (!isActive(child.href)) {
                                (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--fresco-aged)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!isActive(child.href)) {
                                (e.currentTarget as HTMLElement).style.backgroundColor = '';
                              }
                            }}
                          >
                            <span className="text-sm font-medium">{child.label}</span>
                            <span className="text-xs" style={{ color: 'var(--ink-faded)' }}>{child.description}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </nav>

            {/* Theme Toggle + Mobile Menu Button */}
            <div className="flex items-center gap-1">
              {mounted && (
                <button
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="flex items-center justify-center w-9 h-9 rounded transition-all duration-200"
                  style={{ color: 'var(--ink-light)' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--gold)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--ink-light)'; }}
                  aria-label={theme === "dark" ? "라이트 모드" : "다크 모드"}
                >
                  {theme === "dark" ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
                </button>
              )}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="flex lg:hidden items-center justify-center w-9 h-9 rounded text-ink-medium hover:text-gold transition-all duration-200"
                aria-label={isMobileMenuOpen ? "메뉴 닫기" : "메뉴 열기"}
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 lg:hidden",
          "transition-all duration-300",
          isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      >
        <div
          className="absolute inset-0 bg-ink-dark/40 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />

        <div
          className={cn(
            "absolute top-0 right-0 h-full w-72 max-w-[85vw]",
            "border-l flex flex-col",
            "transform transition-transform duration-300 ease-out",
            isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
          )}
          style={{
            background: 'var(--fresco-parchment)',
            borderColor: 'var(--fresco-shadow)',
          }}
        >
          {/* Panel Header */}
          <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid var(--fresco-shadow)' }}>
            <div className="flex items-center gap-2">
              <Landmark className="w-5 h-5" style={{ color: 'var(--gold)' }} />
              <span className="font-semibold" style={{ color: 'var(--ink-dark)' }}>메뉴</span>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-center w-8 h-8 rounded text-ink-medium hover:text-gold transition-colors"
              aria-label="메뉴 닫기"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto py-4 px-3">
            <div className="space-y-1">
              {navEntries.map((entry, index) => {
                if (entry.kind === "link") {
                  return (
                    <Link
                      key={entry.href}
                      href={entry.href}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded",
                        "text-sm font-medium transition-all duration-200",
                        "animate-slide-down",
                        isActive(entry.href)
                          ? "text-gold"
                          : "text-ink-medium hover:text-gold"
                      )}
                      style={{
                        animationDelay: `${index * 50}ms`,
                        ...(isActive(entry.href) ? { backgroundColor: 'var(--gold-muted)' } : {}),
                      }}
                    >
                      <span className={isActive(entry.href) ? "text-gold" : "text-ink-faded"}>
                        {entry.icon}
                      </span>
                      {entry.label}
                      {isActive(entry.href) && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-gold" />
                      )}
                    </Link>
                  );
                }

                const groupActive = isGroupActive(entry.basePath);
                const isExpanded = expandedGroup === entry.label;

                return (
                  <div
                    key={entry.label}
                    className="animate-slide-down"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <button
                      onClick={() => toggleMobileGroup(entry.label)}
                      className={cn(
                        "flex items-center gap-3 w-full px-4 py-3 rounded",
                        "text-sm font-medium transition-all duration-200",
                        groupActive ? "text-gold" : "text-ink-medium hover:text-gold"
                      )}
                      style={groupActive ? { backgroundColor: 'var(--gold-muted)' } : {}}
                    >
                      <span className={groupActive ? "text-gold" : "text-ink-faded"}>
                        {entry.icon}
                      </span>
                      {entry.label}
                      <ChevronDown
                        className={cn(
                          "w-4 h-4 ml-auto transition-transform duration-200",
                          isExpanded && "rotate-180"
                        )}
                      />
                    </button>

                    <div
                      className={cn(
                        "overflow-hidden transition-all duration-200",
                        isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                      )}
                    >
                      <div className="pl-6 py-1 space-y-0.5">
                        {entry.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={cn(
                              "flex flex-col gap-0.5 px-4 py-2.5 rounded",
                              "transition-colors duration-150",
                              isActive(child.href) ? "text-gold" : "text-ink-medium hover:text-gold"
                            )}
                            style={isActive(child.href) ? { backgroundColor: 'var(--gold-muted)' } : {}}
                          >
                            <span className="text-sm font-medium">{child.label}</span>
                            <span className="text-xs" style={{ color: 'var(--ink-faded)' }}>{child.description}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </nav>
        </div>
      </div>

      {/* Spacer */}
      <div style={{ height: '72px' }} />
    </>
  );
}
