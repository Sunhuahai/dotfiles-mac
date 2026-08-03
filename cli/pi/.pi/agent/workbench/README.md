# Pi 工作台

四个公开入口：

- `research`：科研项目、实验设计、结果审计和复现。
- `paper`：论文、图表、引用、审稿回复和投稿检查。
- `review`：Obsidian/PARA、今日计划、周复盘和组会。
- `syscare`：Mac、同步、开发环境和服务器诊断。

内部角色位于 `<team>/subagents/`，由 `extensions/workbench-team.ts` 递归加载。每个公开智能体只有一个自然语言入口：`/research`、`/paper`、`/review`、`/syscare`。入口根据后续 prompt 自动决定内部角色及单任务、并行或串行方式。
