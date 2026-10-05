# 项目结构说明文档

> 站点：**kfcatering.com** —— 广州 Kingfood（KF Catering）商用厨房设备公司官网
> 仓库：`L1475851077/l1475851077.github.io`（GitHub Pages 用户站点仓库）
> 相关文档：[RUNTIME_FLOW.md](./RUNTIME_FLOW.md)（运行流程） · [OPTIMIZATION_PLAN.md](./OPTIMIZATION_PLAN.md)（优化建议清单，含数据源架构决策）

---

## 一、项目概览

| 项目 | 说明 |
|------|------|
| 网站性质 | 纯静态企业官网（英文外贸站），展示商用厨房设备产品 |
| 技术栈 | 原生 HTML / CSS / JavaScript，**无框架、无构建工具、无 package.json** |
| 部署方式 | GitHub Pages：推送至 `main` 分支即自动发布 |
| 绑定域名 | `kfcatering.com`（由根目录 `CNAME` 文件指定） |
| 数据方案 | 无后端数据库，商品数据以 JS 变量（`data.js`）和 JSON（`products.json`）形式存放在仓库中，由前端 JS 动态渲染；根目录 `products-data.js` 在读取侧把两份文件合并成单一数据源（数据文件格式不动，CMS 契约不受影响） |
| 内容更新 | 平时通过外部 CMS 工具修改商品，自动产生形如 `Update list item xxx via CMS` 的提交 |

---

## 二、目录结构树

```
l1475851077.github.io/
├── index.html                      # 首页
├── style.css                       # 全站共用样式（含响应式、汉堡菜单、弹窗）
├── script.js                       # 首页逻辑 + 全站共享函数（联系弹窗、二维码动画等）
├── products-data.js                # ★ 商品数据统一读入口：合并 data.js + products.json
├── loading.css / loading.js        # 全局加载遮罩（所有页面共用）
├── favicon.ico                     # 站点图标（多尺寸 ICO，约 4.4KB）
├── logo.png                        # Logo 原图（JSON-LD 结构化数据引用）
├── CNAME                           # GitHub Pages 自定义域名：kfcatering.com
├── .nojekyll                       # 跳过 Jekyll 构建（GitHub Pages 原样发布）
├── sitemap.xml                     # 站点地图（首页 / 列表页 / B-2000 静态落地页）
├── BingSiteAuth.xml                # 必应站长平台验证文件
├── google201797c36afd36c4.html     # Google Search Console 验证文件
├── README.md                       # 原有简短说明
├── PROJECT_STRUCTURE.md            # 本文档
├── RUNTIME_FLOW.md                 # 运行流程说明（加载/渲染/数据流转）
├── OPTIMIZATION_PLAN.md            # 优化建议清单（可勾选的任务列表）
├── scripts/
│   └── validate-products.mjs       # ★ 数据一致性校验（CI 随 CMS 提交运行，只提示不报错）
└── .github/workflows/
    └── validate-products.yml       # 跑校验脚本的 GitHub Actions 工作流
│
├── images/                         # 站点静态图片
│   ├── equipment_lb/               # 首页轮播图
│   ├── logo.webp / .png / .ico     # Logo（新旧多个版本）
│   ├── whatsapp_qr / wechat_qr / facebook_qr / instagram_qr (.jpg/.webp)
│   │                               # 联系方式弹窗中的二维码
│   ├── photo-冰箱.jpg / photo-冰箱2.jpg   # 商品占位图（多数商品共用）
│   └── fridge-KF-0.5F-2F.webp      # 冷柜系列共用展示图
│
├── product_images/uploaded/        # CMS 上传的图片（首页侧数据引用）
│
└── products/                       # ── 产品子站 ──
    ├── index.html                  # 产品列表页（侧栏搜索 + 分类 + 分页）
    ├── products.css                # 列表页样式
    ├── products.js                 # 列表渲染：分类过滤 / 搜索 / 分页（每页 12 条）
    ├── data.js                     # ★ 列表数据源：CATEGORIES + PRODUCTS 数组（CMS "list" 提交）
    ├── fridge-b2000.html           # B-2000 冰箱静态落地页（SEO 用）
    ├── product_images/             # CMS 上传的商品图
    │
    └── product_details/            # ── 产品详情 ──
        ├── product.html            # 动态详情页模板，通过 ?id=商品ID 访问
        ├── product_details.js      # 详情页逻辑：取合并数据渲染本体 + 启动推荐
        ├── products.json           # ★ 详情数据源：subtitle、features（卖点）、specs（参数表）（CMS "detail" 提交）
        ├── recommend.js / recommend.css  # 「You May Also Like」推荐轮播（同类优先）
        ├── 404.html                # 商品不存在 / 未传 id 时的兜底页
        ├── fridge-b2000.html       # B-2000 静态详情页（SEO 用）
        └── product_images/fridge/  # CMS 上传的冰箱类商品图
```

> ★ 标记的文件是商品数据来源：`data.js`（列表/分类）与 `products.json`（详情）由 CMS 分别写入，格式不动；`products-data.js` 在读取侧合并二者，所有消费方统一 `await window.productsDataReady` 取数。维护商品仍 = 维护两个数据文件。

---

## 三、页面与数据流

### 1. 首页 `index.html`
- 版式：**Style B 极简白目录**（2026-09 选型定稿，原轮播 + 公司简介版式已移除，设计 token 与组件样式已并入 `style.css`）。
- 结构：导航栏（黑色方块 CTA）→ Hero 左文右图 → Stats 数据条（10+ / 50+ / 3-Year / 24/7）→ Hot Products（4 列留白网格）→ Why Us（三栏细线 + 线性图标）→ Contact（左信息右下划线表单）→ 黑底页脚。
- **Hot Products** 由 `script.js` 在 `productsDataReady` 就绪后从合并商品数组中筛选 `isHot === true` 的商品渲染，点击跳转详情页 `products/product_details/product.html?id=xxx`。
- **联系表单**不做服务端提交：`sendViaWhatsApp()` 校验后拼 `wa.me` 链接新窗口打开，询盘由 WhatsApp 直发（防脚本刷）。
- 右下角悬浮「Contact Us」按钮 → 打开联系方式弹窗（WhatsApp / 微信 / Facebook / Instagram 二维码）。
- 头部含 Organization 类型 JSON-LD 结构化数据（公司名、logo、社交账号、联系方式）。

### 2. 产品列表页 `products/index.html`
- 数据来自 `productsDataReady` 合并数据源（`CATEGORIES_DATA` 两级分类（大分类 + `parent` 指针子分类）+ `PRODUCTS_DATA` 商品数组）；选中大分类时按子树过滤，商品挂子分类或大分类均可命中。
- `products.js` 实现：分类过滤（左侧栏）、关键字搜索（名称/描述）、前端分页（每页 12 条，无商品总数大于一页时自动生成分页按钮）。

### 3. 产品详情页 `products/product_details/product.html?id=xxx`
- `product_details.js` 等待 `productsDataReady` 后，用 `details`（products.json 记录）渲染商品本体，按 `id` 匹配：
  - 商品名、副标题、主图、Features 列表、Technical Specifications 参数表；并实时改写 og/twitter/canonical。
- **未传 id、id 不存在、无详情数据或数据加载失败时统一跳转 `404.html`。**
- `recommend.js` 在详情页左下方渲染「You May Also Like」轮播：接收合并商品数组参数（不再读全局），当前分类取列表侧值，优先同分类商品，不足时按兄弟子分类 → 其他分类补满，每页 3 个循环翻页。
- 商品 `products/fridge-b2000.html`（及其详情版）是为 SEO 单独做的静态落地页，内容与动态页等价；其推荐位同样走合并数据源。

### 4. 数据的两层结构（重要）
| 文件 | 作用 | CMS 提交类型 |
|------|------|--------------|
| `products/data.js` | 列表页 & 首页热销的数据（name、description、category、image、isHot） | `Update list item xxx via CMS` |
| `products/product_details/products.json` | 详情页数据（subtitle、image、features、specs） | `Update detail item xxx via CMS` |
| `products-data.js`（只读） | 合并以上两份文件的读侧入口，暴露 `window.productsDataReady` | 无（不参与 CMS 提交） |

一次完整的商品上架/修改，CMS 会成对产生两条提交（list + detail）。两边一致性由 `scripts/validate-products.mjs` 校验（CI 自动运行，输出 WARN/INFO 提示，不阻断部署）。

---

## 四、样式与脚本职责

| 文件 | 职责 |
|------|------|
| `style.css` | 全站基础样式（**Style B 设计 token**：墨黑/灰/细线、Inter 字体、品牌红 `--accent` 点缀），导航、Hero、数据条、商品卡片、弹窗、响应式（小屏汉堡菜单） |
| `script.js` | 首页专属：渲染热销商品（style-b `.p-card` 结构）；同时导出全站共用函数：`openContactModal()` / `closeContactModal()` / `triggerQrAnimation()`、汉堡菜单、平滑滚动 |
| `products-data.js` | 商品数据统一读入口：合并 `data.js`（列表/分类）与 `products.json`（详情）为 `window.productsDataReady`；列表字段以 data.js 为权威，详情侧只并入 subtitle/features/specs。全站唯一运行时 fetch（`cache: 'no-cache'`） |
| `loading.css` + `loading.js` | 所有页面共用的加载遮罩：JS 动态插入遮罩，`load` 事件后淡出，3 秒兜底强制显示；并配合 `body.loaded` 触发入场动画（兼容 bfcache 返回缓存） |
| `products.css` | 列表页专属样式 |
| `recommend.js` / `recommend.css` | 详情页推荐轮播（商品数组由调用方传入） |
| `scripts/validate-products.mjs` | 数据一致性校验：id 集合（缺详情/孤儿/重复）、category 对齐与合法性、name/image 漂移、分类树 parent 引用、方案 A 迁移就绪度；只提示不报错 |

页面间依赖关系：列表页和详情页都同时引入根目录 `script.js`（弹窗等共用功能）+ `products-data.js`（数据）+ 自己的页面脚本。

---

## 五、图片资源约定

- `images/`：手工维护的站点图（logo、二维码、轮播图、占位图）。
- `products/product_images/`、`products/product_details/product_images/`、`product_images/uploaded/`：CMS 上传的商品图，文件名为时间戳（如 `img_1773138956328.jpg`）。
- ⚠️ `data.js` 中图片路径混用了两种写法：
  - 绝对路径：`/products/product_details/product_images/fridge/xxx.jpg`
  - 相对路径：`../images/xxx.jpg`
  
  绝对路径只在域名根目录部署时有效，本地以子路径预览或迁移目录时会失效，建议统一。

---

## 六、本地开发与预览

```bash
# 必须通过 HTTP 服务器访问（products-data.js 用 fetch 读取 products.json，
# 直接双击打开 file:// 协议会因 CORS 失败）
python -m http.server 8000
# 或
npx serve .

# 浏览器访问
http://localhost:8000                          # 首页
http://localhost:8000/products/index.html      # 产品列表
http://localhost:8000/products/product_details/product.html?id=fridge-b2000   # 详情页
```

无任何构建、安装步骤；改动后刷新即生效，推送 `main` 后 GitHub Pages 自动发布。

---

## 七、SEO 相关文件

| 文件 | 用途 |
|------|------|
| `CNAME` | 绑定自定义域名 kfcatering.com |
| `sitemap.xml` | 站点地图（首页 / 产品列表页 / B-2000 静态落地页，共 3 条 URL） |
| `BingSiteAuth.xml` | 必应站长验证 |
| `google201797c36afd36c4.html` | Google 站长验证 |
| JSON-LD（`index.html` 内） | Organization 结构化数据，含社交主页与联系方式 |
| `products/fridge-b2000.html` 等 | 核心商品的静态 SEO 落地页 |

---

## 八、已知注意事项

1. **列表与详情数据不同步**：`data.js` 中有 17 个商品，但 `products.json` 目前只有 1 个（fridge-b2000）。其余商品在列表页可见，点进详情会跳 404（当前为临时测试数据，正式录入时补齐）。`scripts/validate-products.mjs` 会在 CI 里持续提示两侧差异。
2. **`data.js` 首个商品名称带中文前缀**：`"冰箱Commercial Double Door Fridge B-2000"`，疑似 CMS 编辑时误留，英文站上会直接展示（校验脚本会以 INFO 提示两侧 name 不一致）。
3. **图片路径绝对/相对混用**（见第五节）。
4. 商品占位图大量复用同一张 `photo-冰箱.jpg`，正式推广前建议逐个替换为真实产品图。
5. 数据文件格式由 CMS 决定：`data.js` / `products.json` 的结构与字段名改动需与 CMS 工具同步，前端合并逻辑集中在 `products-data.js`，迁移单一数据源（方案 A/B）也只改这一个文件。
