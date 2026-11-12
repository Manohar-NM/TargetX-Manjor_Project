import { cn } from "@/lib/utils";
import React, { useState } from "react";

export interface GradientBackgroundProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export const Component: React.FC<GradientBackgroundProps> = ({ children, className, ...props }) => {
  const [count, setCount] = useState(0);

  return (
    <div
      className={cn(
        "absolute inset-0 h-full w-full bg-background [background:radial-gradient(125%_125%_at_50%_-50%,#c7d2fe_40%,transparent_100%)] dark:[background:radial-gradient(125%_125%_at_50%_-50%,#6366f136_40%,transparent_100%)]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default Component;

