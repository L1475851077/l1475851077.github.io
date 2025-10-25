// products/products.js

// ===== 分页配置 =====
const ITEMS_PER_PAGE = 12; // 每页显示商品数量，可按需调整
let currentPage = 1;

// ===== 全局状态 =====
let currentCategory = 'all';
let searchTerm = '';

// ===== 渲染分类列表 =====
function renderCategories() {
    const categoryList = document.getElementById('categoryList');
    if (!categoryList) return;

    categoryList.innerHTML = CATEGORIES.map(cat => 
        `<li><a href="#" data-id="${cat.id}" class="${cat.id === currentCategory ? 'active' : ''}">${cat.name}</a></li>`
    ).join('');
    
    // 绑定分类点击事件
    categoryList.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            currentCategory = link.dataset.id;
            currentPage = 1; // 切换分类时重置页码
            renderCategories();
            renderProducts();
        });
    });
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

    // 过滤商品（分类 + 搜索）
    const filtered = PRODUCTS.filter(product => {
        const matchesCategory = currentCategory === 'all' || product.category === currentCategory;
        const matchesSearch = product.name.toLowerCase().includes(searchTerm) || 
                              product.description.toLowerCase().includes(searchTerm);
        return matchesCategory && matchesSearch;
    });

    // 更新标题
    if (titleElement) {
        const currentCat = CATEGORIES.find(cat => cat.id === currentCategory);
        let title;
        if (currentCategory === 'all') {
            title = 'All Products';
        } else {
            title = currentCat ? currentCat.name + ' Products' : 'All Products';
        }
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
        <a href="product_details/${product.id}.html" class="product-card-link">
            <div class="product-card">
                <img src="${product.image}" alt="${product.name}">
                <h3>${product.name}</h3>
                <p>${product.description}</p>
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

    renderCategories();
    renderProducts();

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
