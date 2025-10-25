// products/products.js

// ===== 商品数据 =====


// ===== DOM 元素 =====

let currentCategory = 'all';
let searchTerm = '';

// ===== 渲染分类列表 =====
function renderCategories() {
    categoryList.innerHTML = CATEGORIES.map(cat => 
        `<li><a href="#" data-id="${cat.id}" class="${cat.id === currentCategory ? 'active' : ''}">${cat.name}</a></li>`
    ).join('');
    
    // 绑定点击事件
    categoryList.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            currentCategory = link.dataset.id;
            renderCategories(); // 更新 active 状态
            renderProducts();
        });
    });
}

// ===== 渲染商品列表 =====
function renderProducts() {
    const productGrid = document.getElementById('productGrid');
    const titleElement = document.getElementById('productsTitle');
    
    const filtered = PRODUCTS.filter(product => {
        const matchesCategory = currentCategory === 'all' || product.category === currentCategory;
        const matchesSearch = product.name.toLowerCase().includes(searchTerm) || 
                              product.description.toLowerCase().includes(searchTerm);
        return matchesCategory && matchesSearch;
    });

            // === 动态更新标题 ===
    // if (titleElement) {
    //     const currentCat = CATEGORIES.find(cat => cat.id === currentCategory);
    //     const title = currentCat ? currentCat.name : 'All Products';
    //     titleElement.textContent = title;
    // }
        if (titleElement) {
    const currentCat = CATEGORIES.find(cat => cat.id === currentCategory);
    let title;
    if (currentCategory === 'all') {
        title = 'All Products'; // 保持原样，不拼接
    } else {
        title = currentCat ? currentCat.name + ' Products' : 'All Products';
    }
    titleElement.textContent = title;
    document.title = `${title} | Guangzhou Kingfood Catering Equipment`;
}

    // 清空容器
    productGrid.innerHTML = '';

    if (filtered.length === 0) {
        productGrid.innerHTML = '<p style="grid-column:1/-1; text-align:center; color:#888;">No products found.</p>';
        return;
    }

    // 生成 HTML 字符串（不带动画类）
    const htmlString = filtered.map(product => `
        <a href="product_details/${product.id}.html" class="product-card-link">
            <div class="product-card">
                <img src="${product.image}" alt="${product.name}">
                <h3>${product.name}</h3>
                <p>${product.description}</p>
            </div>
        </a>
    `).join('');

    // 插入 DOM
    productGrid.innerHTML = htmlString;

    // 等下一帧，触发动画
    requestAnimationFrame(() => {
        const cards = productGrid.querySelectorAll('.product-card');
        cards.forEach(card => {
            card.classList.add('animate-in');
        });
    });
}

// ===== 初始化 =====
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const categoryList = document.getElementById('categoryList');

        // 安全检查
    if (!categoryList) {
        console.error('Element #categoryList not found.');
        return;
    }
    
    renderCategories();
    renderProducts();

    searchInput.addEventListener('input', () => {
        searchTerm = searchInput.value.trim().toLowerCase();
        renderProducts();
    });

    
});

// 等待页面资源加载完成后触发动画
window.addEventListener('load', () => {
  document.body.classList.add('loaded');
});
