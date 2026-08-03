import * as fs from "node:fs";
import * as path from "node:path";
import { Type } from "typebox";
import { getAgentDir, parseFrontmatter, type ExtensionAPI } from "@earendil-works/pi-coding-agent";

type TeamName = "research" | "paper" | "review" | "syscare";
type ApprovalMode = "none" | "diagnostic";

interface AgentConfig {
	name: string;
	description: string;
	model: string;
	tools: string[];
	maxTaskChars: number;
	approval: ApprovalMode;
	systemPrompt: string;
}

interface RunResult {
	agent: string;
	model: string;
	output: string;
}

const TEAM_META: Record<
	TeamName,
	{ label: string; description: string; guidelines: string[] }
> = {
	research: {
		label: "科研工作室",
		description:
			"科研项目的唯一公开入口。读取项目资料，调度上下文压缩、实验设计、结果审计、复现审计和项目文档角色；默认不运行实验、不修改项目。",
		guidelines: [
			"长材料先交给 research-context-compressor；GPT 核心角色只接收压缩后的 RESEARCH_PACKET。",
			"不得把流畅叙述当作实验事实；区分 OBSERVED、INFERRED、PLANNED 和 UNKNOWN。",
			"除非用户明确授权，不运行实验、不改数据、不重写标准结果、不提交 Git。",
		],
	},
	paper: {
		label: "论文与投稿工作室",
		description:
			"论文、图表、引用、审稿回复和投稿检查的唯一公开入口。默认只审计；源文件修改必须来自用户明确启动的修改工作流。",
		guidelines: [
			"长稿先交给 paper-context-compressor；GPT 核心角色只接收压缩后的 CLAIM_PACKET 或 REVIEW_PACKET。",
			"不得伪造引用、DOI、实验结果、期刊要求或审稿人意图；不能核实就标 NEEDS_VERIFICATION。",
			"不得编译 LaTeX、运行 latexmk/pdflatex/xelatex/tectonic 或生成 PDF，除非用户明确要求。",
		],
	},
	review: {
		label: "工作生活复盘工作室",
		description:
			"Obsidian/PARA、日计划、周复盘、Inbox 和组会准备的唯一公开入口。默认输出建议，不自动搬移或批量改写笔记。",
		guidelines: [
			"只根据可见记录总结，不把阅读收藏、兴趣材料或偶发活动推断成长期目标。",
			"计划必须限制在可执行的少量重点，并明确证据、截止时间和等待项。",
			"未经用户明确授权，不移动、删除、批量重命名或自动美化笔记。",
		],
	},
	syscare: {
		label: "设备与服务器管家",
		description:
			"Mac、开发环境、同步、SSH/VPN 和服务器诊断的唯一公开入口。只读诊断角色在运行前强制弹出确认；非交互模式拒绝执行。",
		guidelines: [
			"默认只读。禁止安装、升级、卸载、删除、kill、重启、写配置、Git 写操作和远程变更。",
			"带 bash 的诊断角色必须经过 Pi 的交互确认；非 TUI/RPC 模式不得运行。",
			"任何修复只输出风险、回滚和待确认命令，不直接执行。",
		],
	},
};

function collectMarkdownFiles(dir: string): string[] {
	if (!fs.existsSync(dir)) return [];
	const files: string[] = [];
	for (const entry of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
		const filePath = path.join(dir, entry.name);
		if (entry.isDirectory()) files.push(...collectMarkdownFiles(filePath));
		else if (entry.isFile() && entry.name.endsWith(".md")) files.push(filePath);
	}
	return files;
}

function loadAgents(team: TeamName): AgentConfig[] {
	const dir = path.join(getAgentDir(), "workbench", team, "subagents");
	const agents: AgentConfig[] = [];
	const names = new Set<string>();
	for (const filePath of collectMarkdownFiles(dir)) {
		const raw = fs.readFileSync(filePath, "utf8");
		const { frontmatter, body } = parseFrontmatter<Record<string, string>>(raw);
		if (!frontmatter.name?.startsWith(`${team}-`) || !frontmatter.description || !body.trim()) continue;
		if (names.has(frontmatter.name)) throw new Error(`子智能体名称重复：${frontmatter.name}（${filePath}）`);
		names.add(frontmatter.name);
		const parsedLimit = Number(frontmatter["max-task-chars"] || "200000");
		const approval = frontmatter.approval === "diagnostic" ? "diagnostic" : "none";
		agents.push({
			name: frontmatter.name,
			description: frontmatter.description,
			model: frontmatter.model || "deepseek/deepseek-v4-flash",
			tools: (frontmatter.tools || "read,grep,find,ls")
				.split(",")
				.map((item) => item.trim())
				.filter(Boolean),
			maxTaskChars: Number.isFinite(parsedLimit) && parsedLimit > 0 ? parsedLimit : 200000,
			approval,
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
	if (!agent) throw new Error(`未知子智能体 ${agentName}。可用角色：${agents.map((item) => item.name).join(", ") || "无"}`);
	if (task.length > agent.maxTaskChars) {
		throw new Error(
			`${agentName} 的任务输入为 ${task.length} 字符，超过 ${agent.maxTaskChars} 字符上限。请先调用本团队的 context/compressor 角色，通过文件路径读取长材料并生成压缩证据包。`,
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
	if (result.code !== 0) throw new Error(result.stderr.trim() || result.stdout.trim() || `子智能体退出码 ${result.code}`);
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
	agent: Type.String({ description: "当前工作室内部角色名称" }),
	task: Type.String({ description: "交给该角色的任务；长材料应通过绝对路径提供" }),
});

const Params = Type.Object({
	agent: Type.Optional(Type.String({ description: "单任务模式的内部角色名称" })),
	task: Type.Optional(Type.String({ description: "单任务模式的任务" })),
	tasks: Type.Optional(Type.Array(TaskItem, { description: "可并行执行的任务，最多 6 个" })),
	chain: Type.Optional(Type.Array(TaskItem, { description: "顺序任务；后续任务可用 {previous} 引用上一步输出" })),
});

function requestedAgentNames(params: { agent?: string; tasks?: { agent: string }[]; chain?: { agent: string }[] }): string[] {
	const names: string[] = [];
	if (params.agent) names.push(params.agent);
	for (const item of params.tasks || []) names.push(item.agent);
	for (const item of params.chain || []) names.push(item.agent);
	return [...new Set(names)];
}

export default function workbenchTeamExtension(pi: ExtensionAPI) {
	for (const team of Object.keys(TEAM_META) as TeamName[]) {
		const meta = TEAM_META[team];
		pi.registerTool({
			name: team,
			label: meta.label,
			description: meta.description,
			promptSnippet: `${meta.label}的唯一公开入口`,
			promptGuidelines: meta.guidelines,
			parameters: Params,
			async execute(_id, params, signal, onUpdate, ctx) {
				const agents = loadAgents(team);
				const single = Boolean(params.agent && params.task);
				const parallel = Boolean(params.tasks?.length);
				const chain = Boolean(params.chain?.length);
				if (Number(single) + Number(parallel) + Number(chain) !== 1) {
					throw new Error("请只选择一种模式：agent+task、tasks 或 chain");
				}

				const requested = requestedAgentNames(params);
				const diagnosticAgents = requested
					.map((name) => agents.find((agent) => agent.name === name))
					.filter((agent): agent is AgentConfig => agent?.approval === "diagnostic");
				if (diagnosticAgents.length) {
					if (!ctx.hasUI) throw new Error("带命令诊断能力的角色只能在交互式 Pi 中运行，非交互模式已拒绝。 ");
					const ok = await ctx.ui.confirm(
						"允许只读设备诊断？",
						`即将运行：${diagnosticAgents.map((agent) => agent.name).join(", ")}\n\n允许读取系统状态并执行白名单诊断命令；不允许安装、删除、写配置、重启、kill、Git 写操作或远程变更。`,
					);
					if (!ok) return { content: [{ type: "text", text: "已取消设备诊断。" }], details: { canceled: true } };
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
					const text = results.map((result) => `## ${result.agent} (${result.model})\n\n${result.output}`).join("\n\n---\n\n");
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
}
