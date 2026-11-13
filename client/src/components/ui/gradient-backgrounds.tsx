import { cn } from "@/lib/utils";
import React, { useState } from "react";

export interface GradientBackgroundProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  variant?: "light" | "noir" | "cosmic" | "subtle";
}

export const Component: React.FC<GradientBackgroundProps> = ({
  children,
  className,
  variant = "noir",
  style,
  ...props
}) => {
  const [count, setCount] = useState(0);

  const getBackground = () => {
    switch (variant) {
      case "light":
        return "radial-gradient(125% 125% at 50% 10%, #fff 40%, #6366f1 100%)";
      case "cosmic":
        return "radial-gradient(125% 125% at 50% 10%, #1e1b4b 20%, #0f172a 60%, #020617 100%)";
      case "subtle":
        return "radial-gradient(120% 120% at 50% 0%, #0e1726 15%, #0a0e1a 65%, #050811 100%)";
      case "noir":
      default:
        // Sophisticated Genome Noir radial gradient: deep midnight core with subtle bioluminescent cyan/indigo diffusion
        return "radial-gradient(125% 125% at 50% 5%, #0f1c30 0%, #0b1322 35%, #0a0e1a 70%, #050811 100%)";
    }
  };

  return (
    <div className={cn("min-h-screen w-full relative", className)} {...props}>
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background: getBackground(),
          ...style,
        }}
      />
      {children}
    </div>
  );
};

export default Component;

