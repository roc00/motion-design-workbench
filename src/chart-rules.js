/**
 * 图表数据校验规则。
 * 同一份规则同时被 Node 侧校验脚本（scripts/validate-registry.mjs）和浏览器侧
 * 演示（src/engine/chart.js）使用，避免两处判断不一致。返回错误字符串数组，空数组表示通过。
 */
const isNum = (v) => typeof v === "number" && Number.isFinite(v);

export const CHART_RULES = {
  "chart.bar-compare"(d) {
    const errs = [];
    if (!Array.isArray(d.data) || !d.data.length) errs.push("data 不能为空");
    else {
      d.data.forEach((it, i) => {
        if (!it || !it.label) errs.push(`第 ${i + 1} 项缺少 label`);
        if (!isNum(it?.value)) errs.push(`第 ${i + 1} 项的 value 必须是有限数字`);
      });
      if (d.highlight && !d.data.some((it) => it.label === d.highlight)) {
        errs.push(`highlight「${d.highlight}」不在 data 里`);
      }
    }
    return errs;
  },

  "chart.line-trend"(d) {
    const errs = [];
    if (!Array.isArray(d.labels) || !Array.isArray(d.values)) return ["需要 labels 与 values"];
    if (d.labels.length !== d.values.length) {
      errs.push(`labels(${d.labels.length}) 与 values(${d.values.length}) 长度不一致`);
    }
    if (!d.values.some((v) => isNum(v))) errs.push("至少要有一个非缺失值");
    d.values.forEach((v, i) => {
      if (v !== null && !isNum(v)) errs.push(`values[${i}] 必须是数字或 null`);
    });
    for (const a of d.annotations || []) {
      if (!isNum(a?.index) || a.index < 0 || a.index >= d.values.length) {
        errs.push(`标注索引越界：${a?.index}`);
      }
    }
    return errs;
  },

  "chart.share"(d) {
    const errs = [];
    if (!Array.isArray(d.segments) || !d.segments.length) return ["segments 不能为空"];
    let sum = 0;
    d.segments.forEach((s, i) => {
      if (!s?.label) errs.push(`第 ${i + 1} 段缺少 label`);
      if (!isNum(s?.value)) errs.push(`第 ${i + 1} 段的 value 必须是有限数字`);
      else if (s.value < 0) errs.push(`第 ${i + 1} 段为负值，占比不允许为负`);
      else sum += s.value;
    });
    if (!errs.length && sum <= 0) errs.push("总和必须大于 0");
    return errs;
  },

  "chart.before-after"(d) {
    const errs = [];
    for (const k of ["before", "after"]) {
      if (!d[k] || !isNum(d[k].value)) errs.push(`${k}.value 必须是有限数字`);
    }
    return errs;
  },

  "chart.waterfall"(d) {
    const errs = [];
    if (!isNum(d.start?.value) || !isNum(d.end?.value)) errs.push("start / end 必须是有限数字");
    if (!Array.isArray(d.items) || !d.items.length) errs.push("items 不能为空");
    else {
      d.items.forEach((it, i) => {
        if (!it?.label) errs.push(`第 ${i + 1} 项缺少 label`);
        if (!isNum(it?.delta)) errs.push(`第 ${i + 1} 项的 delta 必须是有限数字`);
      });
      if (!errs.length) {
        const calc = d.start.value + d.items.reduce((n, it) => n + it.delta, 0);
        if (Math.abs(calc - d.end.value) > 0.01) {
          errs.push(`起点 ${d.start.value} + 各项增减 ${(calc - d.start.value).toFixed(2)} = ${calc}，与终点 ${d.end.value} 不一致`);
        }
      }
    }
    return errs;
  },

  "chart.rank-race"(d) {
    const errs = [];
    if (!Array.isArray(d.entities) || !d.entities.length) errs.push("entities 不能为空");
    if (!Array.isArray(d.frames) || d.frames.length < 2) errs.push("至少需要两帧");
    const names = (d.entities || []).map((e) => e?.name);
    if (new Set(names).size !== names.length) errs.push("实体名重复");
    const colors = (d.entities || []).map((e) => e?.color);
    if (new Set(colors).size !== colors.length) errs.push("实体颜色必须唯一");
    for (const f of d.frames || []) {
      if (!f?.t) errs.push("帧缺少时间标签");
      for (const n of names) {
        if (!isNum(f?.values?.[n])) errs.push(`帧 ${f?.t} 缺少实体 ${n} 的数值（全时段必须覆盖同一批实体）`);
      }
    }
    return errs;
  },
};

export function validateChart(id, data) {
  const rule = CHART_RULES[id];
  if (!rule) return [`没有 ${id} 的校验规则`];
  if (!data) return ["缺少图表数据"];
  try {
    return rule(data);
  } catch (err) {
    return [`校验时出错：${err.message}`];
  }
}
