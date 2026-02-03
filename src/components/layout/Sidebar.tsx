"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  ChevronRight,
  BookOpen,
  Scroll,
  Users,
  Globe,
  Sparkles,
  Brain,
  Scale,
  Lightbulb,
  Flame,
  TreePine,
  Church,
  Moon,
  Star,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarSection {
  title: string;
  icon: React.ReactNode;
  basePath: string;
  items: { label: string; href: string; icon: React.ReactNode }[];
}

const philosophySections: SidebarSection[] = [
  {
    title: "시대별 철학",
    icon: <BookOpen className="w-4 h-4" />,
    basePath: "/philosophy",
    items: [
      { label: "고대 철학", href: "/philosophy/ancient", icon: <Sparkles className="w-3.5 h-3.5" /> },
      { label: "중세 철학", href: "/philosophy/medieval", icon: <Scale className="w-3.5 h-3.5" /> },
      { label: "근대 철학", href: "/philosophy/modern", icon: <Lightbulb className="w-3.5 h-3.5" /> },
      { label: "현대 철학", href: "/philosophy/contemporary", icon: <Brain className="w-3.5 h-3.5" /> },
    ],
  },
  {
    title: "주요 철학자",
    icon: <Users className="w-4 h-4" />,
    basePath: "/philosophy/thinkers",
    items: [
      { label: "소크라테스", href: "/philosophy/thinkers/socrates", icon: <Sparkles className="w-3.5 h-3.5" /> },
      { label: "플라톤", href: "/philosophy/thinkers/plato", icon: <Sparkles className="w-3.5 h-3.5" /> },
      { label: "아리스토텔레스", href: "/philosophy/thinkers/aristotle", icon: <Sparkles className="w-3.5 h-3.5" /> },
      { label: "칸트", href: "/philosophy/thinkers/kant", icon: <Lightbulb className="w-3.5 h-3.5" /> },
      { label: "니체", href: "/philosophy/thinkers/nietzsche", icon: <Flame className="w-3.5 h-3.5" /> },
    ],
  },
];

const mythologySections: SidebarSection[] = [
  {
    title: "세계 신화",
    icon: <Globe className="w-4 h-4" />,
    basePath: "/mythology",
    items: [
      { label: "그리스 신화", href: "/mythology/greek", icon: <Sparkles className="w-3.5 h-3.5" /> },
      { label: "북유럽 신화", href: "/mythology/norse", icon: <TreePine className="w-3.5 h-3.5" /> },
      { label: "이집트 신화", href: "/mythology/egyptian", icon: <Star className="w-3.5 h-3.5" /> },
      { label: "동아시아 신화", href: "/mythology/east-asian", icon: <Moon className="w-3.5 h-3.5" /> },
    ],
  },
  {
    title: "세계 종교",
    icon: <Scroll className="w-4 h-4" />,
    basePath: "/mythology/religions",
    items: [
      { label: "기독교", href: "/mythology/religions/christianity", icon: <Church className="w-3.5 h-3.5" /> },
      { label: "불교", href: "/mythology/religions/buddhism", icon: <Sparkles className="w-3.5 h-3.5" /> },
      { label: "이슬람", href: "/mythology/religions/islam", icon: <Moon className="w-3.5 h-3.5" /> },
      { label: "힌두교", href: "/mythology/religions/hinduism", icon: <Flame className="w-3.5 h-3.5" /> },
    ],
  },
];

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  // Determine which sections to show based on current path
  const isPhilosophy = pathname?.includes("/philosophy");
  const isMythology = pathname?.includes("/mythology");
  const sections = isPhilosophy
    ? philosophySections
    : isMythology
    ? mythologySections
    : [...philosophySections, ...mythologySections];

  // Auto-expand sections that contain the current route
  useEffect(() => {
    const activeSection = sections.find((section) =>
      section.items.some((item) => pathname?.includes(item.href))
    );
    if (activeSection && !expandedSections.includes(activeSection.title)) {
      setExpandedSections((prev) => [...prev, activeSection.title]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const toggleSection = (title: string) => {
    setExpandedSections((prev) =>
      prev.includes(title)
        ? prev.filter((t) => t !== title)
        : [...prev, title]
    );
  };

  const isItemActive = (href: string) => {
    return pathname === href || pathname === `${href}/`;
  };

  return (
    <aside
      className={cn(
        "sticky top-16 h-[calc(100vh-4rem)]",
        "border-r border-border bg-background-secondary/30",
        "transition-all duration-300 ease-out",
        "overflow-hidden flex flex-col",
        isCollapsed ? "w-16" : "w-64",
        className
      )}
    >
      {/* Collapse Toggle */}
      <div className="flex items-center justify-end p-3 border-b border-border/50">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "flex items-center justify-center w-8 h-8 rounded-lg",
            "text-foreground-muted hover:text-foreground",
            "hover:bg-background-tertiary/50",
            "transition-all duration-200"
          )}
          aria-label={isCollapsed ? "사이드바 펼치기" : "사이드바 접기"}
        >
          {isCollapsed ? (
            <PanelLeftOpen className="w-4 h-4" />
          ) : (
            <PanelLeftClose className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto scrollbar-hide py-3">
        {isCollapsed ? (
          /* Collapsed: Show icons only */
          <div className="flex flex-col items-center gap-2 px-2">
            {sections.map((section) => (
              <div key={section.title} className="relative group">
                <button
                  onClick={() => {
                    setIsCollapsed(false);
                    if (!expandedSections.includes(section.title)) {
                      toggleSection(section.title);
                    }
                  }}
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-lg",
                    "text-foreground-muted hover:text-foreground",
                    "hover:bg-background-tertiary/50",
                    "transition-all duration-200"
                  )}
                >
                  {section.icon}
                </button>
                {/* Tooltip */}
                <div
                  className={cn(
                    "absolute left-full top-1/2 -translate-y-1/2 ml-2",
                    "px-2.5 py-1.5 rounded-md text-xs font-medium",
                    "bg-background-tertiary text-foreground",
                    "whitespace-nowrap shadow-lg",
                    "opacity-0 invisible group-hover:opacity-100 group-hover:visible",
                    "transition-all duration-200 pointer-events-none",
                    "z-50"
                  )}
                >
                  {section.title}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Expanded: Show full navigation */
          <div className="space-y-1 px-3">
            {sections.map((section) => {
              const isExpanded = expandedSections.includes(section.title);

              return (
                <div key={section.title} className="space-y-0.5">
                  {/* Section Header */}
                  <button
                    onClick={() => toggleSection(section.title)}
                    className={cn(
                      "flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg",
                      "text-sm font-semibold text-foreground-secondary",
                      "hover:text-foreground hover:bg-background-tertiary/40",
                      "transition-all duration-200"
                    )}
                  >
                    <span className="text-foreground-muted">{section.icon}</span>
                    <span className="flex-1 text-left">{section.title}</span>
                    <span
                      className={cn(
                        "text-foreground-muted transition-transform duration-200",
                        isExpanded && "rotate-0",
                        !isExpanded && "-rotate-90"
                      )}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </span>
                  </button>

                  {/* Section Items */}
                  <div
                    className={cn(
                      "overflow-hidden transition-all duration-300 ease-out",
                      isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                    )}
                  >
                    <div className="ml-3 pl-3 border-l border-border/50 space-y-0.5 py-1">
                      {section.items.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            "flex items-center gap-2.5 px-3 py-2 rounded-md",
                            "text-sm transition-all duration-200",
                            isItemActive(item.href)
                              ? "bg-accent/10 text-accent font-medium"
                              : "text-foreground-muted hover:text-foreground hover:bg-background-tertiary/30"
                          )}
                        >
                          <span
                            className={cn(
                              isItemActive(item.href)
                                ? "text-accent"
                                : "text-foreground-muted/70"
                            )}
                          >
                            {item.icon}
                          </span>
                          <span>{item.label}</span>
                          {isItemActive(item.href) && (
                            <ChevronRight className="w-3 h-3 ml-auto text-accent" />
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Section (Expanded only) */}
      {!isCollapsed && (
        <div className="p-3 border-t border-border/50">
          <p className="text-[11px] text-foreground-muted/60 text-center">
            지혜의 지도를 탐험하세요
          </p>
        </div>
      )}
    </aside>
  );
}
