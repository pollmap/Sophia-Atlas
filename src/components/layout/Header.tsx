"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Landmark,
  Menu,
  X,
  Sun,
  Moon,
  Search,
  BookOpen,
  Scroll,
  Atom,
  Crown,
  Palette,
  Users,
  Network,
  ChevronDown,
} from "lucide-react";
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
    kind: "group",
    label: "철학",
    icon: <BookOpen className="w-4 h-4" />,
    basePath: "/philosophy",
    children: [
      { label: "타임라인", description: "시대별 철학사 흐름", href: "/philosophy/timeline" },
      { label: "영향관계", description: "사상가 간 영향 그래프", href: "/philosophy/graph" },
      { label: "근본질문", description: "철학의 핵심 물음들", href: "/philosophy/questions" },
    ],
  },
  {
    kind: "group",
    label: "종교",
    icon: <Scroll className="w-4 h-4" />,
    basePath: "/religion",
    children: [
      { label: "세계지도", description: "종교 분포 지도", href: "/religion/map" },
      { label: "분파트리", description: "종교 분파 계보", href: "/religion/tree" },
      { label: "비교표", description: "종교 간 비교 매트릭스", href: "/religion/compare" },
    ],
  },
  {
    kind: "group",
    label: "과학",
    icon: <Atom className="w-4 h-4" />,
    basePath: "/science",
    children: [
      { label: "과학 허브", description: "과학사 종합 탐색", href: "/science" },
      { label: "발견 타임라인", description: "주요 발견과 발명", href: "/science/timeline" },
      { label: "분야별 탐색", description: "물리, 화학, 생물 등", href: "/science/fields" },
    ],
  },
  {
    kind: "group",
    label: "역사",
    icon: <Crown className="w-4 h-4" />,
    basePath: "/history",
    children: [
      { label: "역사 허브", description: "역사 종합 탐색", href: "/history" },
      { label: "사건 타임라인", description: "주요 역사적 사건", href: "/history/timeline" },
      { label: "문명", description: "세계 문명 탐색", href: "/history/civilizations" },
    ],
  },
  {
    kind: "group",
    label: "문화",
    icon: <Palette className="w-4 h-4" />,
    basePath: "/culture",
    children: [
      { label: "문화 허브", description: "문화/예술 종합", href: "/culture" },
      { label: "사조", description: "예술 및 문화 사조", href: "/culture/movements" },
    ],
  },
  {
    kind: "link",
    label: "인물",
    icon: <Users className="w-4 h-4" />,
    href: "/persons",
  },
  {
    kind: "link",
    label: "인드라망",
    icon: <Network className="w-4 h-4" />,
    href: "/connections",
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
  const [isDark, setIsDark] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const pathname = usePathname();

  // Track scroll position for header shadow
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setExpandedGroup(null);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
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

  // Dark mode toggle
  const toggleTheme = () => {
    const html = document.documentElement;
    if (isDark) {
      html.classList.remove("dark");
      html.classList.add("light");
    } else {
      html.classList.remove("light");
      html.classList.add("dark");
    }
    setIsDark(!isDark);
  };

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/" || pathname === "";
    }
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
          "fixed top-0 left-0 right-0 z-50 h-16",
          "glass-header",
          "transition-all duration-300",
          isScrolled && "shadow-lg shadow-black/10"
        )}
      >
        <div className="section-container h-full">
          <div className="flex items-center justify-between h-full">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2.5 group"
            >
              <div
                className={cn(
                  "flex items-center justify-center w-9 h-9 rounded-lg",
                  "bg-accent/10 text-accent",
                  "group-hover:bg-accent/20 transition-colors duration-300",
                  "group-hover:shadow-md group-hover:shadow-accent/10"
                )}
              >
                <Landmark className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-tight text-foreground leading-tight">
                  Sophia Atlas
                </span>
                <span className="text-[10px] text-foreground-muted leading-none tracking-wider uppercase hidden sm:block">
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
                        "flex items-center gap-2 px-3.5 py-2 rounded-lg",
                        "text-sm font-medium transition-all duration-200",
                        isActive(entry.href)
                          ? "bg-accent/15 text-accent shadow-sm"
                          : "text-foreground-secondary hover:text-foreground hover:bg-background-tertiary/50"
                      )}
                    >
                      <span
                        className={cn(
                          "transition-colors duration-200",
                          isActive(entry.href)
                            ? "text-accent"
                            : "text-foreground-muted"
                        )}
                      >
                        {entry.icon}
                      </span>
                      {entry.label}
                    </Link>
                  );
                }

                // Dropdown group
                const groupActive = isGroupActive(entry.basePath);
                return (
                  <div key={entry.label} className="relative group">
                    <button
                      className={cn(
                        "flex items-center gap-2 px-3.5 py-2 rounded-lg",
                        "text-sm font-medium transition-all duration-200",
                        groupActive
                          ? "bg-accent/15 text-accent shadow-sm"
                          : "text-foreground-secondary hover:text-foreground hover:bg-background-tertiary/50"
                      )}
                    >
                      <span
                        className={cn(
                          "transition-colors duration-200",
                          groupActive ? "text-accent" : "text-foreground-muted"
                        )}
                      >
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
                        className={cn(
                          "w-56 rounded-xl border border-border",
                          "bg-background-secondary shadow-xl shadow-black/20",
                          "py-1.5"
                        )}
                      >
                        {entry.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={cn(
                              "flex flex-col gap-0.5 px-4 py-2.5",
                              "transition-colors duration-150",
                              isActive(child.href)
                                ? "bg-accent/10 text-accent"
                                : "text-foreground-secondary hover:text-foreground hover:bg-background-tertiary/50"
                            )}
                          >
                            <span className="text-sm font-medium">{child.label}</span>
                            <span className="text-xs text-foreground-muted">{child.description}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={cn(
                  "flex items-center justify-center w-9 h-9 rounded-lg",
                  "text-foreground-muted hover:text-foreground",
                  "hover:bg-background-tertiary/50",
                  "transition-all duration-200",
                  "focus-visible:ring-2 focus-visible:ring-accent"
                )}
                aria-label={isDark ? "라이트 모드로 전환" : "다크 모드로 전환"}
              >
                {isDark ? (
                  <Sun className="w-[18px] h-[18px] transition-transform duration-300 hover:rotate-45" />
                ) : (
                  <Moon className="w-[18px] h-[18px] transition-transform duration-300 hover:-rotate-12" />
                )}
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={cn(
                  "flex lg:hidden items-center justify-center w-9 h-9 rounded-lg",
                  "text-foreground-muted hover:text-foreground",
                  "hover:bg-background-tertiary/50",
                  "transition-all duration-200"
                )}
                aria-label={isMobileMenuOpen ? "메뉴 닫기" : "메뉴 열기"}
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
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
          isMobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        )}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />

        {/* Slide-out Panel */}
        <div
          className={cn(
            "absolute top-0 right-0 h-full w-72 max-w-[85vw]",
            "bg-background-secondary border-l border-border",
            "transform transition-transform duration-300 ease-out",
            "flex flex-col",
            isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
          )}
        >
          {/* Panel Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Landmark className="w-5 h-5 text-accent" />
              <span className="font-semibold text-foreground">메뉴</span>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-background-tertiary/50 text-foreground-muted hover:text-foreground transition-colors"
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
                        "flex items-center gap-3 px-4 py-3 rounded-lg",
                        "text-sm font-medium transition-all duration-200",
                        "animate-slide-down",
                        isActive(entry.href)
                          ? "bg-accent/15 text-accent"
                          : "text-foreground-secondary hover:text-foreground hover:bg-background-tertiary/50"
                      )}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <span
                        className={cn(
                          isActive(entry.href)
                            ? "text-accent"
                            : "text-foreground-muted"
                        )}
                      >
                        {entry.icon}
                      </span>
                      {entry.label}
                      {isActive(entry.href) && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-accent" />
                      )}
                    </Link>
                  );
                }

                // Mobile accordion group
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
                        "flex items-center gap-3 w-full px-4 py-3 rounded-lg",
                        "text-sm font-medium transition-all duration-200",
                        groupActive
                          ? "bg-accent/15 text-accent"
                          : "text-foreground-secondary hover:text-foreground hover:bg-background-tertiary/50"
                      )}
                    >
                      <span
                        className={cn(
                          groupActive ? "text-accent" : "text-foreground-muted"
                        )}
                      >
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

                    {/* Accordion children */}
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
                              "flex flex-col gap-0.5 px-4 py-2.5 rounded-lg",
                              "transition-colors duration-150",
                              isActive(child.href)
                                ? "bg-accent/10 text-accent"
                                : "text-foreground-secondary hover:text-foreground hover:bg-background-tertiary/50"
                            )}
                          >
                            <span className="text-sm font-medium">{child.label}</span>
                            <span className="text-xs text-foreground-muted">{child.description}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </nav>

          {/* Panel Footer */}
          <div className="p-4 border-t border-border">
            <button
              onClick={toggleTheme}
              className={cn(
                "flex items-center gap-3 w-full px-4 py-3 rounded-lg",
                "text-sm font-medium text-foreground-secondary",
                "hover:text-foreground hover:bg-background-tertiary/50",
                "transition-all duration-200"
              )}
            >
              {isDark ? (
                <>
                  <Sun className="w-4 h-4 text-foreground-muted" />
                  라이트 모드로 전환
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-foreground-muted" />
                  다크 모드로 전환
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Spacer to prevent content from hiding behind fixed header */}
      <div className="h-16" />
    </>
  );
}
