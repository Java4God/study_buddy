"use client";

import { CSSProperties } from "react";

type ButtonVariant =
  | "normal"
  | "danger"
  | "primary"
  | "secondary"
  | "ghost"
  | "outline";

type ButtonSize = "sm" | "md";

interface ButtonProps {
  label?: string;
  onClick?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  style?: CSSProperties;
  className?: string;
  type?: "button" | "submit" | "reset";
  children?: React.ReactNode;
}
const base =
  "inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-lg text-sm font-semibold tracking-wide border-2 cursor-pointer select-none whitespace-nowrap transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-95";

const sizes: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-5 py-2.5 text-sm",
};

const variants: Record<ButtonVariant, string> = {
  normal:
    "bg-stone-100 text-stone-900 border-stone-300 shadow-sm hover:bg-stone-200 hover:border-stone-400 focus-visible:ring-stone-400",
  primary:
    "bg-stone-900 shadow-sm text-stone-50 transition border-stone-900 shadow-md hover:bg-indigo-600 hover:border-indigo-700 focus-visible:ring-indigo-500",
  secondary:
    "bg-transparent text-stone-900 border-stone-900 hover:bg-stone-900 hover:text-stone-50 focus-visible:ring-stone-900",
  danger:
    "bg-red-600 text-white border-red-600 shadow-md hover:bg-red-700 hover:border-red-700 focus-visible:ring-red-500",
  ghost: "hover:bg-accent hover:text-accent-foreground",
  outline:
    "border bg-background text-foreground hover:bg-accent hover:text-accent-foreground",
};

const disabledClass = "opacity-45 cursor-not-allowed pointer-events-none";

export default function Button({
  label = "",
  onClick,
  variant = "normal",
  size = "md",
  disabled = false,
  style,
  className = "",
  type = "button",
  children,
}: ButtonProps) {
  return (
    <button
      type={type}
      style={style}
      className={[
        base,
        sizes[size],
        variants[variant],
        disabled ? disabledClass : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
    >
      {children || label}
    </button>
  );
}
