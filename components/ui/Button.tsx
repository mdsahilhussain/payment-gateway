"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  ghost: "btn-ghost",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  /** When true, button is disabled and announces aria-busy. */
  loading?: boolean;
  /** Replaces children while loading (e.g. "Processing…"). */
  loadingText?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = "primary",
      loading = false,
      loadingText,
      disabled,
      type = "button",
      className = "",
      children,
      ...rest
    },
    ref
  ) {
    return (
      <button
        ref={ref}
        type={type}
        className={[VARIANT_CLASS[variant], className]
          .filter(Boolean)
          .join(" ")}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...rest}
      >
        {loading && loadingText ? loadingText : children}
      </button>
    );
  }
);