import { InputHTMLAttributes, useId } from "react";

type InputProps = {
  setValue: (value: string) => void;
  label?: string;
  error?: string;
  className?: string;
  labelClassName?: string;
  errorClassName?: string;
  wrapperClassName?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "onChange">;

const defaultInputStyles = (hasError: boolean) =>
  [
    "w-full",
    "rounded-lg",
    "border",
    hasError ? "border-red-400" : "border-zinc-300",
    "bg-white",
    "px-4",
    "py-2.5",
    "text-sm",
    "text-zinc-900",
    "placeholder:text-zinc-400",
    "shadow-sm",
    "outline-none",
    "transition-colors",
    "duration-150",
    hasError
      ? "focus:border-red-500 focus:ring-2 focus:ring-red-100"
      : "focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200",
    "disabled:cursor-not-allowed",
    "disabled:opacity-50",
  ].join(" ");

const defaultLabelStyles = "mb-1.5 block text-sm font-medium text-zinc-700";
const defaultErrorStyles = "mt-1.5 text-xs text-red-500";

export default function Input({
  setValue,
  label,
  error,
  className,
  labelClassName,
  errorClassName,
  wrapperClassName,
  id,
  ...props
}: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div className={wrapperClassName ?? "w-full"}>
      {label && (
        <label
          htmlFor={inputId}
          className={labelClassName ?? defaultLabelStyles}
        >
          {label}
        </label>
      )}

      <input
        {...props}
        id={inputId}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : undefined}
        onChange={(e) => setValue(e.target.value)}
        className={className ?? defaultInputStyles(!!error)}
      />

      {error ? (
        <p
          id={`${inputId}-error`}
          role="alert"
          className={errorClassName ?? defaultErrorStyles}
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
