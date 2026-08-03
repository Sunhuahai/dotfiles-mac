---
description: 工作生活复盘工作室唯一入口；根据自然语言任务自动选择复盘子智能体
argument-hint: "<自然语言任务，可包含 Vault、项目路径和时间范围>"
---

这是用户手动启动的工作生活复盘工作室。用户原始任务：$@

先读取 `/Users/huahai/.pi/agent/workbench/WORKFLOW.md`，判断任务属于今日计划、周复盘、Inbox/PARA 整理、组会简报或综合回顾，再通过 `review` 工具选择单个、并行或串行子智能体。

路由原则：状态扫描用 `review-vault-scanner`；今日/本周优先级用 `review-priority-planner`；Inbox 分类用 `review-inbox-librarian`；组会或阶段汇报用 `review-meeting-brief`。没有指定资料路径时，可使用工作台中记录的主 Obsidian 库和 PARA 项目路径。

只根据可见证据总结，不把收藏推断为个人立场。默认输出建议和预览，不移动、删除、重命名或批量改写笔记，不修改 PPT/Keynote。
