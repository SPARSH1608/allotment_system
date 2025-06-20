import React from "react";

export const Card = ({ children, onClick, className = "", ...props }) => (
  <div
    className={`rounded-lg shadow bg-white ${className}`}
    onClick={onClick}
    {...props}
    style={{ cursor: onClick ? "pointer" : undefined, ...props.style }}
  >
    {children}
  </div>
);

export const CardHeader = ({ children, className = "", ...props }) => (
  <div className={`p-4 border-b ${className}`} {...props}>
    {children}
  </div>
);

export const CardContent = ({ children, className = "", ...props }) => (
  <div className={`p-4 ${className}`} {...props}>
    {children}
  </div>
);

export const CardTitle = ({ children, className = "", ...props }) => (
  <h2 className={`text-xl font-semibold ${className}`} {...props}>
    {children}
  </h2>
);
