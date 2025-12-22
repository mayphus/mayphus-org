import type { MetaFunction } from "@remix-run/cloudflare";
import { useEffect, useRef, useState } from "react";

export const meta: MetaFunction = () => [
  { title: "Playground - 3I/ATLAS Orbit" },
  {
    name: "description",
    content: "Interactive 3D sketch of the current 3I/ATLAS orbit.",
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
  semiMajorAxis: number;
  eccentricity: number;
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
  semiMajorAxis: 4.2, // AU
  eccentricity: 0.74,
  inclinationDeg: 118,
  ascendingNodeDeg: 82,
  argPeriapsisDeg: 56,
};

const ORBIT_PERIOD_SECONDS = 96;
const ORBIT_STEPS = 540;
const REFERENCE_ORBIT_RADIUS = 1.4;
const REFERENCE_ORBIT_STEPS = 240;
const STAR_COUNT = 140;
const CANVAS_ASPECT_RATIO = 16 / 9;
const MIN_CANVAS_HEIGHT_PX = 320;

// --- Math Utilities ---

const degToRad = (degrees: number): number => (degrees * Math.PI) / 180;

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

const formatNumber = (value: number, digits = 2): string => {
  const fixed = value.toFixed(digits);
  return fixed.replace(/\.?0+$/, "");
};

// Rotation functions using standard matrix transformations for 3D points
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
  // Order of rotation matters: X -> Y -> Z is used here
  let rotated = rotateX(point, rotation.x);
  rotated = rotateY(rotated, rotation.y);
  rotated = rotateZ(rotated, rotation.z);
  return rotated;
};

// Calculate a point on an orbit given orbital elements and true anomaly
const orbitPointFromAnomaly = (
  elements: OrbitElements,
  anomaly: number,
): Vec3 => {
  const { semiMajorAxis, eccentricity } = elements;
  // Polar equation for an ellipse from the focus
  const radius =
    (semiMajorAxis * (1 - eccentricity * eccentricity)) /
    (1 + eccentricity * Math.cos(anomaly));

  // Point in the orbital plane (z=0)
  const basePoint = {
    x: radius * Math.cos(anomaly),
    y: radius * Math.sin(anomaly),
    z: 0,
  };

  // Rotate to the actual orbital plane
  const argPeriapsis = degToRad(elements.argPeriapsisDeg);
  const inclination = degToRad(elements.inclinationDeg);
  const ascendingNode = degToRad(elements.ascendingNodeDeg);

  // Apply orbital rotations in specific order
  let oriented = rotateZ(basePoint, argPeriapsis);
  oriented = rotateX(oriented, inclination);
  oriented = rotateZ(oriented, ascendingNode);
  return oriented;
};

const createOrbitPoints = (
  elements: OrbitElements,
  steps: number,
): Vec3[] => {
  const points: Vec3[] = [];
  for (let i = 0; i <= steps; i += 1) {
    const anomaly = (i / steps) * Math.PI * 2;
    points.push(orbitPointFromAnomaly(elements, anomaly));
  }
  return points;
};

const createCirclePoints = (radius: number, steps: number): Vec3[] => {
  const points: Vec3[] = [];
  for (let i = 0; i <= steps; i += 1) {
    const angle = (i / steps) * Math.PI * 2;
    points.push({
      x: radius * Math.cos(angle),
      y: radius * Math.sin(angle),
      z: 0,
    });
  }
  return points;
};

const createStars = (
  count: number,
  width: number,
  height: number,
): Star[] => {
  const stars: Star[] = [];
  for (let i = 0; i < count; i += 1) {
    stars.push({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: 0.4 + Math.random() * 1.2,
      alpha: 0.3 + Math.random() * 0.7,
      twinkle: 0.4 + Math.random() * 1.6,
    });
  }
  return stars;
};

// Perspective projection
const projectPoint = (
  point: Vec3,
  viewScale: number,
  depth: number,
): ProjectedPoint => {
  // Simple perspective divide
  const scale = depth / (depth - point.z);
  return {
    x: point.x * scale * viewScale,
    y: point.y * scale * viewScale,
    z: point.z,
    scale,
  };
};

const projectPoints = (
  points: Vec3[],
  rotation: Rotation,
  viewScale: number,
  depth: number,
): ProjectedPoint[] =>
  points.map((point) =>
    projectPoint(applyRotation(point, rotation), viewScale, depth),
  );

// --- Components ---

function OrbitCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rotationRef = useRef<Rotation>({ x: -0.6, y: 0.8, z: 0 });

  // Track drag state
  const dragRef = useRef({ active: false, lastX: 0, lastY: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) {
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    // Pre-calculate points
    const orbitPoints = createOrbitPoints(ORBIT_ELEMENTS, ORBIT_STEPS);
    const referencePoints = createCirclePoints(REFERENCE_ORBIT_RADIUS, REFERENCE_ORBIT_STEPS);

    // View parameters
    const depth = 20;
    let stars: Star[] = [];
    let viewScale = 1;
    let width = 0;
    let height = 0;

    const updateSize = () => {
      if (!container) return;
      const rect = container.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      const dpr = window.devicePixelRatio || 1;

      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));

      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      viewScale = Math.min(width, height) * 0.3;
      stars = createStars(STAR_COUNT, width, height);
    };

    updateSize();

    const observer = new ResizeObserver(() => updateSize());
    observer.observe(container);

    // Event Handlers
    const handlePointerDown = (event: PointerEvent) => {
      dragRef.current = {
        active: true,
        lastX: event.clientX,
        lastY: event.clientY,
      };
      // Important for tracking drag outside canvas
      if (canvas.setPointerCapture) {
        canvas.setPointerCapture(event.pointerId);
      }
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!dragRef.current.active) {
        return;
      }
      const deltaX = event.clientX - dragRef.current.lastX;
      const deltaY = event.clientY - dragRef.current.lastY;

      dragRef.current.lastX = event.clientX;
      dragRef.current.lastY = event.clientY;

      rotationRef.current = {
        x: clamp(rotationRef.current.x + deltaY * 0.004, -1.4, 1.4),
        y: rotationRef.current.y + deltaX * 0.004,
        z: rotationRef.current.z,
      };
    };

    const handlePointerUp = (event: PointerEvent) => {
      dragRef.current = { ...dragRef.current, active: false };
      if (canvas.hasPointerCapture && canvas.hasPointerCapture(event.pointerId)) {
        canvas.releasePointerCapture(event.pointerId);
      }
    };

    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerup", handlePointerUp);
    canvas.addEventListener("pointerleave", handlePointerUp);

    const startTime = performance.now();

    // Drawing Helper
    const drawPath = (
      points: ProjectedPoint[],
      strokeStyle: string,
      lineWidth: number,
      predicate?: (point: ProjectedPoint) => boolean,
    ) => {
      context.strokeStyle = strokeStyle;
      context.lineWidth = lineWidth;
      context.lineJoin = "round";
      context.lineCap = "round";

      let started = false;
      context.beginPath();

      for (const point of points) {
        if (predicate && !predicate(point)) {
          if (started) {
            context.stroke();
            context.beginPath();
            started = false;
          }
          continue;
        }

        const x = width / 2 + point.x;
        const y = height / 2 + point.y;

        if (!started) {
          context.moveTo(x, y);
          started = true;
        } else {
          context.lineTo(x, y);
        }
      }
      if (started) {
        context.stroke();
      }
    };

    let animationId = 0;

    const render = () => {
      const now = performance.now();
      const elapsed = (now - startTime) / 1000;

      // Auto-rotate if not dragging
      if (!dragRef.current.active) {
        rotationRef.current = {
          x: rotationRef.current.x,
          y: rotationRef.current.y + 0.0009,
          z: rotationRef.current.z,
        };
      }

      const rotation = rotationRef.current;
      const orbitPhase = (elapsed / ORBIT_PERIOD_SECONDS) % 1;

      const currentPoint = orbitPointFromAnomaly(
        ORBIT_ELEMENTS,
        orbitPhase * Math.PI * 2,
      );

      // Project all points
      const orbitProjected = projectPoints(
        orbitPoints,
        rotation,
        viewScale,
        depth,
      );
      const referenceProjected = projectPoints(
        referencePoints,
        rotation,
        viewScale,
        depth,
      );
      const currentProjected = projectPoint(
        applyRotation(currentPoint, rotation),
        viewScale,
        depth,
      );

      // Clear & Background
      const gradient = context.createRadialGradient(
        width * 0.5,
        height * 0.5,
        0,
        width * 0.5,
        height * 0.5,
        Math.max(width, height),
      );
      gradient.addColorStop(0, "rgba(24, 36, 64, 0.9)");
      gradient.addColorStop(1, "rgba(2, 6, 23, 1)");

      context.fillStyle = gradient;
      context.fillRect(0, 0, width, height);

      // Draw Stars
      for (const star of stars) {
        const twinkle = 0.6 + 0.4 * Math.sin(elapsed * star.twinkle);
        context.fillStyle = `rgba(255, 255, 255, ${star.alpha * twinkle})`;
        context.beginPath();
        context.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        context.fill();
      }

      // Draw Paths
      // Reference orbit (faint)
      drawPath(referenceProjected, "rgba(148, 163, 184, 0.2)", 1);

      // Main orbit (back)
      drawPath(orbitProjected, "rgba(34, 211, 238, 0.2)", 1.2);

      // Main orbit (front/bright)
      drawPath(
        orbitProjected,
        "rgba(125, 211, 252, 0.75)",
        1.6,
        (point) => point.z > 0, // Only draw parts closer to camera
      );

      // Draw Sun
      context.beginPath();
      context.fillStyle = "rgba(255, 190, 92, 0.95)";
      context.shadowColor = "rgba(255, 190, 92, 0.7)";
      context.shadowBlur = 16;
      context.arc(width / 2, height / 2, 6, 0, Math.PI * 2);
      context.fill();
      context.shadowBlur = 0;

      // Draw Object
      context.beginPath();
      context.fillStyle = "rgba(56, 189, 248, 0.95)";
      context.shadowColor = "rgba(56, 189, 248, 0.8)";
      context.shadowBlur = 12;
      context.arc(
        width / 2 + currentProjected.x,
        height / 2 + currentProjected.y,
        4.5 * currentProjected.scale,
        0,
        Math.PI * 2,
      );
      context.fill();
      context.shadowBlur = 0;

      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationId);
      observer.disconnect();
      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerup", handlePointerUp);
      canvas.removeEventListener("pointerleave", handlePointerUp);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden rounded-2xl border border-border bg-slate-950"
      style={{
        aspectRatio: `${CANVAS_ASPECT_RATIO}`,
        minHeight: `${MIN_CANVAS_HEIGHT_PX}px`
      }}
    >
      <canvas
        ref={canvasRef}
        className="h-full w-full touch-none"
        role="img"
        aria-label="3D orbit of 3I/ATLAS"
      />
      <div className="pointer-events-none absolute left-4 top-4 rounded-full bg-white/10 px-3 py-1 text-xs text-white">
        Drag to rotate the orbit.
      </div>
    </div>
  );
}

export default function Playground() {
  const [timestamp, setTimestamp] = useState<string>("");

  useEffect(() => {
    // Client-side only
    setTimestamp(new Date().toUTCString());
  }, []);

  return (
    <div className="px-6 md:px-12 py-10 lg:py-16 space-y-8">
      <header className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-muted-foreground">
          Playground
        </p>
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-foreground">
            3I/ATLAS Orbit
          </h1>
          <p className="text-muted-foreground">
            A lightweight 3D orbit sketch that tracks a simulated current
            position. Drag to rotate the view.
          </p>
        </div>
      </header>

      <OrbitCanvas />

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-4">
          <h2 className="text-sm font-semibold text-foreground">
            Orbit elements (illustrative)
          </h2>
          <dl className="mt-3 space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center justify-between">
              <dt>Semi-major axis</dt>
              <dd className="text-foreground">
                {formatNumber(ORBIT_ELEMENTS.semiMajorAxis, 2)} AU
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt>Eccentricity</dt>
              <dd className="text-foreground">
                {formatNumber(ORBIT_ELEMENTS.eccentricity, 2)}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt>Inclination</dt>
              <dd className="text-foreground">
                {formatNumber(ORBIT_ELEMENTS.inclinationDeg, 1)} deg
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt>Ascending node</dt>
              <dd className="text-foreground">
                {formatNumber(ORBIT_ELEMENTS.ascendingNodeDeg, 1)} deg
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt>Argument of periapsis</dt>
              <dd className="text-foreground">
                {formatNumber(ORBIT_ELEMENTS.argPeriapsisDeg, 1)} deg
              </dd>
            </div>
          </dl>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <h2 className="text-sm font-semibold text-foreground">Status</h2>
          <dl className="mt-3 space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center justify-between">
              <dt>Scene timestamp (UTC)</dt>
              <dd className="text-foreground">
                {timestamp || "Loading..."}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt>Orbit period (sim)</dt>
              <dd className="text-foreground">{ORBIT_PERIOD_SECONDS}s</dd>
            </div>
            <div className="pt-2 text-xs text-muted-foreground">
              Swap in live ephemeris data to sync the orbit with real
              observations.
            </div>
          </dl>
        </div>
      </section>
    </div>
  );
}
