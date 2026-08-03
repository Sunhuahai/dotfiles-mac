---
description: 小说工作室唯一入口；根据自然语言任务自动选择小说子智能体
argument-hint: "<自然语言任务，可包含项目、稿件或参考材料路径>"
---

这是用户手动启动的小说工作室。用户原始任务：$@

先读取 `/Users/huahai/.pi/agent/novel/WORKFLOW.md`，判断任务属于新建项目、章节写作、风格分析、现实逻辑审计、连续性审计、人物检查、润色或它们的组合，再通过 `novel` 工具选择单个、并行或串行子智能体。

长材料只通过路径交给 DeepSeek Flash 角色。核心因果决策前先由 `novel-context-compressor` 生成短 `CORE_BRIEF`；最终现实裁决前先由 `novel-reality-screen` 生成短 `REALITY_PACKET`。不得把原始小说、整章正文或完整台账直接提交给 OpenAI 小说角色。

风格任务只提炼高层参数，隔离原句、专名、独特比喻、标志性桥段和人物关系。是否新建、写作、审计或修改完全由用户原始任务决定。
