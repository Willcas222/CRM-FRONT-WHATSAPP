import {
  type InputHTMLAttributes,
  type LabelHTMLAttributes,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
  forwardRef,
} from "react";

import { cn } from "@/lib/utils";

export const Label = (props: LabelHTMLAttributes<HTMLLabelElement>) => (
  <label
    {...props}
    className={cn(
      "mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300",
      props.className,
    )}
  />
);

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, error, ...props },
  ref,
) {
  return (
    <div>
      <input
        ref={ref}
        className={cn(
          "block w-full rounded-xl border px-3 py-2 text-sm shadow-sm outline-none transition-colors",
          "focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500",
          "dark:bg-zinc-900 dark:text-zinc-100",
          error
            ? "border-red-400 focus:border-red-500 focus:ring-red-500"
            : "border-zinc-300 dark:border-zinc-700",
          className,
        )}
        {...props}
      />
      {error && (
        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
});

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: string }
>(function Textarea({ className, error, ...props }, ref) {
  return (
    <div>
      <textarea
        ref={ref}
        className={cn(
          "block w-full rounded-xl border px-3 py-2 text-sm shadow-sm outline-none transition-colors",
          "focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500",
          "dark:bg-zinc-900 dark:text-zinc-100",
          error
            ? "border-red-400 focus:border-red-500 focus:ring-red-500"
            : "border-zinc-300 dark:border-zinc-700",
          className,
        )}
        {...props}
      />
      {error && (
        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
});

export const Select = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement> & { error?: string }
>(function Select({ className, error, children, ...props }, ref) {
  return (
    <div>
      <select
        ref={ref}
        className={cn(
          "block w-full rounded-xl border bg-white px-3 py-2 text-sm shadow-sm outline-none transition-colors",
          "focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500",
          "dark:bg-zinc-900 dark:text-zinc-100",
          error
            ? "border-red-400 focus:border-red-500 focus:ring-red-500"
            : "border-zinc-300 dark:border-zinc-700",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
});
