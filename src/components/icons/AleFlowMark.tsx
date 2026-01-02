import React from "react";

interface IconProps {
  width?: number | string;
  height?: number | string;
  className?: string;
}

const AleFlowMark: React.FC<IconProps> = ({
  width = 24,
  height = 24,
  className,
}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M6 4 L6 20" />
    <path d="M18 4 C14 8, 14 16, 18 20" />
    <path d="M10 4 C14 8, 14 16, 10 20" />
  </svg>
);

export default AleFlowMark;
