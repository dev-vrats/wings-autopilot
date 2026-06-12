"use client";

export function PillButton({ children, className = "", onClick, type = "button", disabled = false }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        relative overflow-hidden
        px-6 py-2.5 rounded-full text-sm font-medium
        bg-foreground text-background
        transition-all duration-300 ease-out
        hover:scale-[1.02] active:scale-[0.98]
        disabled:opacity-50 disabled:pointer-events-none
        before:absolute before:inset-0
        before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent
        before:-translate-x-[200%] hover:before:animate-shimmer
        ${className}
      `}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
    </button>
  );
}

export function GhostButton({ children, className = "", onClick, type = "button", disabled = false }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        px-6 py-2.5 rounded-full text-sm font-medium
        bg-glass-bg border border-glass-border text-foreground
        transition-all duration-300 ease-out
        hover:bg-glass-hover hover:border-glass-hover
        active:scale-[0.98]
        disabled:opacity-50 disabled:pointer-events-none
        ${className}
      `}
    >
      <span className="flex items-center justify-center gap-2">{children}</span>
    </button>
  );
}
