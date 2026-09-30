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

    try {
        const response = await fetch('./products.json');
        if (!response.ok) throw new Error('Failed to load products data');
        const allProducts = await response.json();
        const product = allProducts.find(p => p.id === productId);

        if (!product) {
            // 商品不存在，跳转到 404
            window.location.href = './404.html';
            return;
        }

        // === 商品存在：渲染内容 ===
        document.title = `${product.name} | Guangzhou Kingfood Catering Equipment`;
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.content = product.subtitle || product.description || '';

        // OG/分享卡片动态更新（head 里有静态兜底，爬虫不执行 JS 时仍可读到默认值）
        const pageTitle = `${product.name} | Guangzhou Kingfood Catering Equipment`;
        const pageDesc = product.subtitle || product.description || '';
        const toAbsolute = (u) => u.startsWith('http') ? u
            : window.location.origin + (u.startsWith('/') ? u : '/' + u);
        const setMeta = (sel, val) => {
            const el = document.querySelector(sel);
            if (el) el.setAttribute('content', val);
        };
        setMeta('meta[property="og:title"]', pageTitle);
        setMeta('meta[property="og:description"]', pageDesc);
        setMeta('meta[property="og:url"]', window.location.href);
        setMeta('meta[property="og:image"]', toAbsolute(product.image));
        setMeta('meta[name="twitter:title"]', pageTitle);
        setMeta('meta[name="twitter:description"]', pageDesc);
        setMeta('meta[name="twitter:image"]', toAbsolute(product.image));
        const canonical = document.querySelector('link[rel="canonical"]');
        if (canonical) canonical.href = window.location.href;

        document.getElementById('productName').textContent = product.name;
        document.getElementById('productSubtitle').textContent = product.subtitle || '';
        const imgEl = document.getElementById('productImage');
        imgEl.src = product.image;
        imgEl.alt = product.name;

        const featuresList = document.getElementById('productFeatures');
        if (featuresList) {
            featuresList.innerHTML = '';
            if (Array.isArray(product.features)) {
                product.features.forEach(f => {
                    const li = document.createElement('li');
                    li.textContent = f;
                    featuresList.appendChild(li);
                });
            }
        }

        const specsTable = document.getElementById('productSpecs');
        if (specsTable) {
            specsTable.innerHTML = '';
            if (product.specs && typeof product.specs === 'object') {
                for (const [key, value] of Object.entries(product.specs)) {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `<td>${escapeHtml(key)}</td><td>${escapeHtml(value)}</td>`;
                    specsTable.appendChild(tr);
                }
            }
        }

        if (typeof initRecommendCarousel === 'function') {
            initRecommendCarousel(product.id, product.category || 'all');
        }

    } catch (error) {
        console.error('Error loading product:', error);
        // 加载出错也跳转到 404（或可选 error.html，但你只要 404）
        window.location.href = './404.html';
    }
});

window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});
