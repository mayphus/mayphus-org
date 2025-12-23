import type { MetaFunction } from "@remix-run/cloudflare";
import { useEffect, useRef, useState } from "react";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";

export const meta: MetaFunction = () => [
  { title: "Playground - Interstellar Comet 3I/ATLAS" },
  {
    name: "description",
    content: "Interactive 3D sketch of the interstellar comet 3I/ATLAS orbit.",
  },
];

// --- Types ---

type Vec3 = {
  x: number;
  y: number;
  z: number;
};

type Rotation = {
  x: number;
  y: number;
  z: number;
};

type OrbitElements = {
  perihelion: number; // q (AU)
  eccentricity: number; // e
  inclinationDeg: number;
  ascendingNodeDeg: number;
  argPeriapsisDeg: number;
};

type ProjectedPoint = {
  x: number;
  y: number;
  z: number;
  scale: number;
};

type Star = {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  twinkle: number;
};

// --- Constants ---

const ORBIT_ELEMENTS: OrbitElements = {
  perihelion: 1.356, // AU
  eccentricity: 6.139, // Hyperbolic
  inclinationDeg: 175.11,
  ascendingNodeDeg: 322.15,
  argPeriapsisDeg: 128.01,
};

const ORBIT_PERIOD_SECONDS = 30;
const ORBIT_STEPS = 600;
const EARTH_ORBIT_RADIUS = 1.0;
const STAR_COUNT = 150;
const CANVAS_ASPECT_RATIO = 16 / 9;

// --- Math Utilities ---

const degToRad = (degrees: number): number => (degrees * Math.PI) / 180;

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

const formatNumber = (value: number, digits = 2): string => {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
};

const rotateX = (point: Vec3, angle: number): Vec3 => {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return {
    x: point.x,
    y: point.y * cos - point.z * sin,
    z: point.y * sin + point.z * cos,
  };
};

const rotateY = (point: Vec3, angle: number): Vec3 => {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return {
    x: point.x * cos + point.z * sin,
    y: point.y,
    z: -point.x * sin + point.z * cos,
  };
};

const rotateZ = (point: Vec3, angle: number): Vec3 => {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return {
    x: point.x * cos - point.y * sin,
    y: point.x * sin + point.y * cos,
    z: point.z,
  };
};

const applyRotation = (point: Vec3, rotation: Rotation): Vec3 => {
  let rotated = rotateX(point, rotation.x);
  rotated = rotateY(rotated, rotation.y);
  rotated = rotateZ(rotated, rotation.z);
  return rotated;
};

const orbitPointFromAnomaly = (elements: OrbitElements, anomaly: number): Vec3 => {
  const { perihelion, eccentricity } = elements;
  const radius = (perihelion * (1 + eccentricity)) / (1 + eccentricity * Math.cos(anomaly));

  const basePoint = {
    x: radius * Math.cos(anomaly),
    y: radius * Math.sin(anomaly),
    z: 0,
  };

  const argPeriapsis = degToRad(elements.argPeriapsisDeg);
  const inclination = degToRad(elements.inclinationDeg);
  const ascendingNode = degToRad(elements.ascendingNodeDeg);

  let oriented = rotateZ(basePoint, argPeriapsis);
  oriented = rotateX(oriented, inclination);
  oriented = rotateZ(oriented, ascendingNode);
  return oriented;
};

const createOrbitPoints = (elements: OrbitElements, steps: number): Vec3[] => {
  const points: Vec3[] = [];
  const maxAnomaly = Math.acos(-1 / elements.eccentricity) * 0.96;
  for (let i = 0; i <= steps; i += 1) {
    const anomaly = -maxAnomaly + (i / steps) * 2 * maxAnomaly;
    points.push(orbitPointFromAnomaly(elements, anomaly));
  }
  return points;
};

const createEarthOrbit = (radius: number, steps: number): Vec3[] => {
  const points: Vec3[] = [];
  for (let i = 0; i <= steps; i += 1) {
    const angle = (i / steps) * Math.PI * 2;
    points.push({ x: radius * Math.cos(angle), y: radius * Math.sin(angle), z: 0 });
  }
  return points;
};

const projectPoint = (point: Vec3, viewScale: number, depth: number): ProjectedPoint => {
  const scale = depth / (depth - point.z);
  return {
    x: point.x * scale * viewScale,
    y: point.y * scale * viewScale,
    z: point.z,
    scale,
  };
};

// --- Components ---

function OrbitCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rotationRef = useRef<Rotation>({ x: -0.6, y: 0.8, z: 0 });
  const dragRef = useRef({ active: false, lastX: 0, lastY: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const orbitPoints = createOrbitPoints(ORBIT_ELEMENTS, ORBIT_STEPS);
    const earthPoints = createEarthOrbit(EARTH_ORBIT_RADIUS, 120);

    let viewScale = 1;
    let width = 0;
    let height = 0;
    const stars = Array.from({ length: STAR_COUNT }).map(() => ({
      x: Math.random(),
      y: Math.random(),
      radius: 0.2 + Math.random() * 0.8,
      alpha: 0.2 + Math.random() * 0.8,
      twinkle: 0.5 + Math.random() * 2,
    }));

    const updateSize = () => {
      const rect = container.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      context.scale(dpr, dpr);
      viewScale = Math.min(width, height) * 0.35;
    };

    updateSize();
    window.addEventListener("resize", updateSize);

    const handlePointerDown = (e: PointerEvent) => {
      dragRef.current = { active: true, lastX: e.clientX, lastY: e.clientY };
      canvas.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!dragRef.current.active) return;
      const dx = e.clientX - dragRef.current.lastX;
      const dy = e.clientY - dragRef.current.lastY;
      dragRef.current.lastX = e.clientX;
      dragRef.current.lastY = e.clientY;
      rotationRef.current.y += dx * 0.005;
      rotationRef.current.x = clamp(rotationRef.current.x + dy * 0.005, -1.5, 1.5);
    };

    const handlePointerUp = (e: PointerEvent) => {
      dragRef.current.active = false;
      canvas.releasePointerCapture(e.pointerId);
    };

    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerup", handlePointerUp);

    let animationId: number;
    const startTime = performance.now();

    const drawPath = (points: Vec3[], rotation: Rotation, color: string, width: number, dashed = false) => {
      context.beginPath();
      context.strokeStyle = color;
      context.lineWidth = width;
      if (dashed) context.setLineDash([4, 4]);
      else context.setLineDash([]);

      points.forEach((p, i) => {
        const rotated = applyRotation(p, rotation);
        const projected = projectPoint(rotated, viewScale, 20);
        const x = canvas.width / (2 * (window.devicePixelRatio || 1)) + projected.x;
        const y = canvas.height / (2 * (window.devicePixelRatio || 1)) + projected.y;
        if (i === 0) context.moveTo(x, y);
        else context.lineTo(x, y);
      });
      context.stroke();
    };

    const render = (time: number) => {
      const elapsed = (time - startTime) / 1000;
      context.clearRect(0, 0, width, height);

      // Background
      context.fillStyle = "#020617";
      context.fillRect(0, 0, width, height);

      // Stars
      stars.forEach(s => {
        const t = 0.5 + 0.5 * Math.sin(elapsed * s.twinkle);
        context.fillStyle = `rgba(255, 255, 255, ${s.alpha * t})`;
        context.beginPath();
        context.arc(s.x * width, s.y * height, s.radius, 0, Math.PI * 2);
        context.fill();
      });

      const rotation = rotationRef.current;
      if (!dragRef.current.active) rotation.y += 0.001;

      // Sun
      context.fillStyle = "#fbbf24";
      context.shadowBlur = 15;
      context.shadowColor = "#fbbf24";
      context.beginPath();
      context.arc(width / 2, height / 2, 5, 0, Math.PI * 2);
      context.fill();
      context.shadowBlur = 0;

      // Orbits
      drawPath(earthPoints, rotation, "rgba(71, 85, 105, 0.3)", 1, true);
      drawPath(orbitPoints, rotation, "rgba(56, 189, 248, 0.6)", 2);

      // Comet
      const phase = (elapsed / ORBIT_PERIOD_SECONDS) % 1;
      const maxAnomaly = Math.acos(-1 / ORBIT_ELEMENTS.eccentricity) * 0.96;
      const currentAnomaly = -maxAnomaly + phase * 2 * maxAnomaly;
      const cometPos = orbitPointFromAnomaly(ORBIT_ELEMENTS, currentAnomaly);
      const rotatedComet = applyRotation(cometPos, rotation);
      const projectedComet = projectPoint(rotatedComet, viewScale, 20);

      context.fillStyle = "#38bdf8";
      context.beginPath();
      context.arc(width / 2 + projectedComet.x, height / 2 + projectedComet.y, 4 * projectedComet.scale, 0, Math.PI * 2);
      context.fill();

      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", updateSize);
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full aspect-video rounded-2xl border border-border overflow-hidden bg-slate-950">
      <canvas ref={canvasRef} className="w-full h-full touch-none" />
    </div>
  );
}

export default function Playground() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-12">
      <header className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Interstellar Comet 3I/ATLAS</h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          Visualizing the high-energy hyperbolic trajectory of C/2025 N1 (ATLAS),
          the third confirmed interstellar object.
        </p>
      </header>

      <OrbitCanvas />

      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Orbital Elements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 font-mono text-sm text-muted-foreground">
            <div className="flex justify-between">
              <span>Perihelion Distance (q)</span>
              <span className="text-foreground">1.356 AU</span>
            </div>
            <div className="flex justify-between">
              <span>Eccentricity (e)</span>
              <span className="text-emerald-500 font-bold">6.139</span>
            </div>
            <div className="flex justify-between">
              <span>Inclination (i)</span>
              <span className="text-foreground">175.11°</span>
            </div>
            <div className="flex justify-between">
              <span>Long. of Asc. Node</span>
              <span className="text-foreground">322.15°</span>
            </div>
            <div className="flex justify-between">
              <span>Arg. of Periapsis</span>
              <span className="text-foreground">128.01°</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Discovery & Origin</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Discovered on July 1, 2025, by the ATLAS survey. Its massive eccentricity
              confirms it originated from outside our solar system, following an
              unbound trajectory that will eventually carry it back into deep space.
            </p>
            <div className="flex gap-4 pt-2">
              <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                Interstellar
              </Badge>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                Hyperbolic
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
