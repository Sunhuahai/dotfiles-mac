# 全局小说工作室流程

只有用户手动输入 `/novel <自然语言任务>` 时才执行本流程。门面根据 prompt 判断任务类型并选择内部角色；普通项目任务不得自动触发小说子智能体。

## 模型与 Token 规则

| 工作 | 角色 | 模型 |
|---|---|---|
| 长材料阅读与压缩 | novel-context-compressor | DeepSeek V4 Flash |
| 风格分析 | novel-style-analyst | DeepSeek V4 Flash |
| 核心因果决策 | novel-core-architect | GPT-5.6 Sol high |
| 人物扫描 | novel-character-psychologist | DeepSeek V4 Flash |
| 正文起草与返工 | novel-scene-writer | DeepSeek V4 Flash |
| 全文现实初筛 | novel-reality-screen | DeepSeek V4 Flash |
| 最终现实裁决 | novel-reality-judge | GPT-5.6 Sol xhigh |
| 连续性审计 | novel-continuity-auditor | DeepSeek V4 Flash |
| 最终润色 | novel-prose-editor | DeepSeek V4 Flash |

OpenAI 只做核心因果选择和最终现实裁决。不得向两个 OpenAI 角色提交原始小说、整章正文、完整台账或大段参考文本；扩展会在 12000 字符处硬性拒绝。长材料必须以路径交给 Flash 角色读取，OpenAI 输出也应保持简短。

## 项目目录

在当前工作目录下使用 `.novel-studio/<项目名>/`：

- `brief.md`
- `style-card.md`
- `story-bible.md`
- `outline.md`
- `timeline.json`
- `continuity-ledger.md`
- `research-log.md`
- `drafts/`
- `audits/`

模板位于 `/Users/huahai/.pi/agent/novel/templates/`，时间线校验器位于 `/Users/huahai/.pi/agent/novel/tools/validate_timeline.py`。

## 新建项目

1. 创建目录并复制模板。
2. 用 novel-style-analyst、novel-character-psychologist 和 novel-context-compressor 处理长材料。
3. 只把小于 12000 字符的 CORE_BRIEF 交给 novel-core-architect。
4. 把核心决策写入大纲，用 novel-reality-screen 扫描全量大纲。
5. 只把 REALITY_PACKET 交给 novel-reality-judge。非 PASS 不得开始正文。

## 章节工作流

1. 用 novel-context-compressor 从项目文件生成本章 CORE_BRIEF。
2. 用 novel-character-psychologist 检查人物；由 Flash 修正简报。
3. 把压缩简报交给 novel-core-architect，得到短 CORE_DECISION。
4. 用 novel-scene-writer 读取项目文件并起草。
5. 并行运行 novel-reality-screen 与 novel-continuity-auditor。
6. Flash 初筛不通过时先由 novel-scene-writer 返工，不调用 OpenAI。
7. Flash 初筛通过后，把不超过 8000 字符的 REALITY_PACKET 交给 novel-reality-judge。
8. 最终裁决非 PASS 时按最小修复约束返工，再重复初筛与裁决。最多三轮。
9. 两项审计均 PASS 后，用 novel-prose-editor 润色并更新台账、时间线和审计报告。

## 现实逻辑门禁

覆盖因果、替代选择、时间空间、信息流、人物心理、资源、制度流程、物理技术和社会后果。关键事实不确定时必须给 `NEEDS_RESEARCH`；不能用流畅文笔掩盖事实空缺，也不能静默降级为 Flash 最终裁决。
