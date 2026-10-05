# 优化建议清单（Optimization Plan）

> 生成日期：2026-09-19。
> 配套文档：[PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)（项目结构说明）。
> 用法：完成一项就把 `- [ ]` 改成 `- [x]`。
> **2026-09-20 全量复核**：逐条以工作区实际代码/文件为证据更新状态；核查手段为静态扫描（引用、体积、OG/schema）+ 本地与线上 `https://kfcatering.com` 直接 HTTP 探测，未启动任何自建服务器。编号沿用原清单，新增项接在末尾。

## 建议执行顺序（复核后调整）

性能类（第 5~11、16、21 项）本轮已全部落地，剩余可见缺陷集中在**数据内容治理**与**未填详情商品的 404 体验**；SEO 三项对外贸获客价值最高但至今 0 进展。
**第一批：第 4、5、1 项（数据清洗 + category 统一 + 未填详情商品的降级体验）→ 第二批：第 2 项（根 404）→ 第三批：第 11~15 项（SEO/OG，真正未开始，含新建 robots.txt）**。

---

## 一、正确性问题（优先修）

- [ ] **1. 详情页大面积 404（2026-09-20 改判：属预期进度，非数据事故）**：
      ⏸️ **2026-09-30 暂缓**：当前商品数据为临时测试数据（用户确认），待正式数据录入时自然解决，无需按本项处理；本项保留作为正式数据录入时的检查清单。
      现状为商品列表已上架 **17 个商品**（`products/data.js` 中 `"id"` 共 23 处，其中 6 处属于 `CATEGORIES`，原记"23 个商品"是口径错误），详情数据只填了 1 个示例（`products/product_details/products.json` 仅 fridge-b2000）。列表本身不是 bug，但点进未填详情的 **16 个商品**会由 `product_details.js:7,19,65` 硬跳 `./404.html`，海外客户会当成死链。
      本期做法：列表页对"有列表项、无详情数据"的商品改为禁用点击 + 显示 "Details coming soon" 角标，或详情页降级渲染（标题+主图+Inquire now，不跳 404），二选一即可。
      长期：详情逐条补完后，仍以 products.json 为唯一数据源（见第四节方案 A）；可写一个 Node 脚本对比两边 id 集合放 GitHub Actions，纯提示哪些商品还缺详情，不报错。
      ⚠️ 补数据时注意（均已实测存在）：CMS 会把中文前缀写进 name（见第 4 项）、会把占位图复用给多个商品、detail 的 category 值要与 list 对齐（见第 4/第五节前提 2）。
- [x] **2. 整站没有根目录 404 页**：GitHub Pages 只认仓库根的 `404.html`，实测仓库根 `ls 404.html` → 不存在，只有 `products/product_details/404.html`。用户输错任何 URL 看到的是 GitHub 默认报错页。
      ✅ 2026-09-30 完成：已复制到仓库根 `404.html`，资源全部改为根相对/根绝对（`/style.css`、`/loading.css`、`/loading.js`、`/script.js` 均带 `?v=20260930a`，logo/favicon 本就根绝对），导航与"Browse All Products"链接改为 `/` 与 `/products/`，标题/文案从 "Product Not Found" 改为 "Page Not Found"，标题层级顺手由 h2 升为 h1；grep 确认无残留 `../` 相对引用。
- [x] **3. 推荐位图片路径 bug**：`products/product_details/recommend.js` 原用 `src="../${p.image}"` 拼接。
      ✅ 2026-09-20 修复：新增 `normalizeImgSrc()`，把 `/products/...`、`../images/...`、裸 `images/...` 三种历史形态统一归一为站点根绝对路径，模板改为 `<img src="${normalizeImgSrc(p.image)}" ... loading="lazy">`（recommend.js:87）。已在 Node 中用真实 data.js 三种取值验证归一结果。
      修正原诊断：`"../" + "../images/x"` 得 `../../images/x`，相对 `/products/product_details/` 解析后**正是 `/images/x`，原本能命中**；真正必裂的只有 `p.image` 为根绝对路径那一条（拼成 `..//products/...`，即 fridge-b2000）。
- [ ] **4. CMS 写入的商品名不干净**（未解决，且复核发现新缺陷）：
      ⏸️ **2026-09-30 暂缓**：当前为临时测试数据（用户确认），中文前缀/`♯`/分隔符问题随正式数据录入自然消失；正式录入时再按本项在 CMS 侧加约束。
      仍存在 `data.js:31` 的 `"冰箱Commercial Double Door Fridge B-2000"`；另有 **5 个商品 name 结尾带垃圾字符 `♯`**（`"Undercounter Dishwasher♯"`、`"Commercial Convection Oven 10 Trays 40×60♯"` 等），尺寸分隔符混用（`150×75×80` vs `180*70*80`）。这些直接展示给海外客户。
      做法：手工清洗存量 + 在 CMS 录入侧加约束（禁中文/符号前后缀、统一 `×`）。根因在数据源，见第六节待确认第 5 条。
- [x] **5. category 命名不一致导致同类推荐永远为空**（原记在第 4 项行末，单列以免被"名字已清洗"误导）：
      ✅ 2026-09-30 修复：`products/product_details/products.json` 的 `"category": "fridges"` 已改为 `"fridge"`（与 `data.js` 的 CATEGORIES/商品值对齐），JSON 校验通过，fridge-b2000 同类推荐恢复出商品（浏览器实测 3 个推荐位均为 fridge 分类）。此为结构性不一致（CMS 导出详情的固定行为），不随测试数据自然消失；若后续上方案 A/B 合并数据源，CMS detail 的 category 字段需锁定为 list 侧取值。
      （原"⏸️ 暂缓：临时测试数据"的判断仅适用于第 1/4 项的内容问题，此项为结构问题不适用，已单独修复。）

---

## 二、性能优化（本节 5~11 项本轮已完成）

- [x] **5. 两个 favicon 各约 1.4MB** ✅ 实测根目录原为 665×512 **未压缩 BMP 容器**的 `favicon.ico`，且与 `images/logo.ico` **字节级相同**（`md5sum` 一致，各 1,361,974 B）。已用 `logo.png` 重绘为多尺寸 ICO（16/32/48）**4,374 B，省 99.7%**；6 个页面的 `<link rel="icon">` 全部统一为 `/favicon.ico`。
      未做（与文档曾声称的做法不符）：没有生成 `favicon-16/32/48/96.png`、`apple-touch-icon.png`、`site.webmanifest`，页面也没有 `apple-touch-icon` 引用。若要 iOS 主屏图标需另开一项。
      线上仍是旧图：实测 `favicon.ico` 903,552 B、`images/logo.ico` 582,208 B → **收益待部署后生效**。
- [x] **6. 清理冗余图片** ✅ 实测删除 8 个零引用文件：`images/logo-old.png`(584K)、`logo-old.ico`、`logo_old1.ico`、`images/logo.ico`(1.4M)、4 张 `images/*_qr.jpg`；并清掉 3 个页面中引用已删 jpg 的注释死代码。删除后全站 HTML/JS/CSS/XML 扫描 **0 处悬挂引用**。
      ❌ 修正原诊断：清单曾写"5 品共用的 `../images/photo-冰箱.jpg` 在仓库中根本不存在"。实测该文件**存在**（有效 JPEG，500×333，20,201 B，git 已跟踪），且本地与线上直接请求均 HTTP 200。真实问题是**占位图被多 SKU 复用**：`photo-冰箱.jpg` 被 oven/worktable/dishwasher/cabinet/workstation 5 个不同分类共用，`fridge-KF-0.5F-2F.webp` 被 11 个 KF 型号共用。截图中的裂图见第六节待确认第 1 条。
      仍待做：CMS 上传的商品图（`product_images/uploaded/` 等）单张 150~215 KB jpg，建议上传流程统一转 WebP + 压缩。
- [x] **7. 列表/详情页脚本阻塞** ✅ 2026-09-20 **两个 CDN 依赖已彻底移除**，本项从"异步加载"升级为"零外链"：
      · FontAwesome 6.5.0（`all.min.css` 102 KB + `fa-brands-400.woff2`，实测该请求 5.8 s）：全站只用到 5 个品牌图标，已把官方 SVG path 内联进 `contact-modal.js`（WhatsApp/WeChat/Facebook/Instagram）与 `index.html` 联系区（YouTube），6 个页面的 FA 标签全部删除。
      · 许可收敛：内联的 path 后改用 **Simple Icons（CC0，无署名义务）** 而非 Font Awesome Free（CC BY 4.0，法律上要求公开署名）；线条图标用 Lucide（ISC）。字体 Inter 为 SIL OFL 1.1（已读字体文件 name 表确认，允许网站嵌入、无署名义务）。全站资源许可均为可商用且无需署名，来源记录在 `contact-modal.js:4-7`。
      · Google Fonts Inter（实测握手 7.4 s）：改为**自托管可变字体** `fonts/inter-latin-wght-normal.woff2`（latin 子集，48,256 B，一份覆盖 100~900 全字重），`style.css:9` 用 `@font-face` + `font-display: swap` 引入；6 个页面的 `preconnect`/`fonts.googleapis` 标签删掉，替换为一条 `<link rel="preload" as="font" crossorigin>`。字体不再闪（swap）且首屏不等握手。
      复核方式：6 个页面 HTML/CSS 全量扫描，除社交媒体跳转链接外 **0 处外部资源引用**。
      ✅ 2026-09-30 备注：`ltzj_game.html` 已随第 14 项整页移除，全站 0 外链彻底达成。
- [x] **8. 图片懒加载** ✅ `products/products.js:131`（列表卡片）与 `recommend.js:87`（推荐位）均已带 `loading="lazy"`；首页热销位改版时已具备。
- [x] **9. 加载遮罩闪烁** ✅ 遮罩 HTML 已内联到 5 个加载 `loading.js` 的页面 `<body>` 开头（第 6 个页面 `products/fridge-b2000.html` 不引用 loading.js，无需遮罩）；`loading.js:4` 改为优先复用已有节点、缺失时才动态插入；并加 `<noscript><style>.global-loading{display:none}</style></noscript>`，避免禁用 JS 时内容被遮罩永久盖住。
      ✅ 2026-09-20 隐藏时机改为 **DOMContentLoaded**（`loading.js:36-42`，defer 脚本执行时 readyState 已是 interactive，故同时兼容"事件已触发"分支），不再等 `window.load`——图片全为懒加载，等 load 只会把外部资源算进白屏时间；`body.loaded` 的淡入动画随之提前。兜底 3 s → **1 s**。
- [x] **10. 首页轮播三张 slide 用同一张图**（`images/equipment_lb/1760707271.webp`）：既是性能问题也是转化问题，建议每张配不同实拍图。
      ✅ 2026-09 选型 Style B 改版后轮播整体移除，首屏改为静态 Hero 左文右图（该图 54,908 B 复用为 Hero 配图），此项随结构消失。
- [x] **21. 联系弹窗资源每页全量下载** ✅ 2026-09-20 与第 16 项一并解决：新增根目录 `contact-modal.js`，二维码 `<img>` 改用 `data-src`，仅在**首次打开弹窗时**注入 src；4 张 webp 合计 102.6 KB 不再随页面下载。
      实测各页总重（HTML + 本地引用资源，不含按需加载的二维码与 contact-modal.js 自身 7.8 KB）：首页 224.5 → **166.7 KB**、列表页 174.8 → **116.6 KB**、静态商品页 163.5 → **98.7 KB**、详情页 186.8 → **122.2 KB**、静态详情落地页 186.3 → **121.7 KB**、404 页 164.2 → **99.0 KB**。
      扣除自托管字体 47.1 KB 后分别为 119.6 / 69.5 / 51.6 / 75.1 / 74.6 / 51.9 KB（与上一版 115.3 / 68.4 / 54.4 / 77.6 / 77.1 / 54.4 一致，差异来自内联 SVG 与 contact-modal.js 增重）。字体是全页唯一新增的"必须下载"资源，换来的是不再等 7.4 s 的外部握手。

---

## 三、SEO / 分享（外贸站特有价值 —— 实测 0 进展）

- [x] **11. 零 Open Graph 标签**：实测 6 个页面 `"og:` 命中数全为 **0**，也无 canonical / twitter card。获客渠道是 WhatsApp/Facebook，客户转发链接无标题无配图，是外贸站最贵的缺口。
      ✅ 2026-09-30 完成：6 个页面全部加 canonical + `og:type/site_name/title/description/url/image/locale` + `twitter:card/title/description/image`；分享图用 Hero 实拍图居中裁剪生成的 `images/og-cover.jpg`（1200×630 JPEG 92 KB，兼容 WhatsApp/Facebook；CMS 测试图是无关照片不可用作分享图）。动态详情页在 `product_details.js` 渲染时实时改写 og/twitter/canonical，head 内保留静态兜底供不执行 JS 的爬虫读取。
      ❌ 文档一度声称"首页 4 条 + 列表 3 条 + 详情 2 条已完成"，工作区无此改动（见第六节）。
- [x] **12. sitemap.xml 只有 2 条 URL**（部分完成，商品 URL 等正式数据）：
      ✅ 2026-09-30：新建 `robots.txt`（Allow 全站 + `Sitemap:` 行）；sitemap 更新为 3 条主页面 URL（首页、列表页、fridge-b2000 静态落地页），lastmod 同步 2026-09-30。
      ⏸️ 商品详情 URL 暂不加入：当前商品为临时测试数据（用户确认），把测试商品写进 sitemap 有害；正式数据录入时随详情页补齐（并连带 Product schema，见第 15 项）。动态详情页 `product.html?id=` 为 JS 渲染，不建议直接列。
- [ ] **13. 详情页 JS 渲染**：`product.html` 的 `<title>` 仍是静态 `"Loading Product | ..."`。现有 fridge-b2000 静态落地页方向正确，但 17 个商品只覆盖 1 个；若商品持续增长，建议上轻量 SSG（11ty/Astro）：products.json 做数据源，构建时生成每个商品的静态详情页 + sitemap + OG，CMS 推 GitHub 流程不变，仅部署前多一步构建。
- [x] **14. `products/ltzj_game.html`**：✅ 2026-09-30 用户确认小游戏不需要，整页已从项目移除（`git rm`，无任何页面引用、无本地专属资源），比 noindex 更彻底，搜索引擎下次抓取自然 404。顺带解决了第 7 项备注中"该页 @import Google Fonts Rajdhani 未断外链"的遗留——页面删除后全站 0 外链。
- [ ] **15. 补充结构化数据**：实测 `application/ld+json` 全站仅 `index.html` 1 处（Organization），**无任何 Product schema**；`products.json` 也没有 `schema` 字段。核心商品建议补 Product（品牌/型号）。

---

## 四、数据源架构决策（做第 1 项前先定）

**背景**：推荐/列表功能不依赖 `data.js` 这个文件，只依赖"一份商品数组"。`products.json` 里 id、name、image、category 都有，去掉 `data.js` 推荐照常能做——详情页 `product_details.js` 本来就 fetch 了 products.json，把数组传给 `initRecommendCarousel(product.id, product.category, allProducts)` 即可，不会再发网络请求。

**合并的两个前提**（实测均仍存在）：
1. `products.json` 缺字段：没有 `isHot`（首页热销筛选）、没有 `description`（只有 `subtitle`）。需在 CMS 的 detail 配置补字段，旧数据补默认值。
2. **category 命名不一致（现存 bug，即第 5 项）**：`data.js` 用 `fridge`，`products.json` 用 `fridges` → 同类推荐永远为空。统一数据源顺带修复。

- [ ] **方案 A：products.json 单一数据源（推荐）**
  改动点：`recommend.js`（接收传入数组，去掉 `window.PRODUCTS` 依赖）、`product_details.js`（传参）、`products/products.js` + `products/index.html`（列表页改 fetch）、根 `script.js` + `index.html`（首页热销改 fetch）；CMS detail 配置补 `isHot`/`description`、统一 category 值。
  前提：CMS 工具的字段配置可以修改。
  ◐ **2026-10-05 读侧中间态已落地（CMS 契约不动）**：新建根目录 `products-data.js` 统一读入口——首页热销（`script.js`）、列表页（`products.js`）、详情页（`product_details.js`）、推荐位（`recommend.js`）全部改为 `await window.productsDataReady` 取合并数据，不再直接读 `window.PRODUCTS` 或各自 fetch products.json；列表字段以 data.js 为权威，详情侧只并入 subtitle/features/specs，推荐分类改取列表侧值（CMS detail 的 category 再漂移也不会清空同类推荐）。数据文件格式零改动，CMS 提交流程不受影响；将来真正迁 A/B 时只需改这一个加载器。顺带修掉静态落地页 `product_details/fridge-b2000.html` 内联调用里残留的 `'fridges'` 旧分类硬编码。
  改动点中前端部分（recommend 接收数组、去 PRODUCTS 依赖、详情页传参）已随中间态完成；剩余为 CMS detail 配置补 `isHot`/`description` 与数据文件本身的合并。
- [ ] **方案 B：保留 data.js，改为由 products.json 自动生成（折中）**
  GitHub Actions 里跑脚本从 products.json 生成 data.js，CMS 只提交 products.json，data.js 变成构建产物。前端代码一行不改，同样达到单一数据源。
  适用：CMS 字段配置不好动的情况。
- [x] **方案 C（最小止损，若 A/B 都暂不做）**：只加同步校验脚本 + 手工修 category 不一致（把 products.json 的 `fridges` 改成 `fridge`，或反向），让同类推荐先恢复工作。
  ✅ category 修齐部分已于 2026-09-30 完成（见第 5 项）。
  ✅ 2026-10-05 同步校验脚本上线：`scripts/validate-products.mjs`（Node，零依赖）对比两侧 id 集合（缺详情 / 孤儿详情 / 重复 id）、category 对齐与合法性、name/image 漂移、分类树 parent 引用完整性、方案 A 迁移就绪度（详情缺 isHot/description 字段计数）；数据问题只输出 WARN/INFO 不阻断（仅文件解析失败才 exit 1），CI 下写入 Step Summary。`.github/workflows/validate-products.yml` 监听两侧数据文件与脚本自身的 push/PR，随 CMS 提交自动运行。本地实测输出：3 条 INFO（1 条 name 漂移、16 个缺详情、1/1 缺 isHot/description）、0 条 WARN。

---

## 五、代码维护（顺手做）

- [x] **16. 联系弹窗 HTML 复制了 6 份** ✅ 2026-09-20 抽成公共组件：新建 `contact-modal.js`（注入 `#contactFloatBtn` + `#contactModal`，并挂 `window.openContactModal/closeContactModal/triggerQrAnimation`），6 个页面各删约 39~40 行副本、改为在 `</body>` 前引入 `<script src="/contact-modal.js" defer></script>`；`script.js` 中的三个弹窗函数已移除（现由组件提供）。图片路径统一为站点根绝对路径，不用再维护 `../` 层数。
      顺带修掉复核发现的三处问题：① 3 个页面的 WeChat 按钮文案错写成 `Add WhatsApp`（`products/index.html`、`products/fridge-b2000.html`、`products/product_details/fridge-b2000.html`），现统一为 `Add WeChat`；② `products/product_details/404.html` 有一段内联汉堡菜单脚本与 `script.js` 的 `classList.toggle('show')` 冲突（一个改 `display:flex`），已删除内联版本；③ 同文件中"如需可告知/可复制原 modal"等 4 行过时注释已清。
      验证：全站已无 `id="contactFloatBtn"`/`id="contactModal"` 残留副本（grep 0 命中）；`node --check` 通过；`.contact-modal{display:none}`（style.css:267）保证注入后不会闪现。
- [ ] **22.（新增）双 hero 与重定向桩**：
      ✅ 2026-09-30 复核实测已随改版/CMS 提交自然消失，无需改动：`project-cases/`、`news/` 两个重定向桩目录已不存在；`products/index.html` 与 `products/fridge-b2000.html` 现各只剩 1 个 `<h1>`（列表页标题为 `<h2 id="productsTitle">`）。`product_images/` 保持保留（`uploaded/` 下 3 张 jpg 被 `index.html` 与 `product_details.js` 引用）。
- [x] **17. 清理死代码**：❌ 更正上一版记录——`script.js` 开头的旧商品数据注释块**仍在**（第 23~63 行 `// const allProducts = [...]`、第 123~137 行被注释的旧 `renderHotProducts`），只是位置下移了，之前判为"已不存在"是错的（本轮已从该文件删掉三个弹窗函数，约 14 行）。
      ✅ 已做：3 个页面中引用已删二维码 jpg 的注释行已清；404 页的过时弹窗注释已清。
      ✅ 2026-09-30 收尾：`script.js` 两段注释死代码块（旧 `allProducts` 数据 + 旧 `renderHotProducts`，约 45 行）已删，`kf_data/data.js` 过时提示一并清除；`product_images/fridge/text.txt` 已删（`images/equipment_lb/test.txt` 此前已从工作区删除）；新建 `.gitignore`（忽略 `.claude/settings.local.json`、系统杂项与 `_test_*`/`_debug*` 测试脚手架，`git check-ignore` 验证命中）。
- [x] **18. innerHTML 注入**：✅ 2026-09-30 全部注入点已转义。4 个文件新增同款 `escapeHtml()`（`& < > " '` 全覆盖）：`products.js` 分类列表 + 商品卡片（链接 id 改用 `encodeURIComponent`）、`recommend.js` 推荐卡（同上）、`product_details.js` 规格表 key/value、`script.js` 首页热销卡（同上）；详情页名称/副标题/特性原本就走 `textContent`，无需改。`document.title` 与 meta description 为纯文本上下文，不涉及。
- [x] **19. 无障碍小项**：✅ 2026-09-30 弹窗补齐：ESC 关闭、Tab 焦点圈定（focus trap，含 Shift+Tab 回绕）、关闭时焦点还原到触发按钮；关闭按钮 `<span class="close">` 加 `role="button"` + `tabindex="0"` + `aria-label`，支持 Enter/Space 激活；弹窗容器加 `role="dialog"` + `aria-modal` + `aria-label`。首页询盘表单 label 已有（2026-09 改版）。
- [x] **20. 建议补 `.nojekyll`** ✅ 实测仓库根已存在该文件。

---

## 六、复核冲突记录与待确认（2026-09-20）

文档在本次复核过程中被外部改动过（勾选状态在 80 / 128 行两个版本间切换）。以下"声称已完成"与代码不符的条目已按实测回退为未做，**请勿据此重复标记完成**：

| 条目 | 文档曾声称 | 工作区实测 | 结论 |
|---|---|---|---|
| 根 `404.html`（第 2 项） | 已创建并统一遮罩/favicon | 文件不存在 | ❌ 未做 |
| favicon（第 5 项） | 5 个 PNG + apple-touch-icon + webmanifest | 仅 1 个 4,374 B 的 `favicon.ico`，无 PNG/manifest | ⚠️ 目标达成，做法与描述不符 |
| OG / canonical / twitter（第 11 项） | 共 10 条已写入 | 全站 0 条 | ❌ 未做 |
| sitemap 17 条 + noindex（第 12/14 项） | 已补全并验证 | 仍 2 个 `<loc>`，game 页无 noindex | ❌ 未做 |
| Product schema（第 15 项） | products.json 已含 schema 字段 | 无该字段，ld+json 仅首页 Organization | ❌ 未做 |
| 商品名清洗（第 4 项） | 已清洗 4 条、CMS 已重生成 | 中文前缀仍在，5 条 name 带 `♯` | ❌ 未做 |
| 列表页 6 张坏图根因 | "photo-冰箱.jpg 文件不存在" | 该文件存在且本地/线上直接请求均 200 | ❌ 诊断错误，见待确认 1 |

**待人工确认**
1. 列表页截图中 6 张卡片显示裂图，但对应 jpg（`images/photo-冰箱.jpg`）与 fridge-b2000 详情图在本地和线上直接请求均为 HTTP 200 → 需要该页面 DevTools Network 的实际失败请求来判断：怀疑是中文文件名在 Live Server（127.0.0.1:5500）下的路径解码问题，或截图来自改版前的线上站。
2. 本文件存在并发写入迹象，若另有会话在改，请先收敛到一处。
3. 全部改动尚未提交，线上仍是改版前状态（旧 favicon 904 KB/582 KB、旧页面）；性能收益需部署后复核。是否随本轮部署由你决定。
4. 第 4 项根因在 CMS 数据源：手工清洗 `data.js` 会被下次 CMS 提交覆盖，需先确认 CMS 侧能否加约束。
