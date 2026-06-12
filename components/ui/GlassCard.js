"use client";

export function GlassCard({ children, className = "", hover = true, ...props }) {
  return (
    <div
      className={`glass-card p-6 ${hover ? "" : "hover:transform-none hover:border-glass-border"} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
