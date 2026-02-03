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
  Home,
  BookOpen,
  Scroll,
  Route,
  Info,
  Network,
} from "lucide-react";
import { cn } from "@/lib/utils";

const BASE_PATH = "/Sophia-Atlas";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { label: "홈", href: "/", icon: <Home className="w-4 h-4" /> },
  { label: "철학", href: "/philosophy/timeline", icon: <BookOpen className="w-4 h-4" /> },
  { label: "신화/종교", href: "/religion/map", icon: <Scroll className="w-4 h-4" /> },
  { label: "인드라망", href: "/connections", icon: <Network className="w-4 h-4" /> },
  { label: "검색", href: "/search", icon: <Search className="w-4 h-4" /> },
  { label: "학습경로", href: "/learn", icon: <Route className="w-4 h-4" /> },
  { label: "About", href: "/about", icon: <Info className="w-4 h-4" /> },
];

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
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
    const fullPath = `${BASE_PATH}${href}`;
    if (href === "/") {
      return pathname === fullPath || pathname === `${fullPath}/` || pathname === BASE_PATH;
    }
    // Match parent paths (e.g., /philosophy/timeline matches /philosophy/*)
    const basePath = href.split("/").slice(0, 2).join("/");
    const fullBasePath = `${BASE_PATH}${basePath}`;
    return pathname?.startsWith(fullBasePath);
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
              href={`${BASE_PATH}/`}
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
                  인류 사상의 지도
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={`${BASE_PATH}${item.href}`}
                  className={cn(
                    "flex items-center gap-2 px-3.5 py-2 rounded-lg",
                    "text-sm font-medium transition-all duration-200",
                    isActive(item.href)
                      ? "bg-accent/15 text-accent shadow-sm"
                      : "text-foreground-secondary hover:text-foreground hover:bg-background-tertiary/50"
                  )}
                >
                  <span
                    className={cn(
                      "transition-colors duration-200",
                      isActive(item.href)
                        ? "text-accent"
                        : "text-foreground-muted"
                    )}
                  >
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              ))}
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
              {navItems.map((item, index) => (
                <Link
                  key={item.href}
                  href={`${BASE_PATH}${item.href}`}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg",
                    "text-sm font-medium transition-all duration-200",
                    "animate-slide-down",
                    isActive(item.href)
                      ? "bg-accent/15 text-accent"
                      : "text-foreground-secondary hover:text-foreground hover:bg-background-tertiary/50"
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <span
                    className={cn(
                      isActive(item.href)
                        ? "text-accent"
                        : "text-foreground-muted"
                    )}
                  >
                    {item.icon}
                  </span>
                  {item.label}
                  {isActive(item.href) && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-accent" />
                  )}
                </Link>
              ))}
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
