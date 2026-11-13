/*
 * TopBar — TargetX Minimal Header
 * Breadcrumb title, status indicators, Phosphor icons (strokeWidth 1.5)
 */
import { motion } from "framer-motion";
import { Pulse, HardDrives, WifiHigh } from "@phosphor-icons/react";

interface TopBarProps {
  title: string;
  subtitle?: string;
  pipelineStage?: string;
}

export default function TopBar({ title, subtitle, pipelineStage }: TopBarProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex items-center justify-between h-16 px-6 md:px-10 xl:px-12 border-b border-zinc-200/60 bg-white/70 backdrop-blur-md sticky top-0 z-30"
    >
      <div className="flex items-center gap-4">
        <div>
          <h1 className="font-sans text-sm font-semibold tracking-tight text-zinc-950">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-zinc-500 mt-0.5 font-sans">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {pipelineStage && (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-zinc-200/80 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0F766E] status-pulse-teal" />
            <span className="text-xs font-mono font-medium text-zinc-700">
              {pipelineStage}
            </span>
          </div>
        )}
        <div className="flex items-center gap-2.5 text-zinc-400">
          <Pulse size={18} weight="regular" className="hover:text-zinc-600 transition-colors" />
          <HardDrives size={18} weight="regular" className="hover:text-zinc-600 transition-colors" />
          <WifiHigh size={18} weight="regular" className="hover:text-zinc-600 transition-colors" />
        </div>
      </div>
    </motion.header>
  );
}
