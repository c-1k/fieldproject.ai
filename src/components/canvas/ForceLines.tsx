"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { PARTICLES, CANONICAL_FLOW } from "@/lib/particles";

const LINE_COLOR = new THREE.Color("#6b84a8");

export default function ForceLines() {
  const lines = useMemo(() => {
    return CANONICAL_FLOW.map((edge) => {
      const from = PARTICLES[edge.from];
      const to = PARTICLES[edge.to];
      if (!from || !to) return null;

      const start = new THREE.Vector3(...from.position);
      const end = new THREE.Vector3(...to.position);

      // Compute control points for a gentle arc
      const mid = new THREE.Vector3().lerpVectors(start, end, 0.5);
      mid.y += 0.4;

      const cp1 = new THREE.Vector3().lerpVectors(start, mid, 0.5);
      cp1.y += 0.2;
      const cp2 = new THREE.Vector3().lerpVectors(mid, end, 0.5);
      cp2.y += 0.2;

      const curve = new THREE.CubicBezierCurve3(start, cp1, cp2, end);
      const points = curve.getPoints(32);

      return { points };
    }).filter(Boolean) as { points: THREE.Vector3[] }[];
  }, []);

  return (
    <group>
      {lines.map((line, i) => {
        const geometry = new THREE.BufferGeometry().setFromPoints(line.points);

        return (
          <primitive
            key={i}
            object={
              new THREE.Line(
                geometry,
                new THREE.LineBasicMaterial({
                  color: LINE_COLOR,
                  transparent: true,
                  opacity: 0.2,
                })
              )
            }
          />
        );
      })}
    </group>
  );
}
