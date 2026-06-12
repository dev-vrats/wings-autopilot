"use client";

export function StatusBadge({ status, className = "" }) {
  const getStatusStyles = () => {
    switch (status?.toLowerCase()) {
      case "active":
      case "published":
      case "fulfilled":
        return "bg-white text-black font-semibold";
      case "pending":
      case "in review":
        return "bg-glass-bg text-muted border border-glass-border";
      case "new":
        return "bg-white/20 text-white border border-white/30";
      default:
        return "bg-glass-bg text-muted border border-divider";
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs transition-colors ${getStatusStyles()} ${className}`}
    >
      {status}
    </span>
  );
}

export function SkillPill({ skill, active = false, onClick, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={`
        inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium
        transition-all duration-200
        ${onClick ? "cursor-pointer hover:scale-[1.02]" : "cursor-default"}
        ${active 
          ? "bg-white text-black shadow-[0_0_10px_rgba(255,255,255,0.3)]" 
          : "bg-glass-bg text-muted border border-glass-border hover:border-white/30"
        }
        ${className}
      `}
    >
      {skill}
    </button>
  );
}
