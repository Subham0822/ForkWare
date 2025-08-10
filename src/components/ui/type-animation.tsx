"use client";

import React, { useState, useEffect } from "react";

interface TypeAnimationProps {
  text: string;
  speed?: number;
  className?: string;
  cursorClassName?: string;
}

export function TypeAnimation({
  text,
  speed = 100,
  className = "",
  cursorClassName = "text-primary",
}: TypeAnimationProps) {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, speed);

      return () => clearTimeout(timer);
    }
  }, [currentIndex, text, speed]);

  useEffect(() => {
    const cursorTimer = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 500);

    return () => clearInterval(cursorTimer);
  }, []);

  return (
    <span className={className}>
      {displayText}
      <span
        className={`${cursorClassName} ${
          showCursor ? "opacity-100" : "opacity-0"
        } transition-opacity duration-150`}
      >
        |
      </span>
    </span>
  );
}
