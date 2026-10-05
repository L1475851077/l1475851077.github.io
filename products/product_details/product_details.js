// 商品字段来自 CMS 数据，拼进 innerHTML 前统一转义（与 products/products.js 同款）
function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, ch => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[ch]));
}

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (!productId) {
        // 无 ID，直接跳转到 404
        window.location.href = './404.html';
        return;
    }

    // 统一数据入口：data.js 列表 + products.json 详情合并（根目录 products-data.js）；
    // 该脚本未引入时回退全局变量，行为与旧版一致
    const data = window.productsDataReady
        ? await window.productsDataReady
        : { categories: window.CATEGORIES || [], products: window.PRODUCTS || [], details: [] };

    // 只有详情数据存在的商品才渲染；未填详情的按现状跳 404（正式数据录入时自然解决）
    const detail = data.details.find(d => d.id === productId);
    if (!detail) {
        // 商品不存在或无详情，跳转到 404
        window.location.href = './404.html';
        return;
    }

    // === 商品存在：渲染内容（详情字段以 products.json 记录为准） ===
    document.title = `${detail.name} | Guangzhou Kingfood Catering Equipment`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.content = detail.subtitle || detail.description || '';

    // OG/分享卡片动态更新（head 里有静态兜底，爬虫不执行 JS 时仍可读到默认值）
    const pageTitle = `${detail.name} | Guangzhou Kingfood Catering Equipment`;
    const pageDesc = detail.subtitle || detail.description || '';
    const toAbsolute = (u) => u.startsWith('http') ? u
        : window.location.origin + (u.startsWith('/') ? u : '/' + u);
    const setMeta = (sel, val) => {
        const el = document.querySelector(sel);
        if (el) el.setAttribute('content', val);
    };
    setMeta('meta[property="og:title"]', pageTitle);
    setMeta('meta[property="og:description"]', pageDesc);
    setMeta('meta[property="og:url"]', window.location.href);
    setMeta('meta[property="og:image"]', toAbsolute(detail.image));
    setMeta('meta[name="twitter:title"]', pageTitle);
    setMeta('meta[name="twitter:description"]', pageDesc);
    setMeta('meta[name="twitter:image"]', toAbsolute(detail.image));
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.href = window.location.href;

    document.getElementById('productName').textContent = detail.name;
    document.getElementById('productSubtitle').textContent = detail.subtitle || '';
    const imgEl = document.getElementById('productImage');
    imgEl.src = detail.image;
    imgEl.alt = detail.name;

    const featuresList = document.getElementById('productFeatures');
    if (featuresList) {
        featuresList.innerHTML = '';
        if (Array.isArray(detail.features)) {
            detail.features.forEach(f => {
                const li = document.createElement('li');
                li.textContent = f;
                featuresList.appendChild(li);
            });
        }
    }

    const specsTable = document.getElementById('productSpecs');
    if (specsTable) {
        specsTable.innerHTML = '';
        if (detail.specs && typeof detail.specs === 'object') {
            for (const [key, value] of Object.entries(detail.specs)) {
                const tr = document.createElement('tr');
                tr.innerHTML = `<td>${escapeHtml(key)}</td><td>${escapeHtml(value)}</td>`;
                specsTable.appendChild(tr);
            }
        }
    }

    // 推荐位用合并后的商品数组；当前分类取列表侧（data.js）值——
    // CMS 详情侧 category 一旦漂移（历史上的 fridges/fridge），同类推荐也不会再静默变空
    const merged = data.products.find(p => p.id === productId);
    const recCategory = (merged && merged.category) || detail.category || 'all';
    if (typeof initRecommendCarousel === 'function') {
        initRecommendCarousel(productId, recCategory, data.products);
    }

});

window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});
