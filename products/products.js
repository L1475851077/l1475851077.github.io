// products/products.js

// ===== 商品字段转义 =====
// 数据来自 CMS，拼进 innerHTML 前统一转义，防止内容含 <>/&"' 时破坏页面结构
function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, ch => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[ch]));
}

// ===== 分页配置 =====
const ITEMS_PER_PAGE = 12; // 每页显示商品数量，可按需调整
let currentPage = 1;

// ===== 全局状态 =====
let currentCategory = 'all';
let searchTerm = '';
// 手风琴状态：子分类面板已展开的大分类 id 集合
const expandedCategories = new Set();

// ===== 两级分类工具 =====
// 大分类（含 all 伪分类；有 parent 字段的视为子分类）
function parentCategories() {
    return CATEGORIES.filter(cat => !cat.parent);
}

// 某大分类下的直属子分类
function childCategories(parentId) {
    return CATEGORIES.filter(cat => cat.parent === parentId);
}

// 分类 id → 自身 + 全部子孙 id 集合。选中大分类时命中整个子树，
// 这样挂在子分类上和仍挂在大分类上的商品都能被一起筛出
function categorySubtree(id) {
    const ids = new Set([id]);
    let grew = true;
    while (grew) {
        grew = false;
        CATEGORIES.forEach(cat => {
            if (cat.parent && ids.has(cat.parent) && !ids.has(cat.id)) {
                ids.add(cat.id);
                grew = true;
            }
        });
    }
    return ids;
}

// 分类 id → 全链展示名（子分类显示 "大分类 · 子分类"）
function categoryChainName(id) {
    const cat = CATEGORIES.find(c => c.id === id);
    if (!cat) return '';
    const parent = cat.parent ? CATEGORIES.find(c => c.id === cat.parent) : null;
    return parent ? parent.name + ' · ' + cat.name : cat.name;
}

// ===== 渲染分类列表（两级手风琴） =====
function renderCategories() {
    const categoryList = document.getElementById('categoryList');
    if (!categoryList) return;

    categoryList.innerHTML = parentCategories().map(cat => {
        const children = childCategories(cat.id);
        const expanded = children.length > 0 && expandedCategories.has(cat.id);
        return `
            <li class="cat-group${expanded ? ' expanded' : ''}">
                <div class="cat-row">
                    <a href="#" data-id="${escapeHtml(cat.id)}" class="${cat.id === currentCategory ? 'active' : ''}">${escapeHtml(cat.name)}</a>
                    ${children.length ? `
                    <button type="button" class="cat-toggle" data-toggle="${escapeHtml(cat.id)}" aria-expanded="${expanded}" aria-label="Toggle ${escapeHtml(cat.name)} subcategories">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>
                    </button>` : ''}
                </div>
                ${children.length ? `
                <div class="sub-wrap">
                    <ul class="sub-list">
                        ${children.map(child => `
                        <li><a href="#" data-id="${escapeHtml(child.id)}" class="${child.id === currentCategory ? 'active' : ''}">${escapeHtml(child.name)}</a></li>`).join('')}
                    </ul>
                </div>` : ''}
            </li>
        `;
    }).join('');
}

// 原地同步分类区的展开态与高亮（不重建 DOM，sub-wrap 的 CSS 高度过渡才能生效）
function syncCategoryListState() {
    const categoryList = document.getElementById('categoryList');
    if (!categoryList) return;
    categoryList.querySelectorAll('.cat-group').forEach(li => {
        const toggle = li.querySelector('.cat-toggle');
        const expanded = !!toggle && expandedCategories.has(toggle.dataset.toggle);
        li.classList.toggle('expanded', expanded);
        if (toggle) toggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    });
    categoryList.querySelectorAll('a[data-id]').forEach(a => {
        a.classList.toggle('active', a.dataset.id === currentCategory);
    });
}

// ===== 分类选择：重置页码、联动展开面板、同步 URL =====
function selectCategory(id) {
    currentCategory = id;
    currentPage = 1;
    const cat = CATEGORIES.find(c => c.id === id);
    if (cat && cat.parent) {
        expandedCategories.add(cat.parent); // 选中子分类时展开其大分类
    } else if (cat && childCategories(id).length) {
        // 点大分类本身：切换展开/收起（再点一下已展开的就收起）
        if (expandedCategories.has(id)) expandedCategories.delete(id);
        else expandedCategories.add(id);
    }
    syncCategoryUrl();
    syncCategoryListState();
    renderProducts();
}

// 分类状态同步到 URL（?cat=xxx），刷新/分享链接可还原
function syncCategoryUrl() {
    try {
        const url = new URL(location.href);
        if (currentCategory === 'all') url.searchParams.delete('cat');
        else url.searchParams.set('cat', currentCategory);
        history.replaceState(null, '', url.pathname + url.search);
    } catch (e) { /* 非 http(s) 环境忽略 */ }
}

// 从 URL 恢复分类状态（非法值静默回退 all）
function restoreCategoryFromUrl() {
    let catId = null;
    try {
        catId = new URLSearchParams(location.search).get('cat');
    } catch (e) {
        return;
    }
    if (!catId || !CATEGORIES.some(c => c.id === catId)) return;
    currentCategory = catId;
    const cat = CATEGORIES.find(c => c.id === catId);
    if (cat && cat.parent) expandedCategories.add(cat.parent);
    if (childCategories(catId).length) expandedCategories.add(catId);
}

// ===== 渲染分页控件（带 type="button" + 事件委托）=====
function renderPagination(totalPages) {
    const container = document.getElementById('paginationContainer');
    if (totalPages <= 1) {
        if (container) container.innerHTML = '';
        return;
    }

    let buttonsHTML = '';

    // 上一页
    if (currentPage > 1) {
        buttonsHTML += `<button type="button" data-page="${currentPage - 1}" class="pagination-btn">&laquo; Prev</button>`;
    }

    // 页码
    for (let i = 1; i <= totalPages; i++) {
        buttonsHTML += `<button type="button" data-page="${i}" class="pagination-btn ${i === currentPage ? 'active' : ''}">${i}</button>`;
    }

    // 下一页
    if (currentPage < totalPages) {
        buttonsHTML += `<button type="button" data-page="${currentPage + 1}" class="pagination-btn">Next &raquo;</button>`;
    }

    if (container) {
        container.innerHTML = buttonsHTML;

        // 事件委托绑定
        container.querySelectorAll('.pagination-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const page = parseInt(e.target.dataset.page, 10);
                if (!isNaN(page)) {
                    currentPage = page;
                    renderProducts();
                }
            });
        });
    }
}

// ===== 渲染商品列表 =====
function renderProducts() {
    const productGrid = document.getElementById('productGrid');
    const titleElement = document.getElementById('productsTitle');

    // 自动创建分页容器（如果不存在）
    let paginationContainer = document.getElementById('paginationContainer');
    if (!paginationContainer) {
        const scrollArea = document.querySelector('.products-scroll-area');
        if (scrollArea) {
            const pg = document.createElement('div');
            pg.id = 'paginationContainer';
            pg.style.marginTop = '24px';
            pg.style.textAlign = 'center';
            scrollArea.parentNode.insertBefore(pg, scrollArea.nextSibling);
            paginationContainer = pg;
        }
    }

    // 过滤商品（分类子树 + 搜索）
    const subtree = categorySubtree(currentCategory);
    const filtered = PRODUCTS.filter(product => {
        const matchesCategory = currentCategory === 'all' || subtree.has(product.category);
        const matchesSearch = product.name.toLowerCase().includes(searchTerm) || 
                              product.description.toLowerCase().includes(searchTerm);
        return matchesCategory && matchesSearch;
    });

    // 更新标题（子分类显示全链名，如 Fryer Series · CMR Series）
    if (titleElement) {
        const title = currentCategory === 'all' ? 'All Products' : (categoryChainName(currentCategory) || 'All Products');
        titleElement.textContent = title;
        document.title = `${title} | Guangzhou Kingfood Catering Equipment`;
    }

    // 分页计算（使用当前 currentPage，不再强制重置）
    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedItems = filtered.slice(start, start + ITEMS_PER_PAGE);

    // 渲染商品
    productGrid.innerHTML = '';

    if (totalItems === 0) {
        productGrid.innerHTML = '<p style="grid-column:1/-1; text-align:center; color:#888;">No products found.</p>';
        if (paginationContainer) paginationContainer.innerHTML = '';
        return;
    }

    const htmlString = paginatedItems.map(product => `
       <a href="./product_details/product.html?id=${encodeURIComponent(product.id)}" class="product-card-link">
            <div class="product-card">
                <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" loading="lazy">
                <h3>${escapeHtml(product.name)}</h3>
                <p>${escapeHtml(product.description)}</p>
            </div>
        </a>
    `).join('');

    productGrid.innerHTML = htmlString;

    // 触发动画
    requestAnimationFrame(() => {
        const cards = productGrid.querySelectorAll('.product-card');
        cards.forEach(card => {
            card.classList.add('animate-in');
        });
    });

    // 渲染分页控件
    renderPagination(totalPages);
}

// ===== 初始化 =====
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const categoryList = document.getElementById('categoryList');

    if (!categoryList) {
        console.error('Element #categoryList not found.');
        return;
    }

    restoreCategoryFromUrl();
    renderCategories();
    renderProducts();

    // 鼠标按下不转移焦点：面板展开让侧边栏出现滚动后，Chrome 会把焦点元素
    // "显现"回视野并滚动整个页面，表现为上方分类被整体顶走；键盘 Tab 导航不受影响
    categoryList.addEventListener('mousedown', (e) => {
        if (e.target.closest('a[data-id], .cat-toggle')) e.preventDefault();
    });

    // 移动端分类折叠按钮（桌面端按钮隐藏、分类常显）
    const catCollapse = document.getElementById('catCollapse');
    // 选中分类后自动收起移动端面板（.open 只在移动端样式里生效，桌面端无影响）
    const collapseMobilePanel = () => {
        if (!categoryList.classList.contains('open')) return;
        categoryList.classList.remove('open');
        if (catCollapse) catCollapse.setAttribute('aria-expanded', 'false');
    };

    // 分类区点击统一用事件委托（监听器绑一次，状态原地更新以保留 CSS 过渡）
    categoryList.addEventListener('click', (e) => {
        // 箭头按钮：只切换展开/收起，不改选中分类（面板保持打开，便于连续浏览子分类）
        const toggle = e.target.closest('.cat-toggle');
        if (toggle) {
            e.preventDefault();
            const id = toggle.dataset.toggle;
            if (expandedCategories.has(id)) expandedCategories.delete(id);
            else expandedCategories.add(id);
            syncCategoryListState();
            return;
        }
        // 分类链接：大分类/子分类统一走 selectCategory
        const link = e.target.closest('a[data-id]');
        if (!link) return;
        e.preventDefault();
        selectCategory(link.dataset.id);
        collapseMobilePanel();
    });

    if (catCollapse) {
        catCollapse.addEventListener('click', () => {
            const open = categoryList.classList.toggle('open');
            catCollapse.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    // 移动端悬浮搜索/分类栏：量取吸顶页头与栏高写入 CSS 变量，
    // --header-h 供悬浮栏定位，--mobile-bar-h（纯栏高）供主内容避让与面板限高；桌面端清除
    const floatEl = document.querySelector('.sidebar-float');
    const pageHeader = document.querySelector('header');
    const syncMobileBar = () => {
        if (!floatEl) return;
        const root = document.documentElement;
        if (!window.matchMedia('(max-width: 768px)').matches) {
            root.style.removeProperty('--header-h');
            root.style.removeProperty('--mobile-bar-h');
            return;
        }
        const headerH = pageHeader ? pageHeader.offsetHeight : 0;
        root.style.setProperty('--header-h', headerH + 'px');
        root.style.setProperty('--mobile-bar-h', floatEl.offsetHeight + 'px');
    };
    syncMobileBar();
    window.addEventListener('resize', syncMobileBar);
    window.addEventListener('load', syncMobileBar);

    // 搜索输入监听
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            searchTerm = searchInput.value.trim().toLowerCase();
            currentPage = 1; // 搜索时重置页码
            renderProducts();
        });
    }
});

// 页面加载完成后触发动画类（与 loading.js 配合）
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});
