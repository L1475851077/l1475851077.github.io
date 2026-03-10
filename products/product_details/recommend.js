// products/recommend.js
// 依赖：全局变量 window.PRODUCTS（来自 data.js）

let currentRecommendPage = 0;
const RECOMMEND_PAGE_SIZE = 3; // 每页固定 3 个卡片

let sameCategoryItems = []; // 当前分类下的其他商品
let otherCategoryItems = []; // 其他分类的商品
let currentMode = 'same'; // 'same' 或 'other'

// --- 不再需要 hasUserNavigated 或 hasUserLeftInitialPage 标志 ---
// --- 结束移除 ---

/**
 * 初始化推荐数据（分离同类目与异类目）
 */
function initRecommendData(currentId, currentCategory) {
  if (typeof PRODUCTS === 'undefined' || !Array.isArray(PRODUCTS)) {
    console.warn('⚠️ window.PRODUCTS not loaded. Check data.js.');
    return;
  }

  const shuffle = arr => [...arr].sort(() => Math.random() - 0.5);

  // 同类目（排除当前商品）
  sameCategoryItems = PRODUCTS.filter(p =>
    p.category === currentCategory && p.id !== currentId
  );

  // 其他分类（排除当前商品）
  otherCategoryItems = PRODUCTS.filter(p =>
    p.category !== currentCategory && p.id !== currentId
  );

  // 打乱顺序
  sameCategoryItems = shuffle(sameCategoryItems);
  otherCategoryItems = shuffle(otherCategoryItems);
}

/**
 * 获取当前模式下的商品池
 */
function getCurrentPool() {
  return currentMode === 'same' ? sameCategoryItems : otherCategoryItems;
}

/**
 * 渲染当前页（循环填充，确保每页 3 个）
 */
function renderRecommendPage(pageIndex = 0) {
  const pool = getCurrentPool();
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
    <a href="./product.html?id=${p.id}">
      <img src="../${p.image}" alt="${p.name}" loading="lazy">
      <h3>${p.name}</h3>
      <p>${p.description || ''}</p>
    </a>
  </div>
`).join('');
}

/**
 * 切换到全站推荐模式
 */
function switchToOtherCategory() {
  if (currentMode === 'same' && otherCategoryItems.length > 0) {
    currentMode = 'other';
    currentRecommendPage = 0; // 切换模式后重置页码
    // 不需要导航标志了
    renderRecommendPage(0);
    console.log('🔄 Switched to other-category recommendations');
  }
}

/**
 * 重新随机化当前模式下的商品池
 */
function shuffleCurrentPool() {
    const pool = getCurrentPool();
    // 使用 Fisher-Yates 洗牌算法进行更可靠的随机打乱
    for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    // 重置页码，因为商品池已随机化
    currentRecommendPage = 0;
    // 不需要导航标志了
    console.log(`🔄 Shuffled ${currentMode} category pool.`);
    renderRecommendPage(0); // 重新渲染第一页
}


/**
 * 初始化推荐轮播
 */
function initRecommendCarousel(currentId, currentCategory) {
  initRecommendData(currentId, currentCategory);
  currentRecommendPage = 0;

  // 默认使用同类目
  currentMode = 'same';
  // 不需要导航标志了

  // 如果同类目为空，直接切全站
  if (sameCategoryItems.length === 0) {
    switchToOtherCategory();
  } else {
    renderRecommendPage(0);
  }

  // 绑定按钮事件
  const prevBtn = document.querySelector('.carousel-btn.prev');
  const nextBtn = document.querySelector('.carousel-btn.next');

  // --- 修改 handlePrev ---
  const handlePrev = (e) => {
    e.preventDefault();
    // --- 核心逻辑：如果当前页是第0页，点击左键就刷新 ---
    if (currentRecommendPage === 0) {
        console.log('🔄 Left button pressed on initial page (or back to it), shuffling pool.');
        shuffleCurrentPool(); // 调用随机刷新函数
    } else {
        // 否则，正常返回上一页
        currentRecommendPage--;
        renderRecommendPage(currentRecommendPage);
    }
    // --- 结束修改 ---
  };
  // --- 结束修改 ---

  // --- 修改 handleNext ---
  const handleNext = (e) => {
    e.preventDefault();
    const currentPool = getCurrentPool();

    // 如果当前模式下商品数 <= 每页数（无法提供新内容），尝试切换模式
    if (currentPool.length <= RECOMMEND_PAGE_SIZE && currentMode === 'same') {
      switchToOtherCategory();
    } else {
      // 在增加页码之前，确保当前页不是最后一页（虽然循环填充会重复，但逻辑上是前进）
      // 直接增加页码即可
      currentRecommendPage++;
      renderRecommendPage(currentRecommendPage);
    }
  };
  // --- 结束修改 ---

  // 防止重复绑定
  prevBtn?.removeEventListener('click', handlePrev);
  nextBtn?.removeEventListener('click', handleNext);
  prevBtn?.addEventListener('click', handlePrev);
  nextBtn?.addEventListener('click', handleNext);
}

// 对外暴露初始化函数
window.initRecommendCarousel = initRecommendCarousel;
