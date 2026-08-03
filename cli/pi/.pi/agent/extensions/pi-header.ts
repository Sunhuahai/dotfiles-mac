/**
 * Minimal Claude Code-style startup header for Pi.
 *
 * Deliberately registers no slash commands so the public agent entry list
 * remains limited to the five prompt routers installed alongside it.
 */

import type { ExtensionAPI, ExtensionContext, Theme } from "@earendil-works/pi-coding-agent";
import { VERSION } from "@earendil-works/pi-coding-agent";

const LOGO = [
	"██████╗ ██╗      █████╗  ██████╗ ███████╗███╗   ██╗████████╗",
	"██╔══██╗██║     ██╔══██╗██╔════╝ ██╔════╝████╗  ██║╚══██╔══╝",
	"██████╔╝██║     ███████║██║  ███╗█████╗  ██╔██╗ ██║   ██║",
	"██╔═══╝ ██║     ██╔══██║██║   ██║██╔══╝  ██║╚██╗██║   ██║",
	"██║     ██║     ██║  ██║╚██████╔╝███████╗██║ ╚████║   ██║",
	"╚═╝     ╚═╝     ╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝  ╚═══╝   ╚═╝",
];

function compactPath(cwd: string): string {
	const home = process.env.HOME;
	return home && cwd.startsWith(home) ? `~${cwd.slice(home.length)}` : cwd;
}

function shortenMiddle(text: string, width: number): string {
	if (width <= 0) return "";
	if (text.length <= width) return text;
	if (width <= 3) return ".".repeat(width);

	const remaining = width - 1;
	const left = Math.ceil(remaining / 2);
	const right = Math.floor(remaining / 2);
	return `${text.slice(0, left)}…${text.slice(text.length - right)}`;
}

function modelLabel(ctx: ExtensionContext): string {
	return ctx.model ? `${ctx.model.provider}/${ctx.model.id}` : "model unavailable";
}

function renderHeader(width: number, theme: Theme, ctx: ExtensionContext, pi: ExtensionAPI): string[] {
	const usableWidth = Math.max(1, width - 4);
	const model = modelLabel(ctx);
	const thinking = pi.getThinkingLevel();
	const cwd = compactPath(ctx.cwd);

	if (width < 70) {
		return [
			"",
			theme.fg("accent", `  π  PI AGENT`),
			theme.fg("dim", `  v${VERSION}`),
			theme.fg("muted", `  ${shortenMiddle(model, usableWidth)}`),
			theme.fg("dim", `  ${shortenMiddle(cwd, usableWidth)}`),
			"",
		];
	}

	const status = `${model} · thinking ${thinking}`;
	return [
		"",
		...LOGO.map((line) => theme.fg("accent", `  ${line}`)),
		`${theme.fg("text", "  Personal Intelligence")}${theme.fg("dim", `  v${VERSION}`)}`,
		theme.fg("muted", `  ${shortenMiddle(status, usableWidth)}`),
		theme.fg("dim", `  ${shortenMiddle(cwd, usableWidth)}`),
		"",
	];
}

export default function piHeader(pi: ExtensionAPI) {
	pi.on("session_start", (_event, ctx) => {
		if (ctx.mode !== "tui") return;

		ctx.ui.setHeader((_tui, theme) => ({
			render(width: number): string[] {
				return renderHeader(width, theme, ctx, pi);
			},
			invalidate() {},
		}));
	});
}
