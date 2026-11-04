# AI 消息自动应答引擎 · 可验收演示

纯前端单文件 Demo：**离线运行、零 API Key、零后端依赖**。直接打开 `index.html` 即可验收。

## 验收要点

| 能力 | 实现 | 验收方式 |
| --- | --- | --- |
| 检索 | BM25（k1=1.2, b=0.75） | 页面右侧证据表展示 top3 命中词与 score / mass |
| 中文分词 | CJK 二元切分 + 疑问填充词剥离 | `库存还有吗` → `库存`；`比特币价格` → `比特 特币 币价 价格` |
| 防幻觉 | 三重拒答闸门：`τ_score` 绝对相关度 / `τ_mass` 匹配信息量 / `τ_ood` 未知词占比 | 任一越界即拒答转人工；页面显示具体触发的闸门与数值 |
| 可回归 | 内置 11 条基准用例（7 应答 + 4 对抗/越域） | 点「跑 11 条基准用例」应显示 11/11 通过 |

## 试用

1. 在「知识库」文本框粘贴自己的语料，每行一条，格式 `问题 | 答案`。
2. 在「客户提问」输入问题，点「回答」。
3. 看三样东西：**决策**（作答 / 拒答转人工）、**延迟**（毫秒级）、**证据表**（命中了哪条知识、命中哪些词）。

对抗用例建议：`比特币价格`、`what's the weather today`、`asdfgh`、`怎么写周报` —— 都应拒答，不得编造。

## 命令行回归测试

```bash
node core_test.mjs   # 从 index.html 抽取 CORE 区块在 Node 中真实执行，期望 11/11 passed（退出码 0）
```

## 部署

静态托管即可，无需构建步骤：

```bash
# Cloudflare Pages（需 CLOUDFLARE_API_TOKEN + CLOUDFLARE_ACCOUNT_ID）
scripts/deploy_cloudflare_pages.sh

# GitHub 仓库 + GitHub Pages（需 GITHUB_TOKEN）
scripts/deploy_github_pages.sh
```

## 边界说明

- 接入渠道走**官方 API**（WhatsApp Business Cloud API / 企业微信 / 公众号），不做外挂式 Hook，规避封号风险。
- 答案只来源于你的语料；置信度不足时拒答并转人工，这是防幻觉的核心验收点，而非"尽量答"。
