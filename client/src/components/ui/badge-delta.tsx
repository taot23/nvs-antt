import React from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { ArrowUpIcon, ArrowDownIcon, MinusIcon } from "lucide-react";

const badgeDeltaVariants = cva(
  "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
  {
    variants: {
      deltaType: {
        increase: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
        decrease: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
        unchanged: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100",
      },
      size: {
        default: "text-xs",
        sm: "text-[10px] px-1.5 py-0.5",
      },
    },
    defaultVariants: {
      deltaType: "unchanged",
      size: "default",
    },
  }
);

export interface BadgeDeltaProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeDeltaVariants> {}

export function BadgeDelta({
  className,
  deltaType,
  size,
  ...props
}: BadgeDeltaProps) {
  return (
    <span
      className={cn(badgeDeltaVariants({ deltaType, size }), className)}
      {...props}
    >
      {deltaType === "increase" && (
        <ArrowUpIcon className="h-3 w-3 mr-1" />
      )}
      {deltaType === "decrease" && (
        <ArrowDownIcon className="h-3 w-3 mr-1" />
      )}
      {deltaType === "unchanged" && (
        <MinusIcon className="h-3 w-3 mr-1" />
      )}
      {deltaType === "increase" && "Positivo"}
      {deltaType === "decrease" && "Negativo"}
      {deltaType === "unchanged" && "Neutro"}
    </span>
  );
}