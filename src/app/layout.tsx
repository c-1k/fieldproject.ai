import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
	title: "Field Project — The Coordination Layer for AI Agent Swarms",
	description:
		"Your AI agents keep stepping on each other's code. Turf gives every agent its own scope, its own workspace, and a merge queue that actually works. Works with Claude Code, Cursor, Aider, Copilot.",
	metadataBase: new URL("https://fieldproject.ai"),
	openGraph: {
		title: "Field Project — The Coordination Layer for AI Agent Swarms",
		description:
			"Scope leasing, workspace isolation, and merge queues for AI coding agents. Zero conflicts.",
		url: "https://fieldproject.ai",
		siteName: "Field Project",
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: "Field Project",
		description: "The coordination layer for AI agent swarms.",
	},
	robots: {
		index: true,
		follow: true,
	},
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" className="dark">
			<head>
				<link rel="preconnect" href="https://rsms.me/" />
				<link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: JSON.stringify({
							"@context": "https://schema.org",
							"@type": "SoftwareApplication",
							name: "Turf",
							description:
								"Multi-agent coordination for AI coding agents. Scope leasing, workspace isolation, merge queues, and audit trails.",
							url: "https://fieldproject.ai",
							applicationCategory: "DeveloperApplication",
							applicationSubCategory: "BuildTool",
							operatingSystem: ["Linux", "macOS", "Windows"],
							runtimePlatform: "Node.js",
							softwareRequirements: "npm or bun",
							isAccessibleForFree: true,
							license: "https://opensource.org/licenses/MIT",
							downloadUrl: "https://www.npmjs.com/package/@c-1k/turf",
							installUrl: "https://www.npmjs.com/package/@c-1k/turf",
							featureList: [
								"Scope leasing — glob-pattern file ownership with TTL",
								"Workspace isolation — isolated git worktrees per agent",
								"Merge queue — ordered integration pipeline",
								"Audit trail — every claim, release, merge recorded",
								"Agent-agnostic — works with any AI coding agent",
							],
							keywords: [
								"AI agents",
								"multi-agent coordination",
								"scope leasing",
								"merge queue",
								"Claude Code",
								"Cursor",
								"Aider",
								"Copilot",
							],
							author: {
								"@type": "Organization",
								name: "Field Project",
								url: "https://fieldproject.ai",
							},
							sourceOrganization: {
								"@type": "Organization",
								name: "Field Project",
								url: "https://fieldproject.ai",
							},
						}),
					}}
				/>
			</head>
			<body>{children}</body>
		</html>
	);
}
