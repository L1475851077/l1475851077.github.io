# 本地商品管理系统（Product CMS）需求文档

> 版本：v0.1（需求初稿，待评审）
> 适用项目：kfcatering.com 静态站（本仓库，GitHub Pages 部署）
> 配套文档：[PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) · [RUNTIME_FLOW.md](./RUNTIME_FLOW.md) · [OPTIMIZATION_PLAN.md](./OPTIMIZATION_PLAN.md)

---

## 一、背景与目标

本站是纯静态站点，商品数据由两个文件驱动：

| 文件 | 用途 | 字段 |
|------|------|------|
| `products/data.js` | 列表页 + 首页热销（全局变量 `CATEGORIES` / `PRODUCTS`） | id, name, description, category, image, isHot |
| `products/product_details/products.json` | 详情页 | id, name, subtitle, image, category, features[], specs{} |

现状痛点：

1. 两文件需人工同步，已产生实际 bug（detail 的 category 写成 `fridges` 与列表 `fridge` 不一致，导致详情页同类推荐永久走兜底模式）。
2. 商品名混入中文前缀、垃圾字符 `♯`、尺寸分隔符混用（`×` / `*`），直接展示给海外客户。
3. 图片为原样 jpg（150~215KB/张），无压缩无转格式。
4. 17 个列表商品仅 1 个有详情数据，上新/补数据流程全靠手改文件。

**目标**：做一个只在本机（Windows 电脑）运行的桌面商品管理工具，覆盖商品的增删改查、图片处理、数据落盘与发布，替代"手改 JSON + 手敲 git"的流程，并从录入侧根治脏数据问题。

**非目标（本期不做）**：

- 不部署到任何公网服务器，无多用户/权限/在线协作。
- 不做前端站点改版；不改详情页/列表页的渲染逻辑（沿用双文件契约）。
- 不做静态 SEO 落地页（`fridge-b2000.html` 类）的自动生成（列入后续规划）。
- 不做询盘/订单等业务管理。

---

## 二、产品形态与运行环境

- **形态**：桌面应用（选型倾向 Electron，理由：与仓库同机、需要 Node 能力做文件读写/git/图片处理，Windows 分发成熟；若选 Tauri 需引入 Rust 工具链，维护成本高——最终选型在设计阶段确认）。
- **运行环境**：Windows 10/11 x64；需本机已安装 Git 并可访问 GitHub（push 用现有 git 凭证管理器）。
- **启动入口**：应用启动时指向本仓库目录（首次选择、之后记忆），并校验：
  - 目录是 git 仓库且存在 `products/data.js`、`products/product_details/products.json`；
  - 校验失败给出明确提示，拒绝进入管理界面。
- **当前数据规模**：17 商品 / 6 分类，设计上限按 500 SKU 内保持流畅即可。

---

## 三、功能需求

### F1 商品列表管理

- 表格展示全部商品：缩略图、id、名称、分类、是否热销、**详情完整状态**（有/无 products.json 条目）、最后修改时间。
- 支持按分类筛选、按 id/名称关键字搜索。
- 支持新建、编辑、复制（以现有商品为模板新建）、删除商品。
- 无详情的商品显示"缺详情"徽标，提示补录（当前 16 个属预期 WIP，不强制阻塞）。

### F2 商品编辑（一次编辑，双文件同步写入）

单个编辑表单分两组字段，保存时系统同时写入 `data.js` 与 `products.json` 中同 id 条目：

- **列表组**（写入 data.js）：id、name、description（一行卖点）、category、image、isHot。
- **详情组**（写入 products.json）：subtitle、features[]（多行列表）、specs{}（键值对表格，可增删行）、详情主图。
- name、id、category、两文件间的 `category` 与 `name` 值由系统强制一致（detail 条目不再单独填这些字段）。

**录入校验（根治脏数据，保存前必须通过）**：

| 规则 | 行为 |
|------|------|
| name/description/subtitle/features/specs 含中文字符 | 报错，禁止保存 |
| name 首尾空白或含垃圾字符（`♯` 等非 ASCII 符号） | 自动清洗 + 提示确认 |
| 尺寸分隔符统一为 `×`（specs 值内） | 自动替换 `*`/`x` 为 `×` |
| id 格式：`分类-型号`，仅 `[a-z0-9-]`，全站唯一 | 报错 |
| category 必须存在于分类表 | 报错 |
| 图片路径统一为站内绝对路径（`/products/...`） | 保存时自动规范化 |
| 详情组字段为空 | 警告，允许选择"仅保存列表，详情待补"（该商品维持"缺详情"徽标） |

### F3 分类管理

- 对 `CATEGORIES` 增删改（id + 显示名，英文）。
- 删除或改 id 前检查引用：有商品挂在旧 id 上时禁止直接删，提示先迁移。
- 分类 id 即详情图片子目录名，需与 F4 约定联动。

### F4 图片管理

- 编辑商品时从本地选图（jpg/png/webp），支持多张候选、选定其一为主图（列表/详情可分别选，也可一键"与列表同图"）。
- **自动处理**：上传的图片统一转 WebP 并按目标宽度约 800px、质量 ~80 压缩（具体参数设计阶段可调），预计单张 ≤100KB。
- 存储位置沿用现有约定：详情图 → `products/product_details/product_images/<category>/`，列表图 → `products/product_images/`；文件名沿用 `img_<时间戳>.webp`。
- 应用内显示图片预览与当前体积；删除商品时其专属图片标记为可清理（清理动作需二次确认，防误删被别处引用的图）。

### F5 保存 → 本地仓库

- "保存" = 校验 → 原子写入两个数据文件 + 图片落盘 → **git 本地 commit**（不 push）。
- 每次保存产出一个 commit，同时包含 data.js、products.json、图片变更，保证单次提交内数据自洽（相比现状"list/detail 两条提交"更安全；提交信息沿用可识别格式，如 `Update product fridge-xxx via CMS`）。
- commit 只包含本次相关文件，**绝不 `git add -A`**，避免把用户在仓库里的其他未提交改动（如 Style B 改版）卷进来。
- 写文件前对两个数据文件做快照备份（应用数据目录内保留最近 N 份），任何写入失败可回滚。
- 解析 `data.js` 采用"识别 `var CATEGORIES = [...]` / `var PRODUCTS = [...]` 的 JSON 块"方式原地替换，保留文件其余内容不动。

### F6 上线官网（push）

- 主界面提供"上线官网"按钮：`git push origin main` → GitHub Pages 自动发布（约 1 分钟）。
- push 前检查并提示：待推送 commit 数（展示 commit 列表）、当前分支是否为 main、与远端是否有分叉（有分叉 → 提示先在终端 pull/rebase，工具不自动做合并决策）。
- push 结果显示成功/失败（网络、凭证错误等给出可读原因）。
- 提供"发布历史"视图：`git log` 中最近 N 条 via CMS 提交 + 对应远端状态。

### F7 仓库状态面板

- 显示：当前工作区是否有未提交改动（工具外的改动如实列出，不代为处理）、本地领先/落后远端多少 commit、上次成功 push 时间。
- 工具启动时若检测到数据文件在外部被修改过（与工作区 git 状态不一致），提示重新加载。

### F8 本地预览（先验后上线）

- 工具内置一个只监听 `127.0.0.1` 的静态服务器，把当前工作区（含刚保存、尚未 push 的改动）像 GitHub Pages 一样原样静态服务，**无构建、文件即改即见**。
- 提供两种预览入口：
  - 顶栏「预览本站」：以内嵌预览窗口打开站点首页，工具栏含 后退/前进/刷新/首页/产品列表/用外部浏览器打开；
  - 商品行内「预览」：直达该商品详情页 `products/product_details/product.html?id=xxx`（缺详情的商品按现有逻辑跳 404，如实反映线上效果）。
- 保存商品后，若预览窗口开着则自动刷新并提示"预览已刷新"，便于逐个确认再决定是否上线。
- 安全：仅回环地址、禁目录穿越、响应 `Cache-Control: no-store`，绝不监听局域网端口。

---

## 四、非功能需求

| 编号 | 要求 |
|------|------|
| N1 | 数据安全优先：任何写入失败不得损坏现有 data.js / products.json（先写临时文件再原子替换） |
| N2 | 离线可用：除 push 外全部功能不依赖网络 |
| N3 | 启动时间 < 3s；商品列表在 500 SKU 内操作无明显卡顿 |
| N4 | 应用自身数据（备份、设置）存放于用户目录应用数据文件夹，不混入站点仓库 |
| N5 | 界面语言：管理端中文即可（商品内容字段强制英文） |
| N6 | 无需安装 Node：交付为可直接运行的安装包或免解压目录 |

---

## 五、验收标准（关键场景）

1. 新建商品"Undercounter Dishwasher KF-DW-01"，填列表+详情字段，上传 1 张 2MB jpg → 保存后：data.js 与 products.json 各新增一条且 category 一致；图片变为 WebP（<100KB）落在 `product_images/fridge|dishwasher/`；产生 1 条本地 commit；`git status` 显示无本工具遗留的未提交文件。
2. 在 name 中输入"冰箱Dishwasher♯" → 无法保存并给出可读错误；清洗后保存成功。
3. 编辑已有商品只改 specs → 保存后 data.js 未被无意义改动（若列表字段无变化则文件 diff 仅涉及 detail，或两文件均重写但内容 hash 一致不产生空提交）。
4. 点"上线官网" → push 成功 → 1~2 分钟后 https://kfcatering.com/products/index.html 可见新商品。
5. 仓库中存在用户其他未提交改动时保存商品 → 该改动不出现在 CMS 的 commit 中。
6. 删除商品 → 数据文件同步移除、提示图片清理且需确认、产生删除 commit。

---

## 六、开放问题（设计阶段前需确认）

1. Electron 还是 Tauri（默认建议 Electron）。
2. 详情页未来是否支持多图相册（当前 products.json 结构只有单 `image`；本期按单图做，多图列入后续）。
3. `fridge-b2000.html` 等静态 SEO 落地页与 CMS 的关系：本期只保证不破坏，不同步更新。
4. WebP 转换后，`data.js` 中现存的 15 个未补详情商品的旧 jpg 引用是否借首编时顺带迁移。
