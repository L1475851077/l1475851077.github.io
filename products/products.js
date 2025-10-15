// products/products.js

// ===== 商品数据 =====
const categories = [
    { id: 'all', name: 'All Products' },
    { id: 'fridge', name: 'Refrigeration' },
    { id: 'oven', name: 'Ovens' },
    { id: 'worktable', name: 'Worktables & Stations' },
    { id: 'dishwasher', name: 'Dishwashers' },
    { id: 'cabinet', name: 'Display Cabinets' }
];

const products = [
    {
        id: 'fridge-b2000',
        name: 'Commercial Double Door Fridge B-2000',
        description: '304 Stainless Steel · Energy Saving · 3-Year Warranty',
        category: 'fridge',
        image: '../images/photo-冰箱.jpg'
    },
    {
        id: 'oven-o300',
        name: '3-Layer Electric Oven O-300',
        description: 'Precise Temperature · Independent Control · For Bakeries',
        category: 'oven',
        image: '../images/photo-冰箱.jpg'
    },
    {
        id: 'worktable-w500',
        name: 'Stainless Steel Worktable W-500',
        description: 'Thick Surface · Anti-Slip · Multi-Functional Rack',
        category: 'worktable',
        image: '../images/photo-冰箱.jpg'
    },
    {
        id: 'dishwasher-d800',
        name: 'Commercial Dishwasher D-800',
        description: 'High-Temp Sanitize · Fast Wash · Water Saving',
        category: 'dishwasher',
        image: '../images/photo-冰箱.jpg'
    },
    {
        id: 'cabinet-s100',
        name: 'Heated Display Cabinet S-100',
        description: 'Double Glass · Constant Temp · For Dessert Shops',
        category: 'cabinet',
        image: '../images/photo-冰箱.jpg'
    },
    {
        id: 'workstation-c600',
        name: 'Modular Workstation C-600',
        description: 'Flexible Design · Space Saving · Customizable',
        category: 'worktable',
        image: '../images/photo-冰箱.jpg'
    }
];

// ===== DOM 元素 =====
const searchInput = document.getElementById('searchInput');
const categoryList = document.getElementById('categoryList');
const productGrid = document.getElementById('productGrid');

let currentCategory = 'all';
let searchTerm = '';

// ===== 渲染分类列表 =====
function renderCategories() {
    categoryList.innerHTML = categories.map(cat => 
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
// function renderProducts() {
//     const filtered = products.filter(product => {
//         const matchesCategory = currentCategory === 'all' || product.category === currentCategory;
//         const matchesSearch = product.name.toLowerCase().includes(searchTerm) || 
//                               product.description.toLowerCase().includes(searchTerm);
//         return matchesCategory && matchesSearch;
//     });

//     if (filtered.length === 0) {
//         productGrid.innerHTML = '<p style="grid-column:1/-1; text-align:center; color:#888;">No products found.</p>';
//         return;
//     }

//     productGrid.innerHTML = filtered.map(product => `
//         <a href="${product.id}.html" class="product-card-link">
//             <div class="product-card">
//                 <img src="${product.image}" alt="${product.name}">
//                 <h3>${product.name}</h3>
//                 <p>${product.description}</p>
//             </div>
//         </a>
//     `).join('');
// }

function renderProducts() {
    const filtered = products.filter(product => {
        const matchesCategory = currentCategory === 'all' || product.category === currentCategory;
        const matchesSearch = product.name.toLowerCase().includes(searchTerm) || 
                              product.description.toLowerCase().includes(searchTerm);
        return matchesCategory && matchesSearch;
    });

    // 清空容器
    productGrid.innerHTML = '';

    if (filtered.length === 0) {
        productGrid.innerHTML = '<p style="grid-column:1/-1; text-align:center; color:#888;">No products found.</p>';
        return;
    }

    // 生成 HTML 字符串（不带动画类）
    const htmlString = filtered.map(product => `
        <a href="${product.id}.html" class="product-card-link">
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
    renderCategories();
    renderProducts();

    searchInput.addEventListener('input', () => {
        searchTerm = searchInput.value.trim().toLowerCase();
        renderProducts();
    });

  const hamburger = document.getElementById('hamburger');
  const nav = document.getElementById('mainNav');

  if (hamburger && nav) {
    // 切换菜单
    hamburger.addEventListener('click', (e) => {
      e.stopPropagation(); // 防止点击汉堡按钮时触发 document 的点击
      nav.classList.toggle('show');
    });

    // 点击页面其他地方时关闭菜单
    document.addEventListener('click', (e) => {
      if (!nav.contains(e.target) && !hamburger.contains(e.target)) {
        nav.classList.remove('show');
      }
    });
  }
    
});

// 等待页面资源加载完成后触发动画
window.addEventListener('load', () => {
  document.body.classList.add('loaded');
});
