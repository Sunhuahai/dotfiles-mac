/**
 * Minimal rounded input frame for Pi.
 *
 * Keeps the normal editor behavior and autocomplete, adds compact live status,
 * and deliberately registers no commands, shortcuts, or tools.
 */

import {
	CustomEditor,
	type ExtensionAPI,
	type ExtensionContext,
	type KeybindingsManager,
} from "@earendil-works/pi-coding-agent";
import type { Component, EditorTheme, TUI } from "@earendil-works/pi-tui";
import { truncateToWidth, visibleWidth } from "@earendil-works/pi-tui";

function fitRoundedBorder(
	left: string,
	right: string,
	width: number,
	border: (text: string) => string,
	top: boolean,
): string {
	if (width <= 0) return "";
	if (width === 1) return border(top ? "╭" : "╰");

	const leftCorner = top ? "╭" : "╰";
	const rightCorner = top ? "╮" : "╯";
	const minimumGap = 3;
	let leftText = left;
	let rightText = right;

	while (2 + visibleWidth(leftText) + visibleWidth(rightText) + minimumGap > width && visibleWidth(rightText) > 0) {
		rightText = truncateToWidth(rightText, Math.max(0, visibleWidth(rightText) - 1), "");
	}
	while (2 + visibleWidth(leftText) + visibleWidth(rightText) + minimumGap > width && visibleWidth(leftText) > 0) {
		leftText = truncateToWidth(leftText, Math.max(0, visibleWidth(leftText) - 1), "");
	}

	const fillWidth = Math.max(0, width - 2 - visibleWidth(leftText) - visibleWidth(rightText));
	return `${border(leftCorner)}${leftText}${border("─".repeat(fillWidth))}${rightText}${border(rightCorner)}`;
}

function formatCount(value: number): string {
	if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(value >= 10_000_000 ? 0 : 1)}M`;
	if (value >= 1_000) return `${Math.round(value / 1_000)}K`;
	return String(value);
}

function formatContext(ctx: ExtensionContext): string {
	const usage = ctx.getContextUsage();
	const contextWindow = usage?.contextWindow ?? ctx.model?.contextWindow;
	if (!contextWindow) return "ctx ?";

	const used = usage?.tokens;
	const percent = usage?.percent;
	if (used === null || used === undefined || percent === null || percent === undefined) {
		return `ctx ?/${formatCount(contextWindow)}`;
	}
	return `ctx ${Math.round(percent)}% · ${formatCount(used)}/${formatCount(contextWindow)}`;
}

function formatCwd(cwd: string): string {
	const home = process.env.HOME;
	return home && cwd.startsWith(home) ? `~${cwd.slice(home.length)}` : cwd;
}

function modelLabel(ctx: ExtensionContext): string {
	return ctx.model ? `${ctx.model.provider}/${ctx.model.id}` : "model unavailable";
}

class EmptyFooter implements Component {
	render(): string[] {
		return [];
	}

	invalidate(): void {}
}

export default function inputFrame(pi: ExtensionAPI) {
	let isWorking = false;
	let activity = "thinking";
	let spinnerIndex = 0;
	let spinnerTimer: ReturnType<typeof setInterval> | undefined;
	let activeTui: TUI | undefined;
	const spinnerFrames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

	const requestRender = () => activeTui?.requestRender();
	const stopSpinner = () => {
		if (spinnerTimer) {
			clearInterval(spinnerTimer);
			spinnerTimer = undefined;
		}
	};

	pi.on("agent_start", () => {
		isWorking = true;
		activity = "thinking";
		stopSpinner();
		spinnerTimer = setInterval(() => {
			spinnerIndex = (spinnerIndex + 1) % spinnerFrames.length;
			requestRender();
		}, 80);
		requestRender();
	});

	pi.on("tool_execution_start", (event) => {
		activity = event.toolName;
		requestRender();
	});

	pi.on("tool_execution_end", () => {
		activity = "thinking";
		requestRender();
	});

	pi.on("agent_end", () => {
		isWorking = false;
		activity = "thinking";
		stopSpinner();
		requestRender();
	});

	pi.on("session_shutdown", () => {
		stopSpinner();
		activeTui = undefined;
	});

	pi.on("session_start", (_event, ctx) => {
		isWorking = false;
		activity = "thinking";
		stopSpinner();
		ctx.ui.setWorkingVisible(false);
		ctx.ui.setFooter(() => new EmptyFooter());

		class RoundedStatusEditor extends CustomEditor {
			constructor(tui: TUI, theme: EditorTheme, keybindings: KeybindingsManager) {
				super(tui, theme, keybindings, { paddingX: 1 });
				activeTui = tui;
			}

			render(width: number): string[] {
				if (width < 8) return super.render(width);

				const innerWidth = width - 2;
				const baseLines = super.render(innerWidth);
				const autocompleteList = (this as unknown as { autocompleteList?: { render(width: number): string[] } })
					.autocompleteList;
				const autocompleteState = (this as unknown as { autocompleteState?: unknown }).autocompleteState;
				const autocompleteCount =
					autocompleteState && autocompleteList ? autocompleteList.render(Math.max(1, innerWidth - 2)).length : 0;
				const nativeBottomIndex = Math.max(1, baseLines.length - autocompleteCount - 1);
				const bodyLines = [
					...baseLines.slice(1, nativeBottomIndex),
					...baseLines.slice(nativeBottomIndex + 1),
				];
				const thm = ctx.ui.theme;
				const border = (text: string) => this.borderColor(text);
				const topLeft = `${thm.fg("accent", "─ π ")}${thm.fg("muted", `${modelLabel(ctx)} · ${pi.getThinkingLevel()} `)}`;
				const topRight = thm.fg("dim", ` ${formatContext(ctx)} ─`);
				const bottomLeft = isWorking
					? thm.fg("accent", `─ ${spinnerFrames[spinnerIndex]} ${activity} `)
					: border("─");
				const bottomRight = thm.fg("dim", ` ${formatCwd(ctx.cwd)} ─`);

				const top = fitRoundedBorder(topLeft, topRight, width, border, true);
				const bottom = fitRoundedBorder(bottomLeft, bottomRight, width, border, false);
				const body = bodyLines.map((line) => {
					const clipped = truncateToWidth(line, innerWidth, "");
					const padding = Math.max(0, innerWidth - visibleWidth(clipped));
					return `${border("│")}${clipped}${" ".repeat(padding)}${border("│")}`;
				});

				return [top, ...body, bottom];
			}
		}

		ctx.ui.setEditorComponent((tui, theme, keybindings) => new RoundedStatusEditor(tui, theme, keybindings));
	});
}
