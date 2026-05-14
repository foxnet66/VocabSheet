import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger";
};

export function Button({ className = "", variant = "secondary", ...props }: ButtonProps) {
  const variants = {
    primary: "bg-ink text-white border-ink",
    secondary: "bg-white text-ink border-stone-300",
    danger: "bg-white text-red-700 border-red-200"
  };

  return (
    <button
      className={`rounded-md border px-3 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
