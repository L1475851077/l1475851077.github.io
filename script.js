// ===== 页面动画初始化（支持返回缓存）=====
function initPageAnimation() {
    if (!document.body.classList.contains('loaded')) {
        document.body.classList.add('loaded');
    }
}

// 首次加载：等所有资源（图片等）加载完再触发动画
window.addEventListener('load', initPageAnimation);

// 从浏览器后退/前进缓存（bfcache）恢复时重新触发动画
window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
        // 页面来自缓存，强制重置动画状态
        document.body.classList.remove('loaded');
        // 稍等一帧，重新添加 loaded 触发动画
        requestAnimationFrame(initPageAnimation);
    }
});


// ===== 全局商品数据（与 products/products.js 保持一致）=====
const allProducts = [
  {
    id: 'fridge-b2000',
    name: 'Commercial Double Door Fridge B-2000',
    description: '304 Stainless Steel · Energy Saving · 3-Year Warranty',
    image: 'images/photo-冰箱.jpg'
  },
  {
    id: 'oven-o300',
    name: '3-Layer Electric Oven O-300',
    description: 'Precise Temperature · Independent Control · For Bakeries',
    image: 'images/photo-冰箱.jpg'
  },
  {
    id: 'worktable-w500',
    name: 'Stainless Steel Worktable W-500',
    description: 'Thick Surface · Anti-Slip · Multi-Functional Rack',
    image: 'images/photo-冰箱.jpg'
  },
  {
    id: 'dishwasher-d800',
    name: 'Commercial Dishwasher D-800',
    description: 'High-Temp Sanitize · Fast Wash · Water Saving',
    image: 'images/photo-冰箱.jpg'
  },
  {
    id: 'cabinet-s100',
    name: 'Heated Display Cabinet S-100',
    description: 'Double Glass · Constant Temp · For Dessert Shops',
    image: 'images/photo-冰箱.jpg'
  },
  {
    id: 'workstation-c600',
    name: 'Modular Workstation C-600',
    description: 'Flexible Design · Space Saving · Customizable',
    image: 'images/photo-冰箱.jpg'
  }
];

// ===== 配置哪些是热销品（只需改这里！）=====
const hotProductIds = ['fridge-b2000', 'oven-o300','worktable-w500','dishwasher-d800','cabinet-s100','workstation-c600',];

// 打开联系弹窗
function openContactModal() {
  //修复弹窗被动画遮挡
    // document.body.style.transition = 'none';
    // document.body.style.opacity = '1';
    // document.body.style.transform = 'none';
  //打开弹窗
    document.getElementById('contactModal').style.display = 'block';
};

// 关闭联系弹窗
function closeContactModal() {
    document.getElementById('contactModal').style.display = 'none';
};

// ===== 渲染首页 Hot Products =====
function renderHotProducts() {
  const container = document.getElementById('hotProductsGrid');
  if (!container) return;

  const hotProducts = allProducts.filter(p => hotProductIds.includes(p.id));
  container.innerHTML = hotProducts.map(product => `
    <a href="products/${product.id}.html" class="product-link">
      <div class="product-card">
        <img src="${product.image}" alt="${product.name}">
        <h3>${product.name}</h3>
        <p>${product.description}</p>
      </div>
    </a>
  `).join('');
}

// ===== 页面加载完成后初始化 =====
document.addEventListener('DOMContentLoaded', () => {
  renderHotProducts();

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

// ===== 平滑滚动（保留原有功能）=====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    if (this.pathname === window.location.pathname) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
      }
    }
  });
});

