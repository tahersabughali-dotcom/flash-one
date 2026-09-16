"use client";

import { useState } from "react";

export function ConfirmSubmitButton({
  confirmMessage,
  children,
  className,
  disabled,
}: {
  confirmMessage: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}) {
  const [armed, setArmed] = useState(false);
  return (
    <button
      type="submit"
      disabled={disabled}
      className={className}
      onClick={(event) => {
        if (armed) {
          return;
        }
        event.preventDefault();
        if (window.confirm(confirmMessage)) {
          setArmed(true);
          const form = (event.currentTarget as HTMLButtonElement).form;
          form?.requestSubmit();
        }
      }}
    >
      {children}
    </button>
  );
}
