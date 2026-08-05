/*
 * TopBar — Genome Noir header for internal pages
 * Breadcrumb-style navigation with status indicators
 */
import { motion } from "framer-motion";
import { Activity, Wifi, Server } from "lucide-react";

interface TopBarProps {
  title: string;
  subtitle?: string;
  pipelineStage?: string;
}

export default function TopBar({ title, subtitle, pipelineStage }: TopBarProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex items-center justify-between h-16 px-6 border-b border-cyan-500/10 bg-[#0a0e1a]/80 backdrop-blur-md"
    >
      <div className="flex items-center gap-4">
        <div>
          <h1 className="font-mono text-lg font-semibold text-slate-100">{title}</h1>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {pipelineStage && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20">
            <div className="w-2 h-2 rounded-full bg-cyan-400 pulse-glow" />
            <span className="text-xs font-mono text-cyan-400">{pipelineStage}</span>
          </div>
        )}
        <div className="flex items-center gap-3 text-slate-500">
          <Activity className="w-4 h-4" />
          <Server className="w-4 h-4" />
          <Wifi className="w-4 h-4" />
        </div>
      </div>
    </motion.header>
  );
}
