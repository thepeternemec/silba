"use client";

interface SkeletonProps {
  width?: string;
  height?: string;
  className?: string;
}

export default function Skeleton({ width = "100%", height = "14px", className = "" }: SkeletonProps) {
  return (
    <div
      className={`bg-white/10 rounded animate-skeleton ${className}`}
      style={{ width, height }}
    />
  );
}
