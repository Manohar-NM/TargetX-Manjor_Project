/*
 * Sidebar — TargetX Navigation
 * Desktop: fixed width 240px, sticky top-0 h-[100dvh], shrink-0.
 * Mobile: responsive sticky top bar with no horizontal scroll at 390px.
 */
import { Link, useLocation } from "wouter";
import {
  House,
  GitFork,
  ChartBar,
  Info,
  Dna,
} from "@phosphor-icons/react";

const navItems = [
  { path: "/", label: "Home", icon: House },
  { path: "/pipeline", label: "Pipeline", icon: GitFork },
  { path: "/dashboard", label: "Dashboard", icon: ChartBar },
  { path: "/about", label: "About", icon: Info },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <>
      {/* Mobile Top Navigation (only below md, prevents horizontal scroll) */}
      <header className="md:hidden sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-zinc-200/80 px-4 py-2.5 flex items-center justify-between">
        <Link href="/">
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="w-7 h-7 rounded-lg bg-zinc-950 flex items-center justify-center text-white">
              <Dna size={16} weight="regular" className="text-[#0F766E]" />
            </div>
            <span className="font-sans font-semibold text-zinc-950 text-sm tracking-tight">
              TargetX
            </span>
          </div>
        </Link>

        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = location === item.path;
            const Icon = item.icon;
            return (
              <Link key={item.path} href={item.path}>
                <div
                  className={`p-2 rounded-lg text-xs transition-all cursor-pointer ${
                    isActive
                      ? "bg-zinc-100 text-[#0F766E] font-semibold"
                      : "text-zinc-600 hover:text-zinc-950"
                  }`}
                  title={item.label}
                >
                  <Icon size={18} weight={isActive ? "bold" : "regular"} />
                </div>
              </Link>
            );
          })}
        </nav>
      </header>

      {/* Desktop Sidebar: fixed width 240px, sticky top-0 h-[100dvh], shrink-0 */}
      <aside className="hidden md:flex w-[240px] sticky top-0 h-[100dvh] shrink-0 flex-col bg-white/80 backdrop-blur-md border-r border-zinc-200/60 z-40">
        {/* Brand area */}
        <div className="flex items-center h-20 px-6 border-b border-zinc-200/60">
          <Link href="/">
            <div className="flex items-center gap-3 overflow-hidden cursor-pointer">
              <div className="w-9 h-9 rounded-xl bg-zinc-950 flex items-center justify-center flex-shrink-0 text-white shadow-xs">
                <Dna size={20} weight="regular" className="text-[#0F766E]" />
              </div>
              <div className="overflow-hidden whitespace-nowrap">
                <span className="font-sans font-semibold text-zinc-950 text-base tracking-tight block">
                  TargetX
                </span>
                <span className="text-[11px] text-zinc-500 block leading-tight font-sans">
                  CRISPR Design
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-4 space-y-1.5">
          {navItems.map((item) => {
            const isActive = location === item.path;
            const Icon = item.icon;
            return (
              <Link key={item.path} href={item.path}>
                <div
                  className={`group flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all duration-150 cursor-pointer ${
                    isActive
                      ? "bg-white text-zinc-950 font-semibold border border-zinc-200/80 shadow-xs"
                      : "text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100/70 border border-transparent font-medium"
                  }`}
                >
                  <Icon
                    size={20}
                    weight="regular"
                    className={`flex-shrink-0 transition-colors ${
                      isActive ? "text-[#0F766E]" : "text-zinc-500 group-hover:text-zinc-900"
                    }`}
                  />
                  <span className="text-sm truncate font-sans flex-1">{item.label}</span>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0F766E] flex-shrink-0 status-pulse-teal" />
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Footer Status */}
        <div className="p-4 border-t border-zinc-200/60">
          <div className="px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200/60">
            <span className="text-[11px] font-sans text-zinc-500 block">Status</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0F766E] status-pulse-teal" />
              <span className="text-xs font-sans font-medium text-zinc-800">SpCas9 Active</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
