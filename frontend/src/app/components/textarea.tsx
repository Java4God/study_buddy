import React, { TextareaHTMLAttributes } from "react";

type TextareaProps = {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  className?: string;
} & TextareaHTMLAttributes<HTMLTextAreaElement>;

export default function Textarea({
  value,
  onChange,
  className = "",
  ...props
}: TextareaProps) {
  return (
    <textarea
      value={value}
      onChange={onChange}
      className={[
        "w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 shadow-sm",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
}
