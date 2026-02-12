import TensorNetworkWrapper from "@/components/TensorNetworkWrapper";

const FEATURES = [
	{
		title: "Scope Leasing",
		description:
			"Agents claim file ownership via glob patterns with TTL. No two agents edit the same files. Conflicts are impossible by construction.",
		command: 'turf claim --scope "src/auth/**" --ttl-min 60',
		icon: "{}",
	},
	{
		title: "Workspace Isolation",
		description:
			"Every agent gets its own git worktree with a shared coordination directory. Branch-switching chaos eliminated.",
		command: "turf workspace allocate --name agent-1 --branch feat/auth",
		icon: "[]",
	},
	{
		title: "Merge Queue",
		description:
			"Agents submit completed work to an ordered queue. The daemon merges them sequentially. No race conditions.",
		command: "turf done --risk low --gates fast",
		icon: ">>",
	},
	{
		title: "Audit Trail",
		description:
			"Every scope claim, release, merge, and conflict is recorded. Full observability into what your agents did and why.",
		command: "turf status --verbose",
		icon: "##",
	},
	{
		title: "Agent-Agnostic",
		description:
			"Works with any AI coding agent. Claude Code, Cursor, Aider, Copilot, Devin. If it can run a CLI command, it can use Turf.",
		command: "npx @c-1k/turf init",
		icon: "<>",
	},
];

const STATS = [
	{ value: "1,671", label: "tests passing" },
	{ value: "0", label: "conflicts in 12-agent sprint" },
	{ value: "5,956", label: "lines of TypeScript" },
	{ value: "< 10min", label: "to coordinate 12 agents" },
];

const COMPATIBLE = [
	"Claude Code",
	"Cursor",
	"Aider",
	"GitHub Copilot",
	"Devin",
	"Windsurf",
	"Roo Code",
	"Any CLI agent",
];

export default function Home() {
	return (
		<main className="relative">
			{/* ===== HERO ===== */}
			<section className="relative min-h-screen flex items-center justify-center overflow-hidden">
				<TensorNetworkWrapper />

				<div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
					<div className="inline-block mb-6 px-3 py-1 rounded-full border border-[var(--border)] text-xs text-[var(--text-secondary)] tracking-wider uppercase">
						Introducing Turf
					</div>

					<h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
						Your AI agents keep
						<br />
						<span className="text-[var(--accent)]">
							stepping on each other&apos;s code.
						</span>
					</h1>

					<p className="text-lg sm:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-10 leading-relaxed">
						Turf gives every agent its own scope, its own workspace,
						and a merge queue that actually works.
					</p>

					{/* Install command */}
					<div className="inline-flex items-center gap-3 bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg px-5 py-3 mb-8 font-mono text-sm">
						<span className="text-[var(--text-tertiary)]">$</span>
						<span className="text-[var(--text-primary)]">
							npm install @c-1k/turf
						</span>
						<button
							className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors ml-2"
							title="Copy to clipboard"
						>
							<svg
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
							>
								<rect
									x="9"
									y="9"
									width="13"
									height="13"
									rx="2"
								/>
								<path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
							</svg>
						</button>
					</div>

					<div className="flex items-center justify-center gap-4">
						<a
							href="https://github.com/c-1k/fermion"
							className="px-6 py-3 bg-[var(--accent)] text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
						>
							View on GitHub
						</a>
						<a
							href="#features"
							className="px-6 py-3 border border-[var(--border)] text-[var(--text-secondary)] rounded-lg font-medium hover:border-[var(--border-hover)] hover:text-[var(--text-primary)] transition-all"
						>
							Learn more
						</a>
					</div>
				</div>

				{/* Gradient fade at bottom */}
				<div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[var(--bg)] to-transparent" />
			</section>

			{/* ===== PROBLEM ===== */}
			<section className="py-24 px-6">
				<div className="max-w-4xl mx-auto text-center">
					<h2 className="text-3xl sm:text-4xl font-bold mb-6">
						12 agents. One repo. Zero coordination.
					</h2>
					<p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto mb-12 leading-relaxed">
						You spin up a dozen AI agents to parallelize your
						codebase. They all checkout the same branch. They all
						edit the same files. You get merge hell, overwritten
						work, and hours of manual cleanup.
					</p>

					<div className="grid md:grid-cols-2 gap-6 text-left">
						<div className="p-6 rounded-xl border border-red-500/20 bg-red-500/5">
							<div className="text-red-400 font-mono text-sm mb-3">
								Without Turf
							</div>
							<ul className="space-y-2 text-[var(--text-secondary)] text-sm">
								<li>
									Agent A and Agent B both edit
									src/auth/middleware.ts
								</li>
								<li>
									Agent C&apos;s branch conflicts with Agent
									D&apos;s branch
								</li>
								<li>3 hours of manual merge resolution</li>
								<li>You swear off multi-agent workflows</li>
							</ul>
						</div>
						<div className="p-6 rounded-xl border border-[var(--accent)]/20 bg-[var(--accent)]/5">
							<div className="text-[var(--accent)] font-mono text-sm mb-3">
								With Turf
							</div>
							<ul className="space-y-2 text-[var(--text-secondary)] text-sm">
								<li>
									Agent A claims src/auth/**, Agent B claims
									src/api/**
								</li>
								<li>
									Each agent works in an isolated worktree
								</li>
								<li>
									Merge queue integrates work sequentially
								</li>
								<li>12 agents, 10 minutes, zero conflicts</li>
							</ul>
						</div>
					</div>
				</div>
			</section>

			{/* ===== FEATURES ===== */}
			<section id="features" className="py-24 px-6">
				<div className="max-w-5xl mx-auto">
					<div className="text-center mb-16">
						<h2 className="text-3xl sm:text-4xl font-bold mb-4">
							Five primitives. Zero conflicts.
						</h2>
						<p className="text-[var(--text-secondary)] text-lg">
							Everything your agents need to work in parallel
							without stepping on each other.
						</p>
					</div>

					<div className="grid gap-6">
						{FEATURES.map((feature) => (
							<div
								key={feature.title}
								className="group p-6 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] hover:border-[var(--border-hover)] transition-colors"
							>
								<div className="flex items-start gap-4">
									<div className="font-mono text-[var(--accent)] text-lg mt-0.5 opacity-50">
										{feature.icon}
									</div>
									<div className="flex-1">
										<h3 className="text-xl font-semibold mb-2">
											{feature.title}
										</h3>
										<p className="text-[var(--text-secondary)] mb-4 leading-relaxed">
											{feature.description}
										</p>
										<code className="inline-block px-3 py-1.5 rounded-md bg-[var(--bg)] border border-[var(--border)] text-sm text-[var(--text-secondary)] font-mono">
											$ {feature.command}
										</code>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* ===== HOW IT WORKS ===== */}
			<section className="py-24 px-6 border-t border-[var(--border)]">
				<div className="max-w-3xl mx-auto">
					<h2 className="text-3xl sm:text-4xl font-bold text-center mb-16">
						How it works
					</h2>

					<div className="space-y-0">
						{[
							{
								step: "1",
								title: "Initialize",
								cmd: "npx @c-1k/turf init",
								desc: "Creates .coord/ directory and turf.config.json in your repo.",
							},
							{
								step: "2",
								title: "Agents claim scope",
								cmd: 'turf claim --scope "src/auth/**" --ttl-min 60',
								desc: "Each agent declares which files it will edit. Conflicts are rejected.",
							},
							{
								step: "3",
								title: "Agents work in isolation",
								cmd: "turf workspace allocate --name agent-1",
								desc: "Each agent gets its own git worktree. No branch interference.",
							},
							{
								step: "4",
								title: "Agents submit to queue",
								cmd: "turf done --risk low --gates fast",
								desc: "Pushes the branch, enqueues for merge, releases the scope lease.",
							},
							{
								step: "5",
								title: "Daemon merges sequentially",
								cmd: "turf daemon start",
								desc: "Background process integrates queued work in order. Zero conflicts.",
							},
						].map((item) => (
							<div
								key={item.step}
								className="flex gap-6 pb-10 relative"
							>
								{/* Vertical line */}
								<div className="flex flex-col items-center">
									<div className="w-8 h-8 rounded-full border border-[var(--accent)] flex items-center justify-center text-sm font-mono text-[var(--accent)] shrink-0">
										{item.step}
									</div>
									{item.step !== "5" && (
										<div className="w-px flex-1 bg-[var(--border)] mt-2" />
									)}
								</div>
								<div className="pb-2">
									<h3 className="font-semibold text-lg mb-1">
										{item.title}
									</h3>
									<p className="text-[var(--text-secondary)] text-sm mb-3">
										{item.desc}
									</p>
									<code className="inline-block px-3 py-1.5 rounded-md bg-[var(--bg-surface)] border border-[var(--border)] text-xs text-[var(--text-secondary)] font-mono">
										$ {item.cmd}
									</code>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* ===== STATS ===== */}
			<section className="py-24 px-6 border-t border-[var(--border)]">
				<div className="max-w-4xl mx-auto">
					<div className="grid grid-cols-2 md:grid-cols-4 gap-8">
						{STATS.map((stat) => (
							<div key={stat.label} className="text-center">
								<div className="text-3xl sm:text-4xl font-bold text-[var(--accent)] mb-2">
									{stat.value}
								</div>
								<div className="text-sm text-[var(--text-secondary)]">
									{stat.label}
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* ===== COMPATIBILITY ===== */}
			<section className="py-24 px-6 border-t border-[var(--border)]">
				<div className="max-w-3xl mx-auto text-center">
					<h2 className="text-3xl sm:text-4xl font-bold mb-4">
						Works with every agent
					</h2>
					<p className="text-[var(--text-secondary)] text-lg mb-10">
						If it can run a CLI command, it can use Turf.
					</p>
					<div className="flex flex-wrap items-center justify-center gap-3">
						{COMPATIBLE.map((name) => (
							<span
								key={name}
								className="px-4 py-2 rounded-full border border-[var(--border)] bg-[var(--bg-elevated)] text-sm text-[var(--text-secondary)]"
							>
								{name}
							</span>
						))}
					</div>
				</div>
			</section>

			{/* ===== FINAL CTA ===== */}
			<section className="py-32 px-6 border-t border-[var(--border)]">
				<div className="max-w-3xl mx-auto text-center">
					<h2 className="text-3xl sm:text-5xl font-bold mb-6">
						Stop resolving merge conflicts.
						<br />
						<span className="text-[var(--accent)]">
							Start shipping.
						</span>
					</h2>

					<div className="inline-flex items-center gap-3 bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg px-5 py-3 mb-8 font-mono text-sm">
						<span className="text-[var(--text-tertiary)]">$</span>
						<span>npm install @c-1k/turf</span>
					</div>

					<div className="flex items-center justify-center gap-4">
						<a
							href="https://github.com/c-1k/fermion"
							className="px-6 py-3 bg-[var(--accent)] text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
						>
							View on GitHub
						</a>
						<a
							href="https://www.npmjs.com/package/@c-1k/turf"
							className="px-6 py-3 border border-[var(--border)] text-[var(--text-secondary)] rounded-lg font-medium hover:border-[var(--border-hover)] hover:text-[var(--text-primary)] transition-all"
						>
							npm package
						</a>
					</div>
				</div>
			</section>

			{/* ===== FOOTER ===== */}
			<footer className="py-12 px-6 border-t border-[var(--border)]">
				<div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
					<div className="text-sm text-[var(--text-tertiary)]">
						Field Project
					</div>
					<div className="flex items-center gap-6 text-sm text-[var(--text-tertiary)]">
						<a
							href="https://github.com/c-1k/fermion"
							className="hover:text-[var(--text-secondary)] transition-colors"
						>
							GitHub
						</a>
						<a
							href="https://www.npmjs.com/package/@c-1k/turf"
							className="hover:text-[var(--text-secondary)] transition-colors"
						>
							npm
						</a>
						<a
							href="https://github.com/c-1k/fermion/blob/main/docs/API-REFERENCE.md"
							className="hover:text-[var(--text-secondary)] transition-colors"
						>
							Docs
						</a>
					</div>
				</div>
			</footer>
		</main>
	);
}
