import * as fs from "node:fs";
import * as path from "node:path";
import { Type } from "typebox";
import { getAgentDir, parseFrontmatter, type ExtensionAPI } from "@earendil-works/pi-coding-agent";

interface AgentConfig {
	name: string;
	description: string;
	model: string;
	tools: string[];
	maxTaskChars: number;
	systemPrompt: string;
}

interface RunResult {
	agent: string;
	model: string;
	output: string;
}

const NOVEL_SUBAGENTS_DIR = path.join(getAgentDir(), "novel", "subagents");

function collectMarkdownFiles(dir: string): string[] {
	if (!fs.existsSync(dir)) return [];
	const files: string[] = [];
	const entries = fs
		.readdirSync(dir, { withFileTypes: true })
		.sort((left, right) => left.name.localeCompare(right.name));
	for (const entry of entries) {
		const filePath = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			files.push(...collectMarkdownFiles(filePath));
		} else if (entry.isFile() && entry.name.endsWith(".md")) {
			files.push(filePath);
		}
	}
	return files;
}

function loadAgents(): AgentConfig[] {
	const agents: AgentConfig[] = [];
	const names = new Set<string>();
	for (const filePath of collectMarkdownFiles(NOVEL_SUBAGENTS_DIR)) {
		const raw = fs.readFileSync(filePath, "utf8");
		const { frontmatter, body } = parseFrontmatter<Record<string, string>>(raw);
		if (!frontmatter.name?.startsWith("novel-") || !frontmatter.description || !body.trim()) continue;
		if (names.has(frontmatter.name)) {
			throw new Error(`小说子智能体名称重复：${frontmatter.name}（文件：${filePath}）`);
		}
		names.add(frontmatter.name);
		const parsedLimit = Number(frontmatter["max-task-chars"] || "200000");
		agents.push({
			name: frontmatter.name,
			description: frontmatter.description,
			model: frontmatter.model || "deepseek/deepseek-v4-flash",
			tools: (frontmatter.tools || "read,grep,find,ls")
				.split(",")
				.map((item) => item.trim())
				.filter(Boolean),
			maxTaskChars: Number.isFinite(parsedLimit) && parsedLimit > 0 ? parsedLimit : 200000,
			systemPrompt: body.trim(),
		});
	}
	return agents;
}

async function runAgent(
	pi: ExtensionAPI,
	agents: AgentConfig[],
	agentName: string,
	task: string,
	cwd: string,
	signal?: AbortSignal,
): Promise<RunResult> {
	const agent = agents.find((item) => item.name === agentName);
	if (!agent) {
		throw new Error(`未知子智能体 ${agentName}。可用角色：${agents.map((item) => item.name).join(", ") || "无"}`);
	}
	if (task.length > agent.maxTaskChars) {
		throw new Error(
			`${agentName} 的任务输入为 ${task.length} 字符，超过 ${agent.maxTaskChars} 字符上限。先调用 novel-context-compressor 或 novel-reality-screen，用 Flash 压缩后再提交核心判断。`,
		);
	}
	const args = [
		"--mode",
		"text",
		"--print",
		"--no-session",
		"--no-extensions",
		"--no-skills",
		"--no-prompt-templates",
		"--no-context-files",
		"--model",
		agent.model,
		"--tools",
		agent.tools.join(","),
		"--system-prompt",
		agent.systemPrompt,
		`任务：${task}`,
	];
	const result = await pi.exec("pi", args, { cwd, signal, timeout: 900_000 });
	if (result.code !== 0) {
		throw new Error(result.stderr.trim() || result.stdout.trim() || `子智能体退出码 ${result.code}`);
	}
	const output = result.stdout.trim();
	if (!output) throw new Error(result.stderr.trim() || "子智能体没有返回可用文本");
	return { agent: agentName, model: agent.model, output };
}

async function mapLimited<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
	const results: R[] = new Array(items.length);
	let next = 0;
	const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
		while (true) {
			const index = next++;
			if (index >= items.length) return;
			results[index] = await fn(items[index]);
		}
	});
	await Promise.all(workers);
	return results;
}

const TaskItem = Type.Object({
	agent: Type.String({ description: "小说门面内部使用的角色名称" }),
	task: Type.String({ description: "交给该角色的任务；长材料应通过文件路径提供" }),
});

const Params = Type.Object({
	agent: Type.Optional(Type.String({ description: "单任务模式的子智能体名称" })),
	task: Type.Optional(Type.String({ description: "单任务模式的任务" })),
	tasks: Type.Optional(Type.Array(TaskItem, { description: "可并行执行的任务，最多 6 个" })),
	chain: Type.Optional(
		Type.Array(TaskItem, {
			description: "顺序任务；后续任务可用 {previous} 引用上一步输出",
		}),
	),
});

export default function novelTeamExtension(pi: ExtensionAPI) {
	pi.registerTool({
		name: "novel",
		label: "小说工作室",
		description:
			"Pi 唯一公开的小说门面。仅在用户手动调用 /novel 并提供自然语言任务后，调度 novel/subagents/ 内部角色。Flash 处理长文本；OpenAI 核心角色有 12000 字符硬上限。支持单角色、并行和串行工作流。",
		promptSnippet: "手动小说工作流的唯一公开入口",
		promptGuidelines: [
			"不要主动启动 novel；只在用户输入 /novel 并提供自然语言任务后使用。",
			"novel 是唯一公开入口；novel/subagents/ 中的角色是内部实现，不要把它们当成独立公开智能体。",
			"不得把原始小说、整章稿件或大段项目资料直接提交给 OpenAI 小说角色；先用 novel-context-compressor 或 novel-reality-screen 压缩。",
			"仅 novel-core-architect 和 novel-reality-judge 使用 OpenAI；其他小说角色必须使用 DeepSeek Flash。",
		],
		parameters: Params,
		async execute(_id, params, signal, onUpdate, ctx) {
			const agents = loadAgents();
			const single = Boolean(params.agent && params.task);
			const parallel = Boolean(params.tasks?.length);
			const chain = Boolean(params.chain?.length);
			if (Number(single) + Number(parallel) + Number(chain) !== 1) {
				throw new Error("请只选择一种模式：agent+task、tasks 或 chain");
			}

			if (single && params.agent && params.task) {
				onUpdate?.({ content: [{ type: "text", text: `正在调用 ${params.agent}…` }] });
				const result = await runAgent(pi, agents, params.agent, params.task, ctx.cwd, signal);
				return { content: [{ type: "text", text: result.output }], details: result };
			}

			if (params.tasks?.length) {
				if (params.tasks.length > 6) throw new Error("并行任务最多 6 个");
				onUpdate?.({ content: [{ type: "text", text: `正在并行调用 ${params.tasks.length} 个子智能体…` }] });
				const results = await mapLimited(params.tasks, 3, (item) =>
					runAgent(pi, agents, item.agent, item.task, ctx.cwd, signal),
				);
				const text = results
					.map((result) => `## ${result.agent} (${result.model})\n\n${result.output}`)
					.join("\n\n---\n\n");
				return { content: [{ type: "text", text }], details: { mode: "parallel", results } };
			}

			const results: RunResult[] = [];
			let previous = "";
			for (const [index, item] of (params.chain || []).entries()) {
				onUpdate?.({ content: [{ type: "text", text: `正在执行第 ${index + 1} 步：${item.agent}…` }] });
				const expandedTask = item.task.replaceAll("{previous}", previous.slice(-200_000));
				const result = await runAgent(pi, agents, item.agent, expandedTask, ctx.cwd, signal);
				results.push(result);
				previous = result.output;
			}
			return { content: [{ type: "text", text: previous }], details: { mode: "chain", results } };
		},
	});
}
