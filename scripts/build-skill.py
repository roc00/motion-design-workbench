#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""T11 · 构建 motion-director 交付 skill。
数据源：data/style-patterns.json + src/wizard.js（路由）+ templates/ + snippets/。
输出：skill/motion-director/
"""
import json, os, re, shutil, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "skill", "motion-director")

P = json.load(open(os.path.join(ROOT, "data/style-patterns.json"), encoding="utf-8"))
CG = json.load(open(os.path.join(ROOT, "data/cinematic-grammar.json"), encoding="utf-8"))
CS = json.load(open(os.path.join(ROOT, "data/cinematic-shots.json"), encoding="utf-8"))
wiz = open(os.path.join(ROOT, "src/wizard.js"), encoding="utf-8").read()

# 解析 GOAL_ROUTES / GOAL_LABEL
def parse_map(name):
    m = re.search(r"const " + name + r" = \{(.*?)\};", wiz, re.S)
    block = m.group(1)
    out = {}
    for key, body in re.findall(r'"?([\w-]+)"?:\s*\{([^}]*)\}', block):
        fields = dict(re.findall(r'(\w+):\s*"([^"]+)"', body))
        out[key] = fields
    return out
ROUTES = parse_map("GOAL_ROUTES")
GOAL_LABEL = dict(re.findall(r'"?([\w-]+)"?:\s*"([^"]+)"',
    re.search(r"const GOAL_LABEL = \{(.*?)\};", wiz, re.S).group(1)))

def find_item(kind, pid):
    key = {"style": "styles", "concept": "concepts", "medium": "media"}[kind]
    return next(x for x in P[key] if x["id"] == pid)

def w(path, text):
    full = os.path.join(OUT, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    open(full, "w", encoding="utf-8").write(text)

# 重建输出目录
os.makedirs(OUT, exist_ok=True)

# ---------- SKILL.md ----------
SKILL_MD = open(os.path.join(ROOT, "studio/SKILL.md"), encoding="utf-8").read()
w("SKILL.md", SKILL_MD)

# ---------- references/principles.md ----------
prin = "# 六原则与 Slop 黑名单\n\n## 六原则（视频不是幻灯片）\n\n"
for i, x in enumerate(P["principles"], 1):
    prin += f"{i}. **{x['label']}** — {x.get('detail','')}\n"
prin += '''
## Slop 黑名单（Opus 5.5 默认烂片的信号，禁止）
- 居中标题压在渐变背景上
- 所有元素统一 fade in / fade out
- 四角放标签、整帧加边框
- UI chrome 上 glow、发光
- 通用粒子爆发、无意义的装饰
- 死帧（超过 4 秒无新事件）
- 缩放 / 放大后文字发虚模糊
- 循环接缝处卡顿、跳变
'''
w("references/principles.md", prin)

# ---------- references/routing-table.md ----------
rt = "# 决策路由表（查表，不做审美判断）\n\n"
rt += "| 目标 / 片型 | 视觉风格 | 叙事概念 | 媒介质感 |\n|---|---|---|---|\n"
for gk, fields in ROUTES.items():
    def cell(dim):
        v = fields.get(dim, "")
        alt = fields.get(dim + "Alt", "")
        it = find_item(dim, v) if v else None
        s = f"{it['index']} {it['label']}" if it else v
        if alt:
            a = find_item(dim, alt)
            s += f" / 备选 {a['index']} {a['label']}"
        return s
    rt += f"| {GOAL_LABEL.get(gk, gk)} | {cell('style')} | {cell('concept')} | {cell('medium')} |\n"
rt += '''
> 路由表给"保底正确"的组合；每个模式的 `mapsTo` 提供具体动效，snippets 提供实现。
> 弱模型只需：intake → 查表 → 生成脚手架 → 填内容 → 跑 gate。
'''
w("references/routing-table.md", rt)

# ---------- references/fix-cookbook.md ----------
fc = "# 修复手册（按症状查精确修法）\n\n"
for x in P["fixRunbook"]:
    fc += f"## {x['id']} · {x['symptom']}\n\n"
    fc += f"- **如何发现**：{x['detect']}\n"
    fc += f"- **修法**：{x['fix']}\n\n"
w("references/fix-cookbook.md", fc)

# ---------- references/review-rubric.md ----------
rr = "# 评分维度与 Contact Sheet\n\n## 评分维度（1–10，目标每项 ≥ 8，保底 ≥ 7）\n\n"
for x in P["scoringDimensions"]:
    rr += f"- **{x['label']}** — {x.get('detail','')}\n"
rr += '''
## Contact Sheet 与自检命令

```bash
# 每拍一帧的 contact sheet（2 fps，6 列）
ffmpeg -i final.mp4 -vf "fps=2,scale=270:-1,tile=6x5" -frames:v 1 contact.png
# 快速动作前后 12 帧横条（抓重叠/跳变）
ffmpeg -ss 4.1 -i final.mp4 -vf "scale=320:-1,tile=12x1" -frames:v 1 strip.png
# 手机尺寸测试（360px 宽）
ffmpeg -i final.mp4 -vf "fps=1,scale=360:-1,tile=5x3" -frames:v 1 phone.png
# 循环接缝检查：连放两遍
ffmpeg -stream_loop 1 -i final.mp4 -c copy loop_check.mp4
```

逐项打分，列出最差 3 项，查 fix-cookbook 修，重复到每项达标。
'''
w("references/review-rubric.md", rr)

# ---------- references/cinematic-grammar.md ----------
def build_cinematic_grammar():
    m = "# 电影语法：让镜头“会说话”（镜头组合高级层）\n\n"
    m += "> 基础元素告诉你“单个动效怎么做”；本文告诉你“镜头怎么组合成一段电影”。\n"
    m += "> 按内容分别说明主体、视点、状态交接与阅读时间。以下是可选词汇，不是每片必须满足的技法清单。\n\n"

    m += "## 1. 景别（Framing）\n\n| 名称 | English | 主体占比 | 表达 | 典型时长 | 常搭配 |\n|---|---|---|---|---|---|\n"
    for f in CG["framing"]:
        lo, hi = f.get("typicalMs", [0,0])
        m += f"| {f['label']} | {f['en']} | {f['subjectFrame']} | {f['expresses']} | {lo/1000:g}–{hi/1000:g}s | {', '.join(f.get('combineWith',[]))} |\n"
        if f.get("pitfall"):
            m += f"  - ⚠ {f['pitfall']}\n"

    m += "\n## 2. 运镜（Camera Moves）\n\n| 名称 | English | 表达 | 动机 / 参数 | 坑 |\n|---|---|---|---|---|\n"
    for f in CG["cameraMoves"]:
        params = f.get("params", {})
        ps = "; ".join(f"{k}: {v}" for k, v in params.items())
        m += f"| {f['label']} | {f.get('en','')} | {f['expresses']} | {f.get('motivation','')}; {ps} | {f.get('pitfall','')} |\n"

    m += "\n## 3. 纵深（Depth）\n\n"
    m += "需要表达空间关系时，可使用下面的层级；二维排版不必强加三层：\n\n"
    m += "| 层 | 作用 | 视差速度 | 虚/实 | 透明度 | 例子 |\n|---|---|---|---|---|---|\n"
    for layer in CG["depth"]["layers"]:
        m += f"| {layer['label']} | {layer['role']} | {layer['parallaxFactor']} | {layer['blur']} | {layer['alpha']} | {', '.join(layer.get('examples',[]))} |\n"
    m += "\n假纵深（fakeZ）的 5 种做法：\n\n"
    for x in CG["depth"]["fakeZ"]:
        m += f"- {x}\n"
    m += "\n纵深规则：\n"
    for r in CG["depth"]["rules"]:
        m += f"- {r}\n"

    m += "\n## 4. 构图与走位（Blocking）\n\n"
    m += "锚点网格（3×3）——别总居中：\n\n"
    m += "| 位置 | 名称 | 坐标(x,y) |\n|---|---|---|\n"
    for x in CG["blocking"]["anchorGrid"]:
        m += f"| {x['id']} | {x['label']} | {x['xy'][0]}, {x['xy'][1]} |\n"
    m += "\n构图规则：\n"
    for r in CG["blocking"]["rules"]:
        m += f"- {r}\n"
    m += "\n四种构图模式：\n"
    for x in CG["blocking"]["compositionModes"]:
        m += f"- **{x['id']} {x['label']}**（{x['use']}）：{x['note']}\n"

    m += "\n## 5. 世界（Worlds / 背景舞台）\n\n"
    m += "| 名称 | 表达 | 从产品推导 | 搭建 | 坑 |\n|---|---|---|---|---|\n"
    for f in CG["worlds"]:
        m += f"| {f['label']} | {f['expresses']} | {f['deriveFrom']} | {f['buildNotes']} | {f['pitfall']} |\n"

    m += "\n## 6. 转场（Transitions）\n\n"
    m += "| 名称 | 何时用 | 搭建 | 坑 |\n|---|---|---|---|\n"
    for f in CG["transitions"]:
        m += f"| {f['label']} | {f['useWhen']} | {f['buildNotes']} | {f['pitfall']} |\n"

    m += "\n## 7. 连续性 / 匹配剪辑（Continuity）\n\n"
    m += "连续性规则：\n"
    for r in CG["continuity"]["rules"]:
        m += f"- {r}\n"
    m += "\n接缝技法（seam techniques）：\n"
    for r in CG["continuity"]["seamTechniques"]:
        m += f"- {r}\n"

    m += "\n## 8. 从产品推导运镜（Derived Moves）——“因为产品有 X，所以用 Y”\n\n"
    m += f"> {CG['derivedMoves']['principle']}\n\n"
    m += "| 产品有 | 因此 |\n|---|---|\n"
    for x in CG["derivedMoves"]["table"]:
        m += f"| {x['productHas']} | {x['therefore']} |\n"

    m += "\n## 9. 方向推导（Direction）——让手法是这个产品专属的\n\n"
    m += f"方法：{CG['directionAxes']['method']}\n\n"
    m += "方向轴（备选方向至少在 3 个轴上不同）：\n\n"
    for x in CG["directionAxes"]["axes"]:
        m += f"- **{x['id']} {x['label']}**：{x['options']}\n"
    m += "\n叙事结构：\n"
    for x in CG["directionAxes"]["narrativeStructures"]:
        m += f"- {x['label']}（适合 {x['fit']}）\n"

    m += "\n## 10. 镜头规范（Shot Spec）\n\n"
    for k, v in CG["shotSpec"].items():
        if isinstance(v, dict):
            m += f"- **{k}**：\n"
            for k2, v2 in v.items():
                m += f"  - {k2}：{v2}\n"
        else:
            m += f"- **{k}**：{v}\n"

    m += "\n## 11. 电影序列反 Slop（区别于初学者作品）\n\n"
    m += f"> {CG['antiSlop']['note']}\n\n"
    m += "| 禁止的模式 | 为什么差 | 替换为 |\n|---|---|---|\n"
    for x in CG["antiSlop"]["banned"]:
        m += f"| {x['pattern']} | {x['why']} | {x['replace']} |\n"

    m += "\n## 12. 电影序列评分卡（目标每项 ≥ 8）\n\n"
    for x in CG["scoreCards"]:
        m += f"- **{x['label']}** — {x['question']}\n"

    m += "\n## 13. 首帧规则\n\n"
    m += f"{CG['firstFrameRule']['rule']}\n\n"
    m += f"检查方法：{CG['firstFrameRule']['check']}\n"
    return m

def build_cinematic_sequences():
    active=[q for q in CS['sequences'] if q.get('collection')=='director']
    m = f"# 导演案例 · {len(active)} 项\n\n"
    m += "> 新制作参考包含完整成片与有源时间的交接段落。旧演示已撤下，仅保留溯源记录。按内容推导主体和交接，不按镜头数量或装饰数量判断质量。\n\n"
    for q in active:
        m += f"## {q['name']} · {q['en']}\n\n"
        m += f"- **id**：`{q['id']}` ｜ **分类**：{q['category']} ｜ **调色板**：{q['palette']} ｜ **对应基础配方**：`{q['mapsToCombo']}`\n"
        m += f"- **片段文件**：`snippets/{q['snippet']}.html`\n"
        m += f"- **集合 / 状态**：{q.get('collection','study')} / {q.get('capability','browser-demo')}\n"
        if q.get('collection') == 'director':
            m += f"- **源时间**：{q['film']} {q['sourceStart']}–{q['sourceEnd']}s；**适用**：{q['useWhen']}；**避免**：{q['avoidWhen']}\n"
            m += f"- **制作描述**：{q['prompt']}\n"
            m += f"- **实现边界**：{q['renderModel']}；{q['capability']}\n"
            for a in q.get("performers",[]):m += f"- **角色**：{a['name']} / {a['role']}：{a['action']}\n"
        m += f"- **一句话**：{q['logline']}\n"
        m += f"- **推导依据**：{q['derivedFrom']}\n\n"
        m += "| # | 时间 | 锚点 | 景别 | 运镜 | 世界 | 入 | 出 | 三层纵深 | 内容 |\n|---|---|---|---|---|---|---|---|---|---|\n"
        for i, s in enumerate(q["shots"], 1):
            dep = s["depth"]
            deps = "；".join(f"{k[:1]}:{v}" for k, v in dep.items()) if isinstance(dep, dict) else ""
            m += (f"| {i} | {s['fromMs']/1000:g}–{s['toMs']/1000:g}s | {s['anchor']} | {s['framing']} | "
                  f"{s['cameraMove']} | {s['world']} | {s['transitionIn']} | {s['transitionOut']} | {deps} | {s['note']} |\n")
        m += "\n"
    return m

w("references/cinematic-grammar.md", build_cinematic_grammar())
w("references/cinematic-sequences.md", build_cinematic_sequences())

# ---------- 复制 lib / templates / snippets ----------
def copy_tree(src_rel, dst_rel):
    src = os.path.join(ROOT, src_rel)
    dst = os.path.join(OUT, dst_rel)
    shutil.copytree(src, dst, dirs_exist_ok=True)

copy_tree("templates/lib", "lib")
# templates：脚手架本体（不含 lib，lib 已单列）
tpl_dst = os.path.join(OUT, "templates")
os.makedirs(tpl_dst, exist_ok=True)
for f in ["index.html", "cue-table.json", "render.mjs", "README.md"]:
    shutil.copy2(os.path.join(ROOT, "templates", f), os.path.join(tpl_dst, f))
if os.path.exists(os.path.join(tpl_dst, "scenes")):
    shutil.rmtree(os.path.join(tpl_dst, "scenes"))
shutil.copytree(os.path.join(ROOT, "templates/scenes"), os.path.join(tpl_dst, "scenes"))
# Retired generated previews stay in project history, not in the delivery skill.
retired_snippets={q["snippet"]+".html" for q in CS["sequences"] if q.get("previewStatus")=="retired"}
for name in os.listdir(os.path.join(ROOT,"snippets")):
    src=os.path.join(ROOT,"snippets",name);dst=os.path.join(OUT,"snippets",name)
    if name in retired_snippets:
        if os.path.isfile(dst):os.remove(dst)
        continue
    if os.path.isdir(src):shutil.copytree(src,dst,dirs_exist_ok=True)
    else:
        os.makedirs(os.path.dirname(dst),exist_ok=True)
        shutil.copy2(src,dst)

# 两部旗舰成片（9:16）作为可直接参考的完整范例
films_dst = os.path.join(OUT, "films")
os.makedirs(films_dst, exist_ok=True)
for f in [f for f in os.listdir(os.path.join(ROOT,"films")) if f.endswith(".html") and f.startswith("director-")]:
    shutil.copy2(os.path.join(ROOT, "films", f), os.path.join(films_dst, f))

for f in os.listdir(films_dst):
    if f.endswith(".html") and not f.startswith("director-"):os.remove(os.path.join(films_dst,f))

# New director source stays canonical and survives every rebuild.
copy_tree("studio/lib", "director-kit/lib")
copy_tree("studio/assets", "director-kit/assets")
copy_tree("snippets/_kit/stud", "kit")
for name in ["render-stud.mjs", "synth-stud-audio.mjs"]:
    shutil.copy2(os.path.join(ROOT,"scripts",name), os.path.join(OUT,"kit",name))
shutil.copy2(os.path.join(ROOT,"studio/plan.json"),os.path.join(OUT,"director-kit/plan.json"))
w("references/director-method.md", open(os.path.join(ROOT,"studio/docs/director-method.md"),encoding="utf-8").read())
w("references/review-rubric.md", "# 实际画面验收\n\n先看联系表、交接条带、360px 读字图，记录时间点、具体问题、修改和复查。技术门只验证结构和确定性；不要以自评分代替成片质量。声音没试听时声明。\n")
w("registry.json", json.dumps(json.load(open(os.path.join(ROOT,"public/registry.json"))),ensure_ascii=False,indent=2))
os.makedirs(os.path.join(OUT,"scripts"),exist_ok=True)
for name in ["scaffold-director.mjs", "render-director.mjs", "run-director-render.mjs", "synth-director-audio.mjs", "build-director.mjs"]:
    shutil.copy2(os.path.join(ROOT,"scripts",name),os.path.join(OUT,"scripts",name))

# Responsibility references and tool selection derive from the same data as the UI.
shots = json.load(open(os.path.join(ROOT,"data/shot-recipes.json"),encoding="utf-8"))
tools = json.load(open(os.path.join(ROOT,"data/tools.json"),encoding="utf-8"))
responsibilities = open(os.path.join(ROOT,"docs/07-导演与技术职责.md"),encoding="utf-8").read()
responsibilities += "\n## 原卡归属与词典入口\n\n| ID | 名称 | 职责 | 维度 / 入口 |\n|---|---|---|---|\n"
for r in shots["recipes"]:
    placement=r["presentation"]
    responsibilities += f"| `{r['id']}` | {r['nameZh']} | {placement['role']} | `{placement.get('canonicalEffectId') or placement['domain']}` |\n"
w("references/director-responsibilities.md",responsibilities)
patterns=json.load(open(os.path.join(ROOT,"data/director-patterns.json"),encoding="utf-8"))["patterns"]
reference="# 六种叙事结构与同源情境\n\n演示使用连续场景的叙事节拍，不强制一拍一切。可独立打开 HTML，用 seek(t) 定位。当前是 browser-demo，实际生产应按内容展开 Shot Plan。\n\n"
for p in patterns:
    reference += f"## {p['name']}\n\n- ID：`{p['id']}`\n- 演示：`snippets/{p['demoSnippet']}.html`\n- 目标：{p['goal']}\n- 主体：{p['subject']}\n- 条件：{p['constraint']}\n- 分工：{p['division']}\n\n"
    for b in p["shots"]:reference += f"- {b['fromMs']/1000:g}–{b['toMs']/1000:g}s：{b['label']}；{b['audience']}\n"
    reference += "\n"
w("references/narrative-patterns.md",reference)
# Readable, executable pure renderer without UI controller or bundled-font blobs.
kit_source=open(os.path.join(ROOT,"src/kit.js"),encoding="utf-8").read()
helpers=""
for helper in ["clamp01","lerp"]:
    helpers += re.search(r"export const "+helper+r" = [^\n]+",kit_source).group(0).replace("export ","",1)+"\n"
start=kit_source.index("export function spring(")
end=kit_source.index("export function track(",start)
helpers += kit_source[start:end].replace("export function spring", "function spring",1)
renderer=open(os.path.join(ROOT,"src/production/director-pattern.js"),encoding="utf-8").read()
renderer="\n".join(renderer.splitlines()[1:]).split("let mountSerial=")[0]
w("director-kit/lib/narrative.mjs",helpers+renderer)

routing = "# 实现工具与四个渲染层\n\n工具参考不代表已经安装。角色是一种导演职责，不意味着必须使用角色动画状态机。\n\n"
for tool in tools["implementations"]:
    routing += f"## {tool['name']} · {tool['status']}\n\n{tool['note']}\n\n- 条件：{tool['when']}\n- 逐帧合同：{tool['seekRule']}\n- 归层：{', '.join(tool['renderLayers'])}\n"
    if tool.get("source"): routing += f"- 官方参考：{tool['source']}\n"
    routing += "\n"
routing += "## 按素材引入\n\n"
for tool in tools["optionalAssetPlayers"]: routing += f"- **{tool['name']}**：{tool['condition']} {tool['seekRule']}\n"
w("references/implementation-routing.md",routing)

# 统计
total = sum(len(fs) for _, _, fs in os.walk(OUT))
print(f"✓ skill 构建完成：{OUT}")
print(f"  文件总数：{total}")
