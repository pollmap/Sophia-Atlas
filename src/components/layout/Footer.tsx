"use client";

import Link from "next/link";
import { Github, Heart, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

const footerLinks = [
  { label: "About", href: "/about" },
  { label: "인물 탐색", href: "/persons" },
  { label: "학습경로", href: "/learn" },
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
    <footer className="relative mt-auto border-t border-border bg-background-secondary/50">
      {/* Decorative top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />

      <div className="section-container">
        {/* Main Footer Content */}
        <div className="py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                <span className="text-accent font-bold text-sm">SA</span>
              </div>
              <span className="font-bold text-foreground text-lg">Sophia Atlas</span>
            </div>
            <p className="text-foreground-muted text-sm leading-relaxed max-w-xs">
              인류의 위대한 사상과 지혜를 탐험하는 인터랙티브 플랫폼.
              철학 · 종교 · 과학 · 역사 · 문화의 연결고리를 발견하세요.
            </p>
          </div>

          {/* Links Column */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
              탐색
            </h3>
            <ul className="space-y-2">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      "text-sm text-foreground-muted",
                      "hover:text-accent transition-colors duration-200",
                      "hover-underline inline-block"
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Sections Column */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
              영역
            </h3>
            <ul className="space-y-2">
              {sectionLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      "text-sm text-foreground-muted",
                      "hover:text-accent transition-colors duration-200",
                      "hover-underline inline-block"
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Tech & Social Column */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
              프로젝트
            </h3>
            <div className="space-y-3">
              {/* GitHub Link */}
              <a
                href="https://github.com/pollmap/Sophia-Atlas"
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "inline-flex items-center gap-2 text-sm",
                  "text-foreground-muted hover:text-foreground",
                  "transition-colors duration-200 group"
                )}
              >
                <Github className="w-4 h-4" />
                <span>GitHub에서 보기</span>
                <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>

              {/* Built With Badge */}
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1",
                    "rounded-full text-xs font-medium",
                    "bg-background-tertiary/50 text-foreground-muted",
                    "border border-border"
                  )}
                >
                  <svg
                    className="w-3.5 h-3.5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M11.572 0c-.176 0-.31.001-.358.007a19.76 19.76 0 0 1-.364.033C7.443.346 4.25 2.185 2.228 5.012a11.875 11.875 0 0 0-2.119 5.243c-.096.659-.108.854-.108 1.747s.012 1.089.108 1.748c.652 4.506 3.86 8.292 8.209 9.695.779.253 1.621.421 2.465.49.12.01.18.013.265.015h.263c1.032 0 2.154-.161 3.19-.465.116-.034.131-.043.127-.071l-.014-.09-.002-.012-.009-.06a573.894 573.894 0 0 0-.076-.487l-.04-.252-.071-.452c-.01-.065-.02-.098-.046-.112a.506.506 0 0 0-.105-.022l-.164-.003H14.3c-.27 0-.545-.008-.812-.035a5.141 5.141 0 0 1-.592-.1 4.03 4.03 0 0 1-2.098-1.285c-.258-.318-.46-.677-.613-1.065l-.063-.165-.073-.196-.084-.237a2.26 2.26 0 0 0-.098-.26l-.031-.07-.018-.04-.025-.053-.024-.048-.032-.06-.045-.077-.034-.053-.046-.067-.051-.069-.054-.065-.067-.073-.061-.062-.08-.074-.08-.066-.094-.07-.096-.065-.1-.061-.1-.054-.107-.049-.11-.041-.116-.032-.124-.024-.13-.015-.14-.006h-.158c-.19.008-.369.035-.548.077a2.404 2.404 0 0 0-.916.453 2.378 2.378 0 0 0-.808 1.119c-.069.207-.103.432-.103.66a2.14 2.14 0 0 0 .067.508l.016.061c.056.204.14.399.245.582.31.542.832.918 1.42 1.02.146.024.296.035.448.028a2.02 2.02 0 0 0 .617-.116 1.97 1.97 0 0 0 .875-.64c.105-.127.2-.268.264-.42.027-.062.044-.095.065-.14l.037-.086.05-.12.02-.053c.01-.026.013-.037.013-.045l.002-.014v-.002-.002l-.002-.006-.007-.014-.003-.005-.007-.01-.01-.012-.008-.007-.012-.007-.011-.004-.015-.002h-.014l-.017.004-.016.009-.014.013-.013.018-.012.025-.013.034-.015.046-.047.159a2.56 2.56 0 0 1-.222.527 2.14 2.14 0 0 1-.459.533c-.118.1-.24.183-.37.249-.132.066-.274.115-.424.146-.147.03-.282.043-.422.044-.14.001-.284-.011-.428-.044a1.62 1.62 0 0 1-.828-.507 1.59 1.59 0 0 1-.349-.717 1.74 1.74 0 0 1-.028-.498c.012-.163.051-.322.12-.47a1.67 1.67 0 0 1 .553-.645c.14-.103.296-.178.462-.224a2.16 2.16 0 0 1 .586-.064c.146.004.289.02.428.054" />
                  </svg>
                  Next.js로 제작
                </span>
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1",
                    "rounded-full text-xs font-medium",
                    "bg-background-tertiary/50 text-foreground-muted",
                    "border border-border"
                  )}
                >
                  오픈소스
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-5 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-foreground-muted">
            &copy; {currentYear} Sophia Atlas. All rights reserved.
          </p>
          <p className="text-xs text-foreground-muted flex items-center gap-1">
            <span>지혜를 향한 여정에</span>
            <Heart className="w-3 h-3 text-red-400 fill-red-400 inline" />
            <span>을 담아 제작되었습니다</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
