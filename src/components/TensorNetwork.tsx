"use client";

import { useRef, useMemo, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

// --- Types ---
interface TurfNode {
	id: string;
	label: string;
	description: string;
	command: string;
	position: [number, number, number];
	color: string;
}

interface TurfEdge {
	from: string;
	to: string;
	label: string;
}

// --- Turf Protocol Graph Data ---
const NODES: TurfNode[] = [
	{
		id: "scope-lease",
		label: "Scope Lease",
		description: "TTL-based file ownership preventing concurrent edits",
		command: 'turf claim --scope "src/**" --ttl-min 60',
		position: [0, 1.5, 0],
		color: "#3b82f6",
	},
	{
		id: "workspace",
		label: "Workspace",
		description: "Isolated git worktrees per agent with shared state",
		command: "turf workspace allocate --name agent-1",
		position: [-2.5, 0, 0.5],
		color: "#8b5cf6",
	},
	{
		id: "merge-queue",
		label: "Merge Queue",
		description: "Ordered integration pipeline preventing merge conflicts",
		command: "turf done --risk low --gates fast",
		position: [2.5, 0, 0.5],
		color: "#06b6d4",
	},
	{
		id: "worker",
		label: "Worker",
		description: "AI coding agent registered in the coordination system",
		command: "turf worker register --id agent-1",
		position: [-1.5, -1.8, 0],
		color: "#10b981",
	},
	{
		id: "daemon",
		label: "Daemon",
		description: "Background process that auto-merges approved queue items",
		command: "turf daemon start",
		position: [1.5, -1.8, 0],
		color: "#f59e0b",
	},
	{
		id: "audit",
		label: "Audit Trail",
		description: "Append-only event log of every coordination action",
		command: "turf status --verbose",
		position: [0, -0.5, -1],
		color: "#ef4444",
	},
];

const EDGES: TurfEdge[] = [
	{ from: "worker", to: "scope-lease", label: "claims" },
	{ from: "worker", to: "workspace", label: "allocates" },
	{ from: "scope-lease", to: "merge-queue", label: "protects" },
	{ from: "worker", to: "merge-queue", label: "submits" },
	{ from: "daemon", to: "merge-queue", label: "merges" },
	{ from: "audit", to: "scope-lease", label: "records" },
	{ from: "audit", to: "merge-queue", label: "records" },
	{ from: "audit", to: "workspace", label: "records" },
];

// --- Ambient Particles ---
function AmbientParticles({ count = 2000 }: { count?: number }) {
	const meshRef = useRef<THREE.InstancedMesh>(null);
	const mouse = useRef(new THREE.Vector2(0, 0));
	const dummy = useMemo(() => new THREE.Object3D(), []);

	const particles = useMemo(() => {
		const positions = new Float32Array(count * 3);
		const velocities = new Float32Array(count * 3);
		const scales = new Float32Array(count);
		for (let i = 0; i < count; i++) {
			positions[i * 3] = (Math.random() - 0.5) * 12;
			positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
			positions[i * 3 + 2] = (Math.random() - 0.5) * 6;
			velocities[i * 3] = (Math.random() - 0.5) * 0.002;
			velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.002;
			velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.001;
			scales[i] = Math.random() * 0.5 + 0.2;
		}
		return { positions, velocities, scales };
	}, [count]);

	const handlePointerMove = useCallback(
		(e: { clientX: number; clientY: number }) => {
			mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
			mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
		},
		[],
	);

	// Attach global mousemove
	useMemo(() => {
		if (typeof window !== "undefined") {
			window.addEventListener("mousemove", handlePointerMove);
		}
		return () => {
			if (typeof window !== "undefined") {
				window.removeEventListener("mousemove", handlePointerMove);
			}
		};
	}, [handlePointerMove]);

	useFrame((state) => {
		if (!meshRef.current) return;
		const time = state.clock.elapsedTime;

		for (let i = 0; i < count; i++) {
			let x = particles.positions[i * 3]!;
			let y = particles.positions[i * 3 + 1]!;
			let z = particles.positions[i * 3 + 2]!;

			// Drift
			x += particles.velocities[i * 3]!;
			y += particles.velocities[i * 3 + 1]!;
			z += particles.velocities[i * 3 + 2]!;

			// Gentle orbit
			x += Math.sin(time * 0.1 + i * 0.01) * 0.001;
			y += Math.cos(time * 0.15 + i * 0.01) * 0.001;

			// Mouse repulsion
			const mx = mouse.current.x * 5;
			const my = mouse.current.y * 3;
			const dx = x - mx;
			const dy = y - my;
			const dist = Math.sqrt(dx * dx + dy * dy);
			if (dist < 2) {
				const force = (2 - dist) * 0.003;
				x += dx * force;
				y += dy * force;
			}

			// Wrap bounds
			if (x > 6) x = -6;
			if (x < -6) x = 6;
			if (y > 4) y = -4;
			if (y < -4) y = 4;
			if (z > 3) z = -3;
			if (z < -3) z = 3;

			particles.positions[i * 3] = x;
			particles.positions[i * 3 + 1] = y;
			particles.positions[i * 3 + 2] = z;

			const scale =
				particles.scales[i]! * (0.8 + 0.2 * Math.sin(time + i));
			dummy.position.set(x, y, z);
			dummy.scale.setScalar(scale * 0.02);
			dummy.updateMatrix();
			meshRef.current.setMatrixAt(i, dummy.matrix);
		}
		meshRef.current.instanceMatrix.needsUpdate = true;
	});

	return (
		<instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
			<sphereGeometry args={[1, 6, 6]} />
			<meshBasicMaterial color="#3b82f6" transparent opacity={0.3} />
		</instancedMesh>
	);
}

// --- Network Node ---
function NetworkNode({ node, time }: { node: TurfNode; time: number }) {
	const meshRef = useRef<THREE.Mesh>(null);
	const glowRef = useRef<THREE.Mesh>(null);

	useFrame(() => {
		if (!meshRef.current || !glowRef.current) return;
		const pulse = 1 + 0.05 * Math.sin(time * 2 + NODES.indexOf(node));
		meshRef.current.scale.setScalar(pulse);
		glowRef.current.scale.setScalar(pulse * 2.5);
	});

	return (
		<group position={node.position}>
			{/* Glow */}
			<mesh ref={glowRef}>
				<sphereGeometry args={[0.15, 16, 16]} />
				<meshBasicMaterial
					color={node.color}
					transparent
					opacity={0.08}
				/>
			</mesh>
			{/* Core */}
			<mesh ref={meshRef}>
				<sphereGeometry args={[0.08, 16, 16]} />
				<meshBasicMaterial color={node.color} />
			</mesh>
		</group>
	);
}

// --- Network Edges ---
function NetworkEdges() {
	const lines = useMemo(() => {
		return EDGES.map((edge) => {
			const fromNode = NODES.find((n) => n.id === edge.from)!;
			const toNode = NODES.find((n) => n.id === edge.to)!;
			const points = [
				new THREE.Vector3(...fromNode.position),
				new THREE.Vector3(...toNode.position),
			];
			const geometry = new THREE.BufferGeometry().setFromPoints(points);
			const material = new THREE.LineBasicMaterial({
				color: "#3b82f6",
				transparent: true,
				opacity: 0.12,
			});
			return new THREE.Line(geometry, material);
		});
	}, []);

	return (
		<group>
			{lines.map((line, i) => (
				<primitive key={i} object={line} />
			))}
		</group>
	);
}

// --- Scene ---
function Scene() {
	const groupRef = useRef<THREE.Group>(null);

	useFrame((state) => {
		if (!groupRef.current) return;
		const time = state.clock.elapsedTime;
		groupRef.current.rotation.y = Math.sin(time * 0.1) * 0.1;
		groupRef.current.rotation.x = Math.cos(time * 0.08) * 0.05;
	});

	return (
		<>
			<AmbientParticles count={1500} />
			<group ref={groupRef}>
				<NetworkEdges />
				{NODES.map((node) => (
					<NetworkNode key={node.id} node={node} time={0} />
				))}
			</group>
		</>
	);
}

// --- Semantic HTML overlay (agent-readable) ---
function SemanticOverlay() {
	return (
		<div className="sr-only" aria-hidden="false">
			{NODES.map((node) => (
				<div
					key={node.id}
					data-turf-concept={node.id}
					data-turf-description={node.description}
					data-turf-command={node.command}
				>
					{node.label}: {node.description}. Command: {node.command}
				</div>
			))}
			{EDGES.map((edge, i) => (
				<div
					key={i}
					data-turf-relation={`${edge.from}-${edge.label}-${edge.to}`}
				>
					{edge.from} {edge.label} {edge.to}
				</div>
			))}
		</div>
	);
}

// --- Export ---
export default function TensorNetwork() {
	return (
		<div className="absolute inset-0 -z-10">
			<Canvas
				camera={{ position: [0, 0, 6], fov: 50 }}
				dpr={[1, 2]}
				gl={{ antialias: true, alpha: true }}
			>
				<Scene />
			</Canvas>
			<SemanticOverlay />
		</div>
	);
}
