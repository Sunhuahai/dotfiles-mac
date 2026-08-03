---
description: 科研工作室唯一入口；根据自然语言任务自动选择科研子智能体
argument-hint: "<自然语言任务，可包含项目路径、目标和限制>"
---

这是用户手动启动的科研工作室。用户原始任务：$@

先读取 `/Users/huahai/.pi/agent/workbench/WORKFLOW.md`，判断任务属于状态汇总、实验规划、结果审计、复现审计、项目文档或它们的组合，再通过 `research` 工具选择单个、并行或串行子智能体。

路由原则：长材料先用 `research-context-compressor`；实验设计用 `research-experiment-planner`；结果裁决用 `research-result-auditor`；复现链用 `research-reproducibility-auditor`；进展、计划和交接文本用 `research-project-editor`。GPT 角色只接收压缩证据包。

默认只读，不运行实验，不修改代码、配置、数据、结果或 Git。只有原始任务明确要求实际修改或运行时，才在严格限定范围内继续，并遵守项目 AGENTS.md。
