import React from "react";

type BadgeProps = {
  children?: React.ReactNode;
  className?: string;
  variant?: "default" | "secondary" | "outline";
};

export function Badge({
  children,
  className = "",
  variant = "default",
}: BadgeProps) {
  const base =
    "inline-flex items-center gap-2 px-2.5 py-0.5 rounded text-[11px]";
  const v =
    variant === "secondary"
      ? "bg-gray-100 text-gray-800"
      : variant === "outline"
        ? "border bg-white text-gray-800"
        : "bg-indigo-50 text-indigo-700";
  return (
    <span className={[base, v, className].filter(Boolean).join(" ")}>
      {children}
    </span>
  );
}

export default Badge;
