# 运行流程说明（Runtime Flow）

> 描述站点从请求到渲染、再到内容更新的完整逻辑流转。
> 配套文档：[PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)（目录结构） · [OPTIMIZATION_PLAN.md](./OPTIMIZATION_PLAN.md)（优化清单）。

---

## 一、总览：一条请求的完整链路

本站是**纯静态站点，没有后端**。"运行逻辑"全部发生在浏览器里：

```
用户浏览器
   │  请求 https://kfcatering.com/xxx
   ▼
GitHub Pages（读仓库 main 分支的静态文件）
   │  返回 HTML / CSS / JS / 图片
   ▼
浏览器执行
   1. 解析 HTML，加载 CSS（页面被 .main-content 的 opacity:0 暂时隐藏）
   2. defer 脚本按文档顺序执行：loading.js → data.js → products-data.js → script.js
   3. loading.js 插入全屏加载遮罩
   4. DOMContentLoaded：各页面脚本 await products-data.js 的合并数据渲染 DOM
   5. window load：body 加 loaded 类 → 内容淡入、遮罩淡出
   ▼
用户看到完整页面，之后的一切交互（分类/搜索/翻页/弹窗/推荐）
都是本地 JS 对内存数据的操作，不再请求服务器
```

**商品数据统一读入口**：根目录 `products-data.js` 暴露 `window.productsDataReady`（一个 Promise），把 `data.js` 的全局 `CATEGORIES`/`PRODUCTS`（列表/分类字段）与 `fetch('/products/product_details/products.json')` 的详情数组（subtitle/features/specs）按 id 合并成 `{ categories, products, details }`。列表字段以 data.js 为权威，详情侧只补充详情字段。全站唯一的运行时数据请求就是这一个 fetch（带 `cache: 'no-cache'` 走 ETag 复验）。

---

## 二、全局加载流程（每个页面共用）

所有页面都引入同一套 `loading.css` + `loading.js`，配合 CSS 的 `body.loaded` 开关完成"遮罩 → 入场动画"的交接：

1. **解析阶段**：`.main-content { opacity: 0; transform: translateY(10px) }`（style.css），页面内容此刻不可见；`loading.css` 定义全屏白色遮罩样式。
2. **defer 脚本执行**（HTML 解析完毕后、DOMContentLoaded 之前，按文档顺序）：
   - `loading.js`：动态创建 `#global-loading` 遮罩节点，插入 `body` 第一个子元素；注册 `load` / `pageshow` 监听；同时启动一个 **3 秒兜底定时器**。
   - `data.js`（需要商品数据的页面）：定义全局变量 `CATEGORIES`（两级：`parent` 字段指向大分类）和 `PRODUCTS`。
   - `products-data.js`（同上页面，defer）：发起 products.json fetch，构建 `window.productsDataReady` 合并数据源。
   - `script.js`（defer，位于 body 末尾）：注册 `DOMContentLoaded` 回调（热销渲染、汉堡菜单、平滑滚动）。
3. **DOMContentLoaded**：页面脚本开始渲染动态内容（此时遮罩仍盖着，用户看不到渲染过程）。
4. **window load**（所有资源含图片加载完）：`loading.js` 的 `initPage()` 执行——给 `body` 加 `loaded` 类 →
   - CSS 过渡：`.main-content` 淡入上移归位（0.4s）；
   - JS：遮罩 `opacity → 0`，400ms 后从 DOM 移除。
5. **兜底与返回缓存**：
   - 3 秒内 `load` 没触发（如某张图挂了）→ 定时器强制执行 `initPage()`，保证页面永远不会卡在遮罩上；
   - 用户从浏览器后退/前进（bfcache）回到页面 → `pageshow` 事件 `persisted === true` → 移除 `loaded` 再重加，重放入场动画（列表页 `products.js` 末尾也有同样逻辑）。

---

## 三、首页流程（`index.html`，Style B 极简白目录版式）

```
加载 → 静态 Hero + 数据条直接可见 →（DOMContentLoaded）渲染 Hot Products → 用户交互
```

1. `renderHotProducts(products)`：等 `productsDataReady` 就绪后，从合并商品数组中筛出 `isHot === true` 的商品，注入 `#hotProductsGrid`；每张卡片是 style-b 的 `.p-card`（图 + 分类标签 + 品名 + 描述），链接指向 `products/product_details/product.html?id=商品id`。
2. 汉堡菜单：小屏点击 `#hamburger` 切换 `#mainNav.show`；点击页面其他区域自动收起。
3. 锚点平滑滚动：`a[href^="#"]` 拦截默认跳转，`scrollIntoView({behavior:'smooth'})`。
4. 转化入口：
   - 右下角悬浮「📞 Contact Us」→ `openContactModal()` → 显示联系弹窗（WhatsApp / 微信 / Facebook / Instagram 二维码）；点「Add WeChat」触发 `triggerQrAnimation()` 二维码抖动提示扫码；
   - 「Send Inquiry」表单 → **不提交服务器**，`sendViaWhatsApp()` 校验后把询盘内容拼成 `wa.me` 链接新窗口打开，由客户在 WhatsApp 里发出。

---

## 四、产品列表页流程（`products/index.html`）

数据加载：`data.js` + `products.js` 同步（无 defer，先建好渲染函数），`products-data.js` defer 提供 `productsDataReady`。DOMContentLoaded 后 `products.js` await 合并数据注入模块变量 `CATEGORIES_DATA` / `PRODUCTS_DATA`，再渲染：

1. **初始化**（DOMContentLoaded）：
   - `renderCategories()`：用 `CATEGORIES` 渲染左侧两级分类列表（手风琴：点大分类展开子分类），当前分类高亮；
   - `renderProducts()`：核心渲染函数，见下。
2. **`renderProducts()` 每次执行的流水线**：
   ```
   PRODUCTS_DATA（合并后 17 个商品，等 productsDataReady 注入）
     → 按 currentCategory 过滤（'all' 放行全部；选中大分类按子树匹配）
     → 按 searchTerm 过滤（name / description 包含关键字，不区分大小写）
     → 更新标题（"All Products" / "XXX Products"，同时改 document.title）
     → 分页切片：每页 12 条（ITEMS_PER_PAGE），起止 = (currentPage-1)*12
     → innerHTML 注入商品卡片（链接同首页，指向详情页）
     → requestAnimationFrame 里给卡片加 .animate-in 类（逐个淡入）
     → renderPagination(totalPages)：>1 页时自动创建/刷新分页按钮
   ```
3. **交互响应**（每次都重走上面流水线）：
   - 点分类 → `currentCategory = 分类id`，`currentPage = 1`；
   - 搜索框输入 → `searchTerm`，`currentPage = 1`；
   - 点分页按钮（事件委托）→ `currentPage = 页码`。
4. `history.scrollRestoration = 'manual'`：禁用浏览器滚动位置恢复，保证从详情页返回时回到顶部。

---

## 五、产品详情页流程（`product_details/product.html?id=xxx`）

全站唯一"先有壳、后有数据"的页面，也是唯一有运行时 fetch 和跳转分支的地方：

```
浏览器请求 product.html?id=fridge-b2000
   │
   ├─ 返回静态 HTML 壳（标题是占位的 "Loading Product"，内容区全空）
   │
   ├─ 同步加载：../data.js + recommend.js + product_details.js；defer：products-data.js（合并数据源）
   │
   └─ DOMContentLoaded（product_details.js，async 函数）：
        ├─ 解析 ?id=
        │     └─ 没有 id ──────────────► 跳转 ./404.html
        ├─ await window.productsDataReady（合并 data.js + products.json，含 fetch）
        │     └─ fetch 失败 ───────────► details 为空，等同"无详情"，跳 ./404.html
        ├─ 在 details（详情数组）里 find(id)
        │     └─ 找不到（商品不存在或未填详情）─► 跳转 ./404.html
        └─ 渲染（详情字段以 products.json 记录为准）：
             document.title / meta description ← 商品名/副标题（SEO）
             og/twitter/canonical ← 实时改写（head 里有静态兜底）
             #productName #productSubtitle #productImage
             #productFeatures   ← features[] 渲染成 <li>
             #productSpecs      ← specs 对象渲染成参数表 <tr>
             然后调用 initRecommendCarousel(id, 列表侧category, 合并商品数组) 启动推荐
```

**推荐轮播（recommend.js）逻辑**：

1. `initRecommendData(currentId, currentCategory, allProducts)`：把调用方传入的合并商品数组（products-data.js 的 `products`，**不再读** `window.PRODUCTS`）分成三池——同子分类进 `sameCategoryItems`，同大分类的兄弟子分类进 `siblingCategoryItems`，其余进 `otherCategoryItems`（都排除当前商品），并打乱顺序。
2. 同类池为空 → 自然由后一档补满一页（同级为 0 时直接由下一档顶上）。
3. 渲染：每页固定 3 张卡片，翻页用 `(startIndex + i) % total` **循环取模**，可以无限前后翻。
4. ✅ 旧"已知静默 bug"已闭环（2026-09-30 + 2026-10-05）：products.json 的 `fridges` 已改对齐；详情页推荐改用列表侧（data.js）分类，CMS 详情侧 category 再漂移也不会清空同类池；静态落地页内联调用里残留的 `'fridges'` 硬编码已改为从合并数据取当前商品分类。`scripts/validate-products.mjs` 在 CI 里持续盯这条。

**404.html**：静态兜底页，保留导航和联系弹窗，告知商品不存在。

---

## 六、静态落地页（`fridge-b2000.html` 两份）

`products/fridge-b2000.html` 与 `products/product_details/fridge-b2000.html` 是**预渲染好的静态详情页**（内容直接写在 HTML 里，给搜索引擎爬虫和分享链接用），仍引入 `script.js` 复用联系弹窗/汉堡菜单等公共功能。动态详情页与它并存：爬虫吃静态版，用户从列表点进来走 `?id=` 动态版。

---

## 七、内容更新流转（CMS → 线上）

```
运营在 CMS 后台改商品（上架/改价/删图）
   │
   ├─ 改"列表"字段 ─► 提交 "Update list item xxx via CMS" ─► 写 products/data.js
   ├─ 改"详情"字段 ─► 提交 "Update detail item xxx via CMS" ─► 写 products/product_details/products.json
   └─ 传图片 ──────► 以时间戳文件名提交到 product_images/ 各目录
   │
   ▼
GitHub main 分支
   ▼
GitHub Pages 自动重新发布（约 1 分钟，无构建步骤，文件原样上线）
   ▼
下一个访客的浏览器拿到新的 data.js / products.json → 渲染出新内容
（老访客需刷新页面才能看到，站点无任何缓存失效机制，依赖 Pages 默认 max-age=600）
```

要点：**一次完整的商品改动 = CMS 产生两条提交（list + detail）**，两个文件由 CMS 分别写入，格式由 CMS 决定、前端不改动（读侧由 `products-data.js` 合并）。一致性由 `scripts/validate-products.mjs` 兜底：`.github/workflows/validate-products.yml` 随两侧文件的提交自动运行，输出缺详情 / 孤儿详情 / category 不对齐等 WARN/INFO 提示（不阻断部署）。

---

## 八、用户动线（业务视角）

```
首页（Hero 种草 + 数据条 → Hot Products）
   │ 点击卡片 / 导航 Products / View all products
   ▼
列表页（搜索 / 分类过滤 / 翻页 挑选）
   │ 点击商品卡片
   ▼
详情页（卖点 features + 参数 specs + 同类推荐继续逛）
   │
   ├─「Send Inquiry」→ 首页 #contact 表单 → WhatsApp 直发询盘
   ├─ 悬浮「Contact Us」→ 联系弹窗 → WhatsApp / 微信 / Facebook / Instagram
   └─「You May Also Like」→ 同类商品详情页（循环浏览）
```

---

## 九、容易踩坑的时序细节

1. **defer 顺序是"文档顺序"**：首页 `loading.js` → `/products/data.js` → `products-data.js` → `script.js`（body 末尾）都带 defer，按出现顺序执行；`products-data.js` 执行时 data.js 的全局变量已就位，`script.js` 的 `DOMContentLoaded` 回调里 `productsDataReady` 已存在。若把 data.js 改成异步/动态加载，加载器会拿到空列表直接短路返回。
2. **列表页的 data.js / products.js 是同步 script**（无 defer）：阻塞解析先建渲染函数；商品数据本身改由 DCL 里 await `productsDataReady` 注入 `CATEGORIES_DATA` / `PRODUCTS_DATA`。
3. **详情页的渲染与推荐读的是不同侧面**：渲染本体以 `details`（products.json 记录）为准——未填详情的商品因此仍按现状跳 404；推荐位读合并后的 `products`（列表字段权威）。合并逻辑全部集中在根目录 `products-data.js` 一个文件里，将来迁真正单数据源（方案 A/B）只改这一处。
4. **`.main-content` 遮罩机制依赖 body 上的 loaded 类**：任何新页面如果漏引 `loading.js` 或没把内容包进 `.main-content`，就会出现"白屏到 load 才显示"或"永远 opacity:0"两种异常。
