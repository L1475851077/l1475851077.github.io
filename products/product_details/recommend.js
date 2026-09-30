// products/recommend.js
// 依赖：全局变量 window.PRODUCTS（来自 data.js）

// data.js 的 image 有三种历史形态："/products/..."（根绝对）、
// "../images/..."（相对列表页）、裸 "images/..."；统一归一为站点根绝对路径
function normalizeImgSrc(img) {
  if (!img) return '';
  if (img.startsWith('/')) return img;
  if (img.startsWith('../')) return '/' + img.slice(3);
  return '/' + img;
}

// 商品字段来自 CMS 数据，拼进 innerHTML 前统一转义（与 products.js 同款）
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, ch => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[ch]));
}

let currentRecommendPage = 0;
// 每页固定 3 张；窄屏靠 CSS 收缩卡片宽度（.recommend-card: flex-shrink）来容纳
const RECOMMEND_PAGE_SIZE = 3;

let sameCategoryItems = []; // 当前分类下的其他商品
let otherCategoryItems = []; // 其他分类的商品
let recommendPool = []; // 统一商品池：同类在前、其他分类在后；翻页像数组一样循环，末页之后绕回开头的同类

// --- 不再需要 hasUserNavigated 或 hasUserLeftInitialPage 标志 ---
// --- 结束移除 ---

/**
 * 初始化推荐数据（分离同类目与异类目）
 */
function initRecommendData(currentId, currentCategory) {
  if (!window.PRODUCTS || !Array.isArray(window.PRODUCTS)) {
    console.warn('⚠️ window.PRODUCTS not loaded. Check data.js.');
    return;
  }

  const shuffle = arr => [...arr].sort(() => Math.random() - 0.5);

  // 同类目（排除当前商品）
  sameCategoryItems = window.PRODUCTS.filter(p =>
    p.category === currentCategory && p.id !== currentId
  );

  // 其他分类（排除当前商品）
  otherCategoryItems = window.PRODUCTS.filter(p =>
    p.category !== currentCategory && p.id !== currentId
  );

  // 打乱顺序
  sameCategoryItems = shuffle(sameCategoryItems);
  otherCategoryItems = shuffle(otherCategoryItems);
}

/**
 * 构建统一商品池：同类在前、其他分类在后（推荐规则：优先同类；
 * 同类不足一页时首页自然由其他分类补满，同类为 0 时即纯其他分类）。
 * 翻页在此数组上循环：翻过最后一个商品后回到数组开头（同类）
 */
function buildRecommendPool() {
  recommendPool = sameCategoryItems.concat(otherCategoryItems);
  return recommendPool;
}

/**
 * 渲染当前页（循环填充，确保每页 3 个）
 */
function renderRecommendPage(pageIndex = 0) {
  const pool = recommendPool;
  const total = pool.length;

  const grid = document.getElementById('relatedProductGrid');
  if (!grid) {
    console.error('❌ #relatedProductGrid not found');
    return;
  }

  // 无商品时显示提示
  if (total === 0) {
    grid.innerHTML = '<div class="recommend-card" style="padding:20px; text-align:center; color:#999;">No recommendations</div>';
    return;
  }

  // 循环填充：每页固定 RECOMMEND_PAGE_SIZE 个
  const pageItems = [];
  const startIndex = pageIndex * RECOMMEND_PAGE_SIZE;
  for (let i = 0; i < RECOMMEND_PAGE_SIZE; i++) {
    const realIndex = (startIndex + i) % total;
    pageItems.push(pool[realIndex]);
  }

  grid.innerHTML = pageItems.map(p => `
  <div class="recommend-card">
    <a href="./product.html?id=${encodeURIComponent(p.id)}">
      <img src="${escapeHtml(normalizeImgSrc(p.image))}" alt="${escapeHtml(p.name)}" loading="lazy">
      <h3>${escapeHtml(p.name)}</h3>
      <p>${escapeHtml(p.description || '')}</p>
    </a>
  </div>
`).join('');
}

/**
 * 初始化推荐轮播
 */
function initRecommendCarousel(currentId, currentCategory) {
  initRecommendData(currentId, currentCategory);
  currentRecommendPage = 0;

  // 统一池：同类在前、其他分类在后，左右翻页循环（末页之后回到开头的同类）
  buildRecommendPool();
  renderRecommendPage(0);

  // 绑定按钮事件
  const prevBtn = document.querySelector('.carousel-btn.prev');
  const nextBtn = document.querySelector('.carousel-btn.next');

  const totalPages = () => Math.ceil(recommendPool.length / RECOMMEND_PAGE_SIZE);

  // 左右键：像数组一样循环翻页——首页往前翻到最后一页，末页往后翻绕回同类开头的首页
  const handlePrev = (e) => {
    e.preventDefault();
    const pages = totalPages();
    if (!pages) return;
    currentRecommendPage = (currentRecommendPage - 1 + pages) % pages;
    renderRecommendPage(currentRecommendPage);
  };

  const handleNext = (e) => {
    e.preventDefault();
    const pages = totalPages();
    if (!pages) return;
    currentRecommendPage = (currentRecommendPage + 1) % pages;
    renderRecommendPage(currentRecommendPage);
  };

  // 防止重复绑定
  prevBtn?.removeEventListener('click', handlePrev);
  nextBtn?.removeEventListener('click', handleNext);
  prevBtn?.addEventListener('click', handlePrev);
  nextBtn?.addEventListener('click', handleNext);
}

// 对外暴露初始化函数
window.initRecommendCarousel = initRecommendCarousel;
