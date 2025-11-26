"use client";

import { useEffect, useState } from "react";

export default function Snow() {
  const [snowflakes, setSnowflakes] = useState<Array<{ id: number; left: string; animationDuration: string; opacity: number; size: string; animationDelay: string }>>([]);

  useEffect(() => {
    const count = 50;
    const newSnowflakes = Array.from({ length: count }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      animationDuration: `${Math.random() * 5 + 10}s`, // 10-15s fall time
      opacity: Math.random() * 0.5 + 0.3,
      size: `${Math.random() * 4 + 2}px`,
      animationDelay: `${Math.random() * -15}s`, // Start at random positions
    }));
    setSnowflakes(newSnowflakes);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      {snowflakes.map((flake) => (
        <div
          key={flake.id}
          className="snowflake"
          style={{
            left: flake.left,
            width: flake.size,
            height: flake.size,
            opacity: flake.opacity,
            animationDuration: flake.animationDuration,
            animationDelay: flake.animationDelay,
          }}
        />
      ))}
    </div>
  );
}
