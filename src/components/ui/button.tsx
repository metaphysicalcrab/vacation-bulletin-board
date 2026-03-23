import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "default" | "outline" | "ghost" | "destructive";
type Size = "default" | "sm" | "lg" | "icon";

const variantStyles: Record<Variant, string> = {
  default: "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800",
  outline:
    "border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 active:bg-gray-100",
  ghost: "text-gray-700 hover:bg-gray-100 active:bg-gray-200",
  destructive: "bg-red-600 text-white hover:bg-red-700 active:bg-red-800",
};

const sizeStyles: Record<Size, string> = {
  default: "h-10 px-4 py-2",
  sm: "h-8 px-3 text-sm",
  lg: "h-12 px-6 text-lg",
  icon: "h-10 w-10",
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    />
  )
);
Button.displayName = "Button";
