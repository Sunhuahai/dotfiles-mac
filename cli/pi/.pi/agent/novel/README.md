# Novel 工作室

这是 Pi 中唯一公开的小说门面。内部子智能体统一放在 `subagents/`，由 `extensions/novel-team.ts` 递归加载。

## 目录

- `subagents/`：内部角色定义，不单独对外暴露。
- `WORKFLOW.md`：小说工作流、模型分工和门禁规则。
- `templates/`：项目资料模板。
- `tools/`：时间线校验工具。

## 入口

只有 `/novel <自然语言任务>`。门面根据 prompt 判断新建项目、章节写作、风格分析、现实审计、连续性审计或润色，并选择内部角色及执行顺序。

内部角色的 `name` 保持稳定；修改角色职责或模型时，编辑 `subagents/` 中对应的 Markdown 文件。
