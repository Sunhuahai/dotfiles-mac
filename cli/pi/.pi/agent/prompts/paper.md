---
description: 论文与投稿工作室唯一入口；根据自然语言任务自动选择论文子智能体
argument-hint: "<自然语言任务，可包含稿件、审稿意见或结果路径>"
---

这是用户手动启动的论文与投稿工作室。用户原始任务：$@

先读取 `/Users/huahai/.pi/agent/workbench/WORKFLOW.md`，判断任务属于稿件审计、引用核验、图表数值核对、论证重构、审稿回复、语言编辑或它们的组合，再通过 `paper` 工具选择单个、并行或串行子智能体。

路由原则：长稿和审稿材料先用 `paper-context-compressor`；本地引用证据用 `paper-evidence-auditor`；图表数值用 `paper-figure-table-auditor`；核心论证用 `paper-argument-architect`；审稿策略用 `paper-review-strategist`；事实冻结后的表达用 `paper-language-editor`。GPT 角色只接收压缩证据包。

默认只审计。原始任务明确要求修改时，只改指定稿件范围内的源文件。不得伪造引用或结果；不得编译 LaTeX、运行 latexmk/pdflatex/xelatex/tectonic 或生成 PDF，除非原始任务明确要求。
