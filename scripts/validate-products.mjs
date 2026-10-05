#!/usr/bin/env node
// 商品数据一致性校验：对比 data.js（列表/分类）与 products/product_details/products.json（详情）。
// 按优化计划（方案 C）定位为"纯提示不报错"：数据类问题只输出 WARN/INFO，进程以 0 退出，
// 不阻断 GitHub Pages 部署；仅当文件本身解析失败（会直接打挂线上页面）才以 1 退出。
// 本地运行：node scripts/validate-products.mjs
import { readFileSync, appendFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const warns = [];
const infos = [];
let fatal = '';

// data.js 是无模块语法的全局 <script>（var CATEGORIES / var PRODUCTS），用 Function 求值取出数组
let categories = [];
let list = [];
try {
    const src = readFileSync(join(root, 'products', 'data.js'), 'utf8');
    const expose = new Function(
        src +
        ';return { CATEGORIES: typeof CATEGORIES === "undefined" ? [] : CATEGORIES,' +
        ' PRODUCTS: typeof PRODUCTS === "undefined" ? [] : PRODUCTS };'
    );
    ({ CATEGORIES: categories, PRODUCTS: list } = expose());
} catch (e) {
    fatal = `products/data.js 解析失败：${e.message}`;
}

let details = [];
if (!fatal) {
    try {
        const parsed = JSON.parse(readFileSync(join(root, 'products', 'product_details', 'products.json'), 'utf8'));
        if (!Array.isArray(parsed)) throw new Error('顶层必须是数组（CMS detail 导出格式）');
        details = parsed;
    } catch (e) {
        fatal = `products/product_details/products.json 解析失败：${e.message}`;
    }
}

if (fatal) {
    console.error('❌ ' + fatal);
    process.exit(1);
}

// --- 重复 id ---
const listIds = new Set();
for (const p of list) {
    if (!p || !p.id) { warns.push('data.js 存在缺 id 的商品条目'); continue; }
    if (listIds.has(p.id)) warns.push(`data.js 商品 id 重复：${p.id}`);
    listIds.add(p.id);
}
const detailById = new Map();
for (const d of details) {
    if (!d || !d.id) { warns.push('products.json 存在缺 id 的详情条目'); continue; }
    if (detailById.has(d.id)) warns.push(`products.json 详情 id 重复：${d.id}`);
    detailById.set(d.id, d);
}

// --- 分类树完整性（子分类手风琴/子树过滤/兄弟分类推荐都依赖 parent 引用） ---
const catIds = new Set(categories.map(c => c && c.id).filter(Boolean));
for (const c of categories) {
    if (c && c.parent && !catIds.has(c.parent)) {
        warns.push(`分类 "${c.id}" 的 parent "${c.parent}" 在 CATEGORIES 中不存在`);
    }
}

// --- category 对齐与合法性（历史 bug：detail 侧写 fridges，同类推荐静默变空） ---
for (const [id, d] of detailById) {
    const lp = list.find(p => p && p.id === id);
    if (!lp) {
        warns.push(`products.json 有详情但 data.js 无此商品（列表/推荐看不到它）：${id}`);
        continue;
    }
    if (d.category && lp.category && d.category !== lp.category) {
        warns.push(`category 两侧不一致：${id}  data.js="${lp.category}" vs products.json="${d.category}"`);
    }
}
for (const p of list) {
    if (p && p.category && !catIds.has(p.category)) {
        warns.push(`data.js 商品 "${p.id}" 的 category "${p.category}" 不在 CATEGORIES 中`);
    }
}
for (const [id, d] of detailById) {
    if (d.category && !catIds.has(d.category)) {
        warns.push(`products.json 商品 "${id}" 的 category "${d.category}" 不在 CATEGORIES 中`);
    }
}

// --- 展示字段漂移（以 data.js 为准渲染，这里提示两侧口径差异） ---
for (const [id, d] of detailById) {
    const lp = list.find(p => p && p.id === id);
    if (!lp) continue;
    if (lp.name !== d.name) infos.push(`name 两侧不一致：${id}  data.js="${lp.name}" vs products.json="${d.name}"`);
    if (lp.image !== d.image) infos.push(`image 两侧不一致：${id}  data.js="${lp.image}" vs products.json="${d.image}"`);
}

// --- 缺详情（详情页会 404；正式数据录入时逐条补齐） ---
const missingDetails = [...listIds].filter(id => !detailById.has(id));
if (missingDetails.length) {
    infos.push(`缺详情 ${missingDetails.length} 个（详情页会 404）：${missingDetails.join(', ')}`);
}

// --- 迁移就绪度（方案 A 前置：CMS detail 配置需补 isHot/description） ---
const notReady = details.filter(d => !('isHot' in d) || !('description' in d)).length;
if (notReady) {
    infos.push(`${notReady}/${details.length} 条详情缺 isHot/description 字段（迁移 products.json 单一数据源前需在 CMS detail 配置补齐）`);
}

// --- 输出 ---
const lines = [];
if (warns.length) {
    lines.push(`⚠️ WARN（${warns.length}）`);
    warns.forEach(w => lines.push('  ' + w));
}
if (infos.length) {
    lines.push(`ℹ️ INFO（${infos.length}）`);
    infos.forEach(i => lines.push('  ' + i));
}
if (!warns.length && !infos.length) {
    lines.push('✅ data.js 与 products.json 一致，无待处理项');
}
const summary = `商品数据校验：data.js ${list.length} 个商品 / ${categories.length} 个分类，products.json ${details.length} 条详情\n` + lines.join('\n');
console.log(summary);

// CI 下写入 Step Summary 便于在 Actions 页面直接查看
if (process.env.GITHUB_STEP_SUMMARY) {
    const md = ['### 商品数据校验', '', `- data.js：${list.length} 个商品 / ${categories.length} 个分类`, `- products.json：${details.length} 条详情`, ''];
    const esc = s => s.replace(/</g, '&lt;');
    if (warns.length) md.push(`**⚠️ WARN（${warns.length}）**`, '', ...warns.map(w => '- ' + esc(w)), '');
    if (infos.length) md.push(`**ℹ️ INFO（${infos.length}）**`, '', ...infos.map(i => '- ' + esc(i)), '');
    if (!warns.length && !infos.length) md.push('✅ 两侧数据一致，无待处理项');
    try { appendFileSync(process.env.GITHUB_STEP_SUMMARY, md.join('\n') + '\n'); } catch { /* 忽略 */ }
}

process.exit(0);
