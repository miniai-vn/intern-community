"use client";

import { useEffect, useRef } from "react";

/**
 * ===== SNOWFALL EFFECT COMPONENT =====
 * Hiệu ứng hạt tuyết rơi - Chỉ chấm chấm nhỏ
 * - Canvas-based: GPU accelerated
 * - 200 particles tối đa
 * - requestAnimationFrame: Smooth 60fps
 * - Siêu nhẹ
 */

const PARTICLE_COUNT = 200;

interface Particle {
  x: number;
  y: number;
  vx: number; // horizontal drift
  vy: number; // fall speed
  size: number;
  opacity: number;
}

export function SnowfallEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Initialize particles - chỉ chấm chấm nhỏ
    const initParticles = () => {
      particlesRef.current = Array.from({ length: PARTICLE_COUNT }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        vx: (Math.random() - 0.5) * 0.3, // Rất chậm
        vy: Math.random() * 0.3 + 0.1, // Rơi chậm
        size: Math.random() * 1 + 0.5, // 0.5 - 1.5px
        opacity: Math.random() * 0.6 + 0.2, // 0.2 - 0.8
      }));
    };

    initParticles();

    // Animation loop
    const animate = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw and update particles
      particlesRef.current.forEach((particle) => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Wrap around
        if (particle.x < -10) particle.x = canvas.width + 10;
        if (particle.x > canvas.width + 10) particle.x = -10;
        if (particle.y > canvas.height + 10) {
          particle.y = -10;
          particle.x = Math.random() * canvas.width;
        }

        // Draw particle - chỉ là chấm tròn đơn giản
        ctx.fillStyle = `rgba(200, 150, 255, ${particle.opacity})`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{
        background: "transparent",
        willChange: "transform",
      }}
    />
  );
}
