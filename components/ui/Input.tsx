"use client";

import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "id"> {
  /** Visible label, also used as the input's accessible name. */
  label: string;
  /** When set, applies error styling and wires up `aria-describedby`. */
  error?: string;
  /** Optional id; auto-generated via useId() when omitted. */
  id?: string;
  /** Optional element rendered inside the input on the right side
      (e.g. a card-brand badge or a search icon). */
  rightSlot?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, id, rightSlot, className = "", ...rest },
  ref
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;

  const inputEl = (
    <input
      ref={ref}
      id={inputId}
      className={[
        "input",
        rightSlot ? "card-input-field" : "",
        error ? "input-error" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-invalid={error ? true : undefined}
      aria-describedby={error ? errorId : undefined}
      {...rest}
    />
  );

  return (
    <div className="input-group">
      <label htmlFor={inputId} className="input-label">
        {label}
      </label>
      {rightSlot ? (
        <div className="card-input-wrap">
          {inputEl}
          <div className="card-input-brand" aria-hidden>
            {rightSlot}
          </div>
        </div>
      ) : (
        inputEl
      )}
      {error && (
        <p id={errorId} className="error-message" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});