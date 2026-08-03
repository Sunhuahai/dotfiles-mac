# 工作台全局规则

## 单入口路由

每个公开智能体只有一个入口：

- `/research <prompt>`
- `/paper <prompt>`
- `/review <prompt>`
- `/syscare <prompt>`

门面智能体根据 prompt 中的目标、路径、范围和限制选择内部角色，可以单独、并行或串行调用。内部角色不得作为额外的用户入口暴露。

## 模型分层

| 层级 | 模型 | 用途 |
|---|---|---|
| 长上下文与日常整理 | DeepSeek V4 Flash | 路径读取、分类、压缩、清单和初筛 |
| 长文精审与成稿 | DeepSeek V4 Pro | 复现材料、论文图表、语言编辑、会议简报 |
| 低成本日常决策 | GPT-5.6 Luna high | 今日/本周优先级、风险分级 |
| 关键规划与论证 | GPT-5.6 Terra high | 实验设计、论文论证 |
| 最终高风险裁决 | GPT-5.6 Sol xhigh | 科研结果裁决、审稿策略 |

Flash/Pro 可以通过绝对路径读取长材料。OpenAI 核心角色只接收经过压缩的证据包；不得直接提交整仓、整篇论文、原始数据或超长笔记。

## 通用门禁

1. 默认只读。所有事实都标记为 `OBSERVED`、`INFERRED`、`PLANNED` 或 `UNKNOWN`。
2. 不把缺失证据写成结论，不伪造引用、数值、运行记录、截止时间或用户偏好。
3. 除非用户明确启动相应修改任务，不改项目、论文或笔记。
4. 不运行实验、训练、批处理、投稿、同步、Git 写操作或远程变更，除非用户明确授权。
5. 不编译 LaTeX，不运行 `latexmk`、`pdflatex`、`xelatex` 或 `tectonic`，不生成 PDF，除非用户明确要求。
6. 不删除、覆盖或批量移动文件。
7. `syscare` 中带命令能力的角色必须由扩展弹出确认；非交互模式直接拒绝。

## 建议路径

- 活跃科研项目：`/Users/huahai/PARA/Project/`
- Obsidian 主库：`/Users/huahai/Library/Mobile Documents/iCloud~md~obsidian/Documents/Notes`
- 组会资料：`/Users/huahai/PARA/Project/组会`

路径只是默认候选；每次仍以用户指定路径为准。
