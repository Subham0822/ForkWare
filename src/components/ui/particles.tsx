"use client";

import React, { useEffect, useRef } from "react";

interface ParticlesProps {
  className?: string;
  particleCount?: number;
  speed?: number;
  size?: number;
  color?: string;
}

export function Particles({
  className = "",
  particleCount = 50,
  speed = 1,
  size = 2,
  color = "hsl(var(--primary))",
}: ParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Capture non-null references for use inside inner class closures
    const canvasEl = canvas as HTMLCanvasElement;
    const ctxEl = ctx as CanvasRenderingContext2D;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Particle class
    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;

      constructor() {
        this.x = Math.random() * canvasEl.width;
        this.y = Math.random() * canvasEl.height;
        this.vx = (Math.random() - 0.5) * speed;
        this.vy = (Math.random() - 0.5) * speed;
        this.size = Math.random() * size + 1;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > canvasEl.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvasEl.height) this.vy *= -1;
      }

      draw() {
        ctxEl.fillStyle = color;
        ctxEl.globalAlpha = 0.6;
        ctxEl.beginPath();
        ctxEl.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctxEl.fill();
      }
    }

    // Create particles
    const particles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        particle.update();
        particle.draw();
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [particleCount, speed, size, color]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none z-0 ${className}`}
      style={{ opacity: 0.3 }}
    />
  );
}