'use client';

import { useEffect, useRef, useCallback } from 'react';

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

export function NetworkAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<Node[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number>(0);
  const dimensionsRef = useRef({ w: 0, h: 0 });

  const NODE_COUNT = 60;
  const CONNECTION_DISTANCE = 150;
  const PARALLAX_STRENGTH = 15;

  const initNodes = useCallback((w: number, h: number) => {
    const nodes: Node[] = [];
    for (let i = 0; i < NODE_COUNT; i++) {
      nodes.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 1.5 + 1,
      });
    }
    nodesRef.current = nodes;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      dimensionsRef.current = { w: rect.width, h: rect.height };
      if (nodesRef.current.length === 0) {
        initNodes(rect.width, rect.height);
      }
    };

    resize();
    window.addEventListener('resize', resize);

    let lastMouseMove = 0;
    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastMouseMove < 16) return; // ~60fps throttle
      lastMouseMove = now;
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: (e.clientX - rect.left) / rect.width - 0.5,
        y: (e.clientY - rect.top) / rect.height - 0.5,
      };
    };
    window.addEventListener('mousemove', handleMouseMove);

    const animate = () => {
      const { w, h } = dimensionsRef.current;
      const nodes = nodesRef.current;
      const mouse = mouseRef.current;

      ctx.clearRect(0, 0, w, h);

      // Update positions
      for (const node of nodes) {
        node.x += node.vx;
        node.y += node.vy;

        if (node.x < 0 || node.x > w) node.vx *= -1;
        if (node.y < 0 || node.y > h) node.vy *= -1;

        node.x = Math.max(0, Math.min(w, node.x));
        node.y = Math.max(0, Math.min(h, node.y));
      }

      // Draw connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const px = mouse.x * PARALLAX_STRENGTH;
          const py = mouse.y * PARALLAX_STRENGTH;
          const ax = nodes[i].x + px;
          const ay = nodes[i].y + py;
          const bx = nodes[j].x + px;
          const by = nodes[j].y + py;

          const dx = ax - bx;
          const dy = ay - by;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < CONNECTION_DISTANCE) {
            const opacity = (1 - dist / CONNECTION_DISTANCE) * 0.25;
            ctx.beginPath();
            ctx.moveTo(ax, ay);
            ctx.lineTo(bx, by);
            ctx.strokeStyle = `rgba(232, 89, 60, ${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      for (const node of nodes) {
        const px = mouse.x * PARALLAX_STRENGTH;
        const py = mouse.y * PARALLAX_STRENGTH;
        const nx = node.x + px;
        const ny = node.y + py;

        // Glow
        const gradient = ctx.createRadialGradient(nx, ny, 0, nx, ny, node.radius * 6);
        gradient.addColorStop(0, 'rgba(232, 89, 60, 0.3)');
        gradient.addColorStop(1, 'rgba(232, 89, 60, 0)');
        ctx.beginPath();
        ctx.arc(nx, ny, node.radius * 6, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Core
        ctx.beginPath();
        ctx.arc(nx, ny, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(232, 89, 60, 0.8)';
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [initNodes]);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <canvas
        ref={canvasRef}
        className="h-full w-full"
        style={{
          maskImage: 'radial-gradient(ellipse 80% 70% at 50% 50%, black 30%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 70% at 50% 50%, black 30%, transparent 100%)',
        }}
      />
    </div>
  );
}
