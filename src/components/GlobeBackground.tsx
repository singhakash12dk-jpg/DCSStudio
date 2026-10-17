"use client";

import React, { useEffect, useRef, useState } from "react";
import createGlobe from "cobe";
import { projectLocations, latLngToCartesian } from "../config/projectLocations";

interface ProjectLocation {
  name: string;
  lat: number;
  lng: number;
  size?: number;
}

export const GlobeBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const globeRef = useRef<any>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    let phi = 0;
    let theta = 0;
    let mouseX = 0;
    let mouseY = 0;
    let targetTheta = 0;
    let targetPhi = 0;
    let isInteracting = false;
    let interactionTimeout: NodeJS.Timeout;

    const globe = createGlobe(canvas, {
      devicePixelRatio: 2,
      width: canvas.offsetWidth * 2,
      height: canvas.offsetHeight * 2,
      phi: 0,
      theta: 0.3,
      dark: 1,
      diffuse: 1.2,
      scale: 1,
      disableRender: false,
      cameraZ: 1.5,

      onRender: (state: any) => {
        // Auto-rotate
        if (!isInteracting) {
          state.phi += 0.0003;
        }

        // Smooth interpolation
        state.theta += (targetTheta - state.theta) * 0.1;
        state.phi += (targetPhi - state.phi) * 0.1;
      },
    });

    globeRef.current = globe;

    // Pointer events
    const onPointerDown = (e: PointerEvent) => {
      isInteracting = true;
      setIsDragging(true);
      mouseX = e.clientX;
      mouseY = e.clientY;
      clearTimeout(interactionTimeout);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isInteracting) return;

      const deltaX = e.clientX - mouseX;
      const deltaY = e.clientY - mouseY;

      targetTheta -= deltaX * 0.005;
      targetPhi += deltaY * 0.005;

      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const onPointerUp = () => {
      isInteracting = false;
      setIsDragging(false);
      clearTimeout(interactionTimeout);

      // Resume auto-rotation after 3 seconds
      interactionTimeout = setTimeout(() => {
        targetTheta = 0;
        targetPhi = 0;
      }, 3000);
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    // Handle resize
    const handleResize = () => {
      if (containerRef.current && canvas) {
        const width = containerRef.current.offsetWidth;
        const height = containerRef.current.offsetHeight;

        canvas.width = width * 2;
        canvas.height = height * 2;

        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
      }
    };

    // Initial size
    handleResize();

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      canvas.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("resize", handleResize);
      clearTimeout(interactionTimeout);

      if (globeRef.current) {
        globeRef.current.destroy();
      }
    };
  }, []);

  return (
    <>
      {/* Background gradient overlay to fade globe at edges */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at center, transparent 0%, transparent 40%, rgba(5, 5, 5, 0.6) 100%)`,
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* Globe Canvas */}
      <div
        ref={containerRef}
        className="absolute inset-0"
        style={{
          opacity: 0.35,
          zIndex: 0,
          overflow: "hidden",
        }}
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          style={{
            filter: "blur(0.5px) drop-shadow(0 0 30px rgba(51, 204, 221, 0.15))",
            mixBlendMode: "screen",
          }}
        />
      </div>

      {/* Additional glow effect layer */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at center, rgba(51, 204, 221, 0.08) 0%, transparent 70%)`,
          mixBlendMode: "overlay",
          zIndex: 0,
        }}
      />
    </>
  );
};

export default GlobeBackground;
