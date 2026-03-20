"use client";

import { useEffect, useRef, useCallback } from "react";

export default function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeRef = useRef(false);
  const animRef = useRef<number>(0);
  const konamiRef = useRef<string[]>([]);

  const KONAMI = [
    "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown",
    "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight",
    "b", "a",
  ];

  const startMatrix = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    activeRef.current = true;
    canvas.classList.add("active");

    const ctx = canvas.getContext("2d")!;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const cols = Math.floor(canvas.width / 16);
    const drops: number[] = Array(cols).fill(1);
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&*()_+-=[]{}|;':\",./<>?";

    function draw() {
      ctx.fillStyle = "rgba(10, 10, 10, 0.05)";
      ctx.fillRect(0, 0, canvas!.width, canvas!.height);
      ctx.fillStyle = "#00ff9d";
      ctx.font = "14px 'Fira Code', monospace";

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillStyle = Math.random() > 0.95 ? "#ffffff" : "#00ff9d";
        ctx.fillText(char, i * 16, drops[i] * 16);
        if (drops[i] * 16 > canvas!.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
      animRef.current = requestAnimationFrame(draw);
    }

    animRef.current = requestAnimationFrame(draw);

    // Auto-stop after 8 seconds
    setTimeout(() => stopMatrix(), 8000);
  }, []);

  const stopMatrix = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    activeRef.current = false;
    canvas.classList.remove("active");
    cancelAnimationFrame(animRef.current);
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      konamiRef.current.push(e.key);
      if (konamiRef.current.length > KONAMI.length) {
        konamiRef.current.shift();
      }
      if (JSON.stringify(konamiRef.current) === JSON.stringify(KONAMI)) {
        konamiRef.current = [];
        if (activeRef.current) {
          stopMatrix();
        } else {
          startMatrix();
        }
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("keydown", handleKey);
      cancelAnimationFrame(animRef.current);
    };
  }, [startMatrix, stopMatrix, KONAMI]);

  return <canvas ref={canvasRef} id="matrix-canvas" />;
}
