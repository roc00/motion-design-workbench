# Motion Director｜动效视频制作 Skill

一套供 Agent 制作代码驱动动效短片的导演参考与执行工具。它把叙事结构、镜头交接、动效选型、可定位渲染和成片检查放在同一个工作流里。

**在线查看**：[动效选型工作台](https://ai-website-deploy-d7dblsa24f28f7-1255360638.tcloudbaseapp.com/)（[Vercel 地址](https://motion-design-workbench.vercel.app)）。首页为完整词典；“镜头组合”展示导演案例与叙事结构。

## 从这里开始

- [阅读 Skill](skill/motion-director/SKILL.md)：适用范围、输入要求、镜头规划、渲染与验收。
- [查看 FORMA 成片](films/director-forma.mp4) · [查看 RELAY 成片](films/director-relay.mp4)：两支 15 秒、16:9 的完整示例。
- [浏览导演案例](https://ai-website-deploy-d7dblsa24f28f7-1255360638.tcloudbaseapp.com/#/compositions)：完整影片、交接片段和独立情境，可播放及定位。

## Skill 包含什么

| 内容 | 用途 |
|---|---|
| `SKILL.md` 与 `references/` | 选择叙事方式，编排镜头与状态交接，检查画面质量 |
| `registry.json` | 动效、镜头、工具与场景的结构化索引 |
| `director-kit/`、`templates/`、`lib/` | 可复用的渲染核心与工程起点 |
| `scripts/` | 创建独立项目及渲染示例 |
| `films/`、`snippets/` | 可定位的案例与风格片段 |

Skill 位于 [`skill/motion-director/`](skill/motion-director/)。将该目录复制到支持 `SKILL.md` 的 Agent 工具的 Skills 目录即可使用。也可以在仓库内直接创建示例工程：

```bash
node skill/motion-director/scripts/scaffold-director.mjs --film forma --out /tmp/forma-project
```

将 `forma` 换成 `relay` 可选另一套示例。实际制作时，请根据产品内容重写镜头表、文案和画面，并按 Skill 中的检查步骤验证成片。

## 工作台

工作台供人查看与选择：完整词典覆盖 62 个动效条目；镜头组合提供两支完整成片、五个镜头段落和六种叙事结构。其源码在 `src/`，选型数据在 `data/`，可用以下命令本地运行：

```bash
npm ci
npm run dev
npm run check
```

`npm run check` 执行数据校验、运行逻辑检查并构建网页。构建产物在 `dist/`。

## 使用边界

示例影片中的 UI、品牌和数值是概念内容。网页预览可用于理解镜头和选择方向；最终交付仍需用实际素材完成渲染，并检查首末帧、任意时间定位、文字可读性、音轨与画幅。
