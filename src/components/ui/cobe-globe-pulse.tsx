"use client"

import { useCallback, useEffect, useRef, type PointerEvent as ReactPointerEvent } from "react"
import createGlobe from "cobe"

export interface PulseMarker {
  id: string
  location: [number, number]
  delay: number
  name?: string
}

interface GlobePulseProps {
  markers?: PulseMarker[]
  className?: string
  speed?: number
}

export const defaultMarkers: PulseMarker[] = [
  { id: "pulse-1", location: [51.51, -0.13], delay: 0 },
  { id: "pulse-2", location: [40.71, -74.01], delay: 0.5 },
  { id: "pulse-3", location: [35.68, 139.65], delay: 1 },
  { id: "pulse-4", location: [-33.87, 151.21], delay: 1.5 },
]

export function GlobePulse({
  markers = defaultMarkers,
  className = "",
  speed = 0.003,
}: GlobePulseProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pointerInteracting = useRef<{ x: number; y: number } | null>(null)
  const dragOffset = useRef({ phi: 0, theta: 0 })
  const pointerTargetRef = useRef({ phi: 0, theta: 0 })
  const phiOffsetRef = useRef(0)
  const thetaOffsetRef = useRef(0)
  const isPausedRef = useRef(false)

  const handlePointerDown = useCallback((e: ReactPointerEvent<HTMLCanvasElement>) => {
    pointerInteracting.current = { x: e.clientX, y: e.clientY }
    if (canvasRef.current) canvasRef.current.style.cursor = "grabbing"
  }, [])

  const handlePointerLeave = useCallback(() => {
    pointerTargetRef.current = { phi: 0, theta: 0 }
    dragOffset.current = { phi: 0, theta: 0 }
    pointerInteracting.current = null
    if (canvasRef.current) canvasRef.current.style.cursor = "grab"
  }, [])

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      const nextTarget = {
        phi: (e.clientX / window.innerWidth - 0.5) * 0.8,
        theta: (e.clientY / window.innerHeight - 0.5) * 0.55,
      }

      pointerTargetRef.current = nextTarget
      pointerInteracting.current = { x: e.clientX, y: e.clientY }
    }

    const handlePointerUp = () => {
      pointerTargetRef.current = { phi: 0, theta: 0 }
      dragOffset.current = { phi: 0, theta: 0 }
      pointerInteracting.current = null
      if (canvasRef.current) canvasRef.current.style.cursor = "grab"
    }

    window.addEventListener("pointermove", handlePointerMove, { passive: true })
    window.addEventListener("pointerup", handlePointerUp, { passive: true })
    window.addEventListener("pointerleave", handlePointerLeave, { passive: true })

    return () => {
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("pointerup", handlePointerUp)
      window.removeEventListener("pointerleave", handlePointerLeave)
    }
  }, [handlePointerLeave])

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    let globe: ReturnType<typeof createGlobe> | null = null
    let animationId = 0
    let phi = 0

    const init = () => {
      const width = canvas.offsetWidth
      if (width === 0 || globe) return

      globe = createGlobe(canvas, {
        devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
        width,
        height: width,
        phi: 0,
        theta: 0.2,
        dark: 1,
        diffuse: 1.5,
        mapSamples: 16000,
        mapBrightness: 10,
        baseColor: [0.5, 0.5, 0.5],
        markerColor: [0.2, 0.8, 0.9],
        glowColor: [0.05, 0.05, 0.05],
        markerElevation: 0,
        markers: markers.map((m) => ({ location: m.location, size: 0.025, id: m.id })),
        arcs: [],
        arcColor: [0.3, 0.85, 0.95],
        arcWidth: 0.5,
        arcHeight: 0.25,
        opacity: 0.7,
      })

      const animate = () => {
        if (!isPausedRef.current) phi += speed

        dragOffset.current = {
          phi: dragOffset.current.phi + (pointerTargetRef.current.phi - dragOffset.current.phi) * 0.12,
          theta: dragOffset.current.theta + (pointerTargetRef.current.theta - dragOffset.current.theta) * 0.12,
        }

        globe!.update({
          phi: phi + phiOffsetRef.current + dragOffset.current.phi,
          theta: 0.2 + thetaOffsetRef.current + dragOffset.current.theta,
        })
        animationId = window.requestAnimationFrame(animate)
      }

      animate()
      window.setTimeout(() => {
        if (canvas) canvas.style.opacity = "1"
      }, 80)
    }

    if (canvas.offsetWidth > 0) {
      init()
    } else {
      const ro = new ResizeObserver((entries) => {
        if (entries[0]?.contentRect.width > 0) {
          ro.disconnect()
          init()
        }
      })
      ro.observe(canvas)
    }

    return () => {
      if (animationId) window.cancelAnimationFrame(animationId)
      if (globe) globe.destroy()
    }
  }, [markers, speed])

  return (
    <div className={`relative aspect-square select-none ${className}`}>
      <style>{`
        @keyframes pulse-expand {
          0% { transform: scaleX(0.3) scaleY(0.3); opacity: 0.8; }
          100% { transform: scaleX(1.5) scaleY(1.5); opacity: 0; }
        }
      `}</style>

      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerLeave={handlePointerLeave}
        style={{
          width: "100%",
          height: "100%",
          cursor: "grab",
          opacity: 0,
          transition: "opacity 1.2s ease",
          borderRadius: "50%",
          touchAction: "none",
        }}
      />

      {markers.map((m) => (
        <div
          key={m.id}
          style={{
            position: "absolute",
            // @ts-expect-error CSS Anchor Positioning
            positionAnchor: `--cobe-${m.id}`,
            bottom: "anchor(center)",
            left: "anchor(center)",
            translate: "-50% 50%",
            width: 40,
            height: 40,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none" as const,
            opacity: `var(--cobe-visible-${m.id}, 0)`,
            filter: `blur(calc((1 - var(--cobe-visible-${m.id}, 0)) * 8px))`,
            transition: "opacity 0.4s, filter 0.4s",
          }}
        >
          <span
            style={{
              position: "absolute",
              inset: 0,
              border: "2px solid #33ccdd",
              borderRadius: "50%",
              opacity: 0,
              animation: `pulse-expand 2s ease-out infinite ${m.delay}s`,
            }}
          />
          <span
            style={{
              position: "absolute",
              inset: 0,
              border: "2px solid #33ccdd",
              borderRadius: "50%",
              opacity: 0,
              animation: `pulse-expand 2s ease-out infinite ${m.delay + 0.5}s`,
            }}
          />
          <span
            style={{
              width: 10,
              height: 10,
              background: "#33ccdd",
              borderRadius: "50%",
              boxShadow: "0 0 0 3px #111, 0 0 0 5px #33ccdd",
            }}
          />
          {m.name ? (
            <span
              style={{
                position: "absolute",
                left: "calc(100% + 10px)",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#33ccdd",
                fontSize: 12,
                fontWeight: 600,
                whiteSpace: "nowrap",
                textShadow: "0 0 10px rgba(51, 204, 221, 0.35)",
                background: "rgba(2, 6, 23, 0.6)",
                border: "1px solid rgba(51, 204, 221, 0.35)",
                borderRadius: 999,
                padding: "2px 8px",
                letterSpacing: "0.02em",
              }}
            >
              {m.name}
            </span>
          ) : null}
        </div>
      ))}
    </div>
  )
}
