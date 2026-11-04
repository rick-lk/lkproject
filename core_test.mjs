// 从同目录 index.html 抽取 CORE 区块（发布仓库自包含：node core_test.mjs 即可回归），在 node 中真实执行并断言行为（含对抗与越域用例）。
import { readFileSync } from "node:fs";

const html = readFileSync(new URL("./index.html", import.meta.url), "utf8");
const m = html.match(/\/\/---CORE-START---([\s\S]*?)\/\/---CORE-END---/);
if (!m) { console.error("CORE block not found"); process.exit(1); }
const { tokenize, buildIndex, answer } = new Function(
  m[1] + "\nreturn { tokenize, buildIndex, answer };")();

const corpus = [
  "price | Our price list: Standard plan $29/month, Pro $79/month, Enterprise custom pricing.",
  "stock | Stock levels are updated every 2 hours on the product page.",
  "refund | Refund within 14 days of purchase, no questions asked.",
  "whatsapp | Connect via the official WhatsApp Business API (Cloud API).",
  "价格 | 标准版 $29/月，专业版 $79/月，企业版按需报价。",
  "库存 | 库存每 2 小时同步一次；缺货时页面显示到货提醒。",
  "退款 | 购买后 14 天内无理由退款。",
];

const idx = buildIndex(corpus);
const TAU = { tauScore: 1.0, tauMass: 1.25, tauOod: 0.55 };
const cases = [
  ["price?", "price"],
  ["how much is pro", "price"],
  ["refund policy", "refund"],
  ["库存还有吗", "库存"],
  ["标准版多少钱", "价格"],
  ["退款怎么弄", "退款"],
  ["whatsapp api", "whatsapp"],
  ["比特币价格", null],
  ["怎么写周报", null],
  ["what's the weather today", null],
  ["asdfgh", null],
];

let pass = 0;
for (const [q, want] of cases) {
  const r = answer(idx, q, TAU);
  const got = r.abstain ? null : r.ranked[0].doc.q;
  const ok = want === null ? r.abstain : (!r.abstain && got === want);
  if (ok) pass++;
  console.log(`${ok ? "PASS" : "FAIL"}  q=${q.padEnd(24)} want=${String(want ?? "ABSTAIN").padEnd(8)} got=${String(got ?? "ABSTAIN").padEnd(8)} score=${r.ranked[0]?.score} mass=${r.ranked[0]?.mass} ood=${r.ood}`);
}
console.log(`\n${pass}/${cases.length} passed   (${((pass / cases.length) * 100).toFixed(0)}%)`);
console.log("tokenize 示例: 库存还有吗 →", tokenize("库存还有吗").join(" "), "| 比特币价格 →", tokenize("比特币价格").join(" "));
process.exit(pass === cases.length ? 0 : 2);