"use client";

import { useState } from "react";
import Link from "next/link";
import {
  GitBranch,
  ChevronDown,
  ChevronRight,
  Calendar,
  ArrowLeft,
} from "lucide-react";
import religionsData from "@/data/religions.json";
import { cn, formatYear } from "@/lib/utils";

const BASE_PATH = "/Sophia-Atlas";

interface Branch {
  name: string;
  year?: number;
  description: string;
  children?: Branch[];
}

interface Religion {
  id: string;
  name: { ko: string; en: string };
  type: string;
  branches?: Branch[];
  origin: { year: number; location: string };
}

const religionColors: Record<string, { bg: string; border: string; text: string; line: string }> = {
  christianity: {
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
    text: "text-blue-400",
    line: "bg-blue-500/30",
  },
  islam: {
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    text: "text-emerald-400",
    line: "bg-emerald-500/30",
  },
  buddhism: {
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    text: "text-amber-400",
    line: "bg-amber-500/30",
  },
  hinduism: {
    bg: "bg-orange-500/10",
    border: "border-orange-500/30",
    text: "text-orange-400",
    line: "bg-orange-500/30",
  },
  judaism: {
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/30",
    text: "text-indigo-400",
    line: "bg-indigo-500/30",
  },
  confucianism: {
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    text: "text-red-400",
    line: "bg-red-500/30",
  },
};

const defaultColor = {
  bg: "bg-purple-500/10",
  border: "border-purple-500/30",
  text: "text-purple-400",
  line: "bg-purple-500/30",
};

function BranchNode({
  branch,
  depth,
  isLast,
  colors,
  expandedNodes,
  toggleNode,
  parentPath,
}: {
  branch: Branch;
  depth: number;
  isLast: boolean;
  colors: typeof defaultColor;
  expandedNodes: Set<string>;
  toggleNode: (path: string) => void;
  parentPath: string;
}) {
  const nodePath = `${parentPath}/${branch.name}`;
  const hasChildren = branch.children && branch.children.length > 0;
  const isExpanded = expandedNodes.has(nodePath);

  return (
    <div className="relative">
      {/* Connecting line from parent */}
      {depth > 0 && (
        <>
          {/* Vertical line */}
          <div
            className={cn("absolute left-[-20px] top-0 w-0.5 h-6", colors.line)}
          />
          {/* Horizontal line */}
          <div
            className={cn("absolute left-[-20px] top-6 w-5 h-0.5", colors.line)}
          />
          {/* Continue vertical line if not last */}
          {!isLast && (
            <div
              className={cn(
                "absolute left-[-20px] top-6 w-0.5 h-full",
                colors.line
              )}
            />
          )}
        </>
      )}

      {/* Node card */}
      <div
        className={cn(
          "border rounded-xl p-4 mb-3 transition-all duration-200",
          colors.bg,
          colors.border,
          hasChildren && "cursor-pointer hover:shadow-md"
        )}
        onClick={() => hasChildren && toggleNode(nodePath)}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className={cn("font-semibold text-sm", colors.text)}>
                {branch.name}
              </h3>
              {branch.year !== undefined && (
                <span className="flex items-center gap-1 text-xs text-foreground-muted">
                  <Calendar className="w-3 h-3" />
                  {formatYear(branch.year)}
                </span>
              )}
            </div>
            <p className="text-xs text-foreground-secondary leading-relaxed">
              {branch.description}
            </p>
          </div>
          {hasChildren && (
            <div className={cn("flex-shrink-0 mt-1", colors.text)}>
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="ml-5 pl-5 relative">
          {branch.children!.map((child, idx) => (
            <BranchNode
              key={child.name}
              branch={child}
              depth={depth + 1}
              isLast={idx === branch.children!.length - 1}
              colors={colors}
              expandedNodes={expandedNodes}
              toggleNode={toggleNode}
              parentPath={nodePath}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ReligionTreePage() {
  const religionsWithBranches = religionsData.filter(
    (r) => r.branches && r.branches.length > 0
  ) as Religion[];

  const [selectedId, setSelectedId] = useState<string>(
    religionsWithBranches[0]?.id || ""
  );
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const selectedReligion = religionsWithBranches.find(
    (r) => r.id === selectedId
  );
  const colors = religionColors[selectedId] || defaultColor;

  const toggleNode = (path: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const expandAll = () => {
    if (!selectedReligion?.branches) return;
    const paths = new Set<string>();
    const walk = (branches: Branch[], parentPath: string) => {
      branches.forEach((b) => {
        const path = `${parentPath}/${b.name}`;
        paths.add(path);
        if (b.children) walk(b.children, path);
      });
    };
    walk(selectedReligion.branches, selectedId);
    setExpandedNodes(paths);
  };

  const collapseAll = () => {
    setExpandedNodes(new Set());
  };

  return (
    <div className="section-container py-8 md:py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400">
            <GitBranch className="w-5 h-5" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            종교 분파 트리
          </h1>
        </div>
        <p className="text-foreground-secondary max-w-2xl">
          주요 종교들의 분파와 갈래를 트리 구조로 탐색해보세요. 각 분파의 시작
          연도와 설명을 확인할 수 있습니다.
        </p>
      </div>

      {/* Religion Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {religionsWithBranches.map((religion) => {
          const rColors = religionColors[religion.id] || defaultColor;
          const isActive = selectedId === religion.id;
          return (
            <button
              key={religion.id}
              onClick={() => {
                setSelectedId(religion.id);
                setExpandedNodes(new Set());
              }}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border",
                isActive
                  ? cn(rColors.bg, rColors.border, rColors.text)
                  : "bg-background-secondary text-foreground-secondary border-transparent hover:text-foreground hover:bg-background-secondary/80"
              )}
            >
              {religion.name.ko}
            </button>
          );
        })}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={expandAll}
          className="px-3 py-1.5 text-xs rounded-lg bg-background-secondary text-foreground-secondary hover:text-foreground transition-colors border border-border"
        >
          전체 펼치기
        </button>
        <button
          onClick={collapseAll}
          className="px-3 py-1.5 text-xs rounded-lg bg-background-secondary text-foreground-secondary hover:text-foreground transition-colors border border-border"
        >
          전체 접기
        </button>
      </div>

      {/* Tree View */}
      {selectedReligion && (
        <div className="border border-border rounded-2xl bg-background-secondary/20 p-6 overflow-x-auto">
          {/* Root Node */}
          <div
            className={cn(
              "border-2 rounded-xl p-5 mb-6 text-center",
              colors.bg,
              colors.border
            )}
          >
            <h2 className={cn("text-xl font-bold mb-1", colors.text)}>
              {selectedReligion.name.ko}
            </h2>
            <p className="text-sm text-foreground-muted">
              {selectedReligion.name.en} | {formatYear(selectedReligion.origin.year)}
            </p>
          </div>

          {/* Vertical connecting line from root */}
          <div className="flex justify-center mb-4">
            <div className={cn("w-0.5 h-8", colors.line)} />
          </div>

          {/* Branches */}
          <div className="ml-4 pl-4 relative">
            {/* Long vertical line */}
            <div
              className={cn(
                "absolute left-0 top-0 w-0.5",
                colors.line
              )}
              style={{
                height: `calc(100% - 20px)`,
              }}
            />
            {selectedReligion.branches!.map((branch, idx) => (
              <div key={branch.name} className="relative">
                {/* Horizontal connector */}
                <div
                  className={cn(
                    "absolute left-0 top-6 w-4 h-0.5",
                    colors.line
                  )}
                />
                <div className="ml-5">
                  <BranchNode
                    branch={branch}
                    depth={0}
                    isLast={idx === selectedReligion.branches!.length - 1}
                    colors={colors}
                    expandedNodes={expandedNodes}
                    toggleNode={toggleNode}
                    parentPath={selectedId}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Link to detail */}
          <div className="mt-6 pt-4 border-t border-border">
            <Link
              href={`${BASE_PATH}/religion/${selectedReligion.id}/`}
              className={cn(
                "inline-flex items-center gap-2 text-sm font-medium transition-colors",
                colors.text,
                "hover:underline"
              )}
            >
              {selectedReligion.name.ko} 상세 페이지로 이동
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
