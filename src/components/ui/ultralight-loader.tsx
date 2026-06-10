'use client'

import React, { useEffect, useRef, useState } from 'react'

interface UltraLightLoaderProps {
  onComplete: () => void
}

export function UltraLightLoader({ onComplete }: UltraLightLoaderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Setup high DPI canvas
    let width = window.innerWidth
    let height = window.innerHeight
    const dpr = window.devicePixelRatio || 1

    const resize = () => {
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.scale(dpr, dpr)
    }
    resize()
    window.addEventListener('resize', resize)

    // Particle Setup
    const PARTICLE_COUNT = 800
    const particles: any[] = []

    // Golden spiral sphere distribution
    const phi = Math.PI * (3 - Math.sqrt(5))
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const y = 1 - (i / (PARTICLE_COUNT - 1)) * 2
      const radius = Math.sqrt(1 - y * y)
      const theta = phi * i

      const x = Math.cos(theta) * radius
      const z = Math.sin(theta) * radius

      particles.push({
        origX: x, origY: y, origZ: z,
        x: x, y: y, z: z,
        tx: 0, ty: 0, // Target grid coordinates
      })
    }

    // Grid Targets mapping for transition
    const cols = Math.ceil(Math.sqrt(PARTICLE_COUNT * (width / height)))
    const rows = Math.ceil(PARTICLE_COUNT / cols)
    const cellW = width / cols
    const cellH = height / rows

    particles.forEach((p, i) => {
      const r = Math.floor(i / cols)
      const c = i % cols
      p.tx = c * cellW + cellW / 2
      p.ty = r * cellH + cellH / 2
    })

    let frameId: number
    const startTime = performance.now()
    const TRANSITION_DELAY = 2000
    const TRANSITION_DURATION = 1500

    const render = (time: number) => {
      const elapsed = time - startTime
      ctx.fillStyle = '#000000'
      ctx.fillRect(0, 0, width, height)
      ctx.fillStyle = '#ffffff'

      const cx = width / 2
      const cy = height / 2
      const radiusScale = Math.min(width, height) * 0.3

      const isTransitioning = elapsed > TRANSITION_DELAY
      const transitionProgress = isTransitioning 
        ? Math.min((elapsed - TRANSITION_DELAY) / TRANSITION_DURATION, 1)
        : 0

      // Easing function for smooth snap
      const ease = 1 - Math.pow(1 - transitionProgress, 3)

      if (transitionProgress === 1 && !fading) {
        setFading(true)
        setTimeout(() => onComplete(), 500)
      }

      // Rotate sphere
      const rotY = time * 0.0005
      const rotX = time * 0.0002
      const cosY = Math.cos(rotY), sinY = Math.sin(rotY)
      const cosX = Math.cos(rotX), sinX = Math.sin(rotX)

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const p = particles[i]

        // 3D Rotation
        let x = p.origX
        let y = p.origY
        let z = p.origZ

        // RotY
        let tx = x * cosY - z * sinY
        let tz = x * sinY + z * cosY
        x = tx
        z = tz

        // RotX
        let ty = y * cosX - z * sinX
        tz = y * sinX + z * cosX
        y = ty
        z = tz

        // 3D to 2D Projection
        const scale = 200 / (200 + z * 100)
        let projX = cx + x * radiusScale * scale
        let projY = cy + y * radiusScale * scale

        // Interpolate to grid target
        if (isTransitioning) {
          projX = projX + (p.tx - projX) * ease
          projY = projY + (p.ty - projY) * ease
        }

        // Draw particle
        ctx.fillRect(projX, projY, 1.5, 1.5)
      }

      if (transitionProgress < 1 || !fading) {
        frameId = requestAnimationFrame(render)
      }
    }

    frameId = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('resize', resize)
    }
  }, [onComplete, fading])

  return (
    <div className={`fixed inset-0 z-[100] bg-black transition-opacity duration-500 pointer-events-none ${fading ? 'opacity-0' : 'opacity-100'}`}>
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  )
}
