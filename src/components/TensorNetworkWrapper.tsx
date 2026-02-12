"use client";

import dynamic from "next/dynamic";

const TensorNetwork = dynamic(
	() => import("@/components/TensorNetwork"),
	{ ssr: false },
);

export default function TensorNetworkWrapper() {
	return <TensorNetwork />;
}
