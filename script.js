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

// ===== WhatsApp 直发询盘（主 CTA，邮件表单走 Formspree 兜底）=====
function sendViaWhatsApp() {
  const name = document.getElementById('inqName');
  const message = document.getElementById('inqMessage');
  const phone = document.getElementById('inqPhone');
  const email = document.getElementById('inqEmail');

  let valid = true;
  [name, message].forEach(field => {
    if (field && !field.value.trim()) {
      field.classList.add('field-error');
      if (valid) field.focus();
      valid = false;
    }
  });
  if (!valid) return;

  const lines = [
    'Hello Kingfood!',
    '',
    'Name: ' + name.value.trim(),
    'Message: ' + message.value.trim()
  ];
  if (phone && phone.value.trim()) lines.push('My WhatsApp: ' + phone.value.trim());
  if (email && email.value.trim()) lines.push('My Email: ' + email.value.trim());

  window.open('https://wa.me/8619927525746?text=' + encodeURIComponent(lines.join('\n')), '_blank', 'noopener');
}

// 输入时清除校验高亮（事件委托，只绑定一次）
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('inquiryForm');
  if (form) {
    form.addEventListener('input', (e) => {
      if (e.target.classList) e.target.classList.remove('field-error');
    });
  }
});

// 首页热销卡片数据源：products/data.js 暴露的全局 PRODUCTS
const allProducts = typeof PRODUCTS !== 'undefined' ? PRODUCTS : [];

// 商品字段来自 CMS 数据，拼进 innerHTML 前统一转义（与 products/products.js 同款）
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, ch => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[ch]));
}

// ✅ 修改：更新渲染函数里的过滤条件
// 分类 id → 展示名（data.js 的 CATEGORIES；子分类显示全链 "大分类 · 子分类"）
function categoryName(id) {
  const cats = typeof CATEGORIES !== 'undefined' ? CATEGORIES : [];
  const hit = cats.find(c => c.id === id);
  if (!hit) return '';
  const parent = hit.parent ? cats.find(c => c.id === hit.parent) : null;
  return parent ? parent.name + ' · ' + hit.name : hit.name;
}

function renderHotProducts() {
  const container = document.getElementById('hotProductsGrid');
  if (!container) return;

  // 把 filter 里的 ID 判断改为 isHot 判断
  const hotProducts = allProducts.filter(p => p.isHot === true);

  container.innerHTML = hotProducts.map(product => `
    <a href="./products/product_details/product.html?id=${encodeURIComponent(product.id)}" class="p-card">
      <div class="p-media">
        <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" loading="lazy">
      </div>
      <span class="p-cat">${escapeHtml(categoryName(product.category))}</span>
      <h3>${escapeHtml(product.name)}</h3>
      <p>${escapeHtml(product.description || '')}</p>
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


// 轮播图已随 Style B 改版移除（首屏改为静态 Hero + 数据条）


// ===== 首页动效：滚动进场 + 数据条数字滚动 + 页头滚动阴影 =====
(function () {
  // 尽早标记 JS 可用：进场前的隐藏态（.anim-ready [data-reveal]）只在脚本正常运行时生效
  document.documentElement.classList.add('anim-ready');

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // -- 滚动进场：[data-reveal] 进入视口后加 .revealed --
  // 上滚联动：元素完全离开视口后撤下 .revealed，再次滚入时重新播放级联
  var revealEls = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));
  if (reducedMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('revealed'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.intersectionRatio >= 0.12) {
          entry.target.classList.add('revealed');
        } else if (entry.intersectionRatio === 0) {
          // 比例归 0（完全离开视口）才重置：中间比例保持现状，避免临界抖动
          entry.target.classList.remove('revealed');
        }
      });
    }, { threshold: [0, 0.12], rootMargin: '0px 0px -6% 0px' });
    revealEls.forEach(function (el) { void el.offsetWidth; });
    revealEls.forEach(function (el) { io.observe(el); });
    // 兜底：页面在后台/被节流加载时，渲染帧被暂停、IO 回调与 CSS 过渡都会被挂起
    // （刷新后台标签页、刷新后立刻切走、Chrome paint-holding 等），[data-reveal]
    // 会卡在隐藏态 opacity:0 —— 表现为"刷新后首屏不显示"。下面三重保险确保可见。
    function inFirstScreen(el) {
      var rect = el.getBoundingClientRect();
      return rect.top < window.innerHeight && rect.bottom > 0;
    }
    function ensureFirstScreenRevealed() {
      revealEls.forEach(function (el) {
        if (inFirstScreen(el)) el.classList.add('revealed');
      });
    }
    // 仅强制真正卡死（计算 opacity 仍为 0）的首屏元素，避免打断正在播放的级联
    function forceStuckFirstScreen() {
      revealEls.forEach(function (el) {
        if (inFirstScreen(el) && getComputedStyle(el).opacity === '0') {
          el.classList.add('revealed', 'revealed-now');
        }
      });
    }
    setTimeout(ensureFirstScreenRevealed, 1200);
    // 终极保险：不论页面是否可见，首屏内容仍不可见就强制落终态，杜绝永久白屏
    setTimeout(forceStuckFirstScreen, 2200);
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) ensureFirstScreenRevealed();
    });
  }

  // -- 数据条数字滚动："10+"、"50+"、"100%"、"95%" 从 0 数到目标值 --
  // 与 [data-reveal] 同款可重播策略：数据条完全离开视口后归零并撤下动画，
  // 再次滚入时重新滚动，保证上滚回到数据条时数字仍会重播
  var statNums = Array.prototype.slice.call(document.querySelectorAll('.stat strong'));
  var statsSection = document.querySelector('.stats');
  if (statNums.length && statsSection && !reducedMotion && 'IntersectionObserver' in window) {
    // 目标值只在初始化时解析一次：归零重置后 textContent 变成 "0+后缀"，不能再当解析来源
    var statItems = statNums.map(function (el) {
      var matches = el.textContent.match(/^(\d+)(.*)$/);
      var target = matches ? parseInt(matches[1], 10) : NaN;
      return (isFinite(target) && target > 0)
        ? { el: el, target: target, suffix: matches[2], raf: 0 }
        : null;
    }).filter(Boolean);

    var statTimers = [];

    function countUp(item) {
      var duration = 1400;
      var start = null;
      function frame(now) {
        if (start === null) start = now;
        var p = Math.min((now - start) / duration, 1);
        var eased = 1 - Math.pow(1 - p, 3); // easeOutCubic：先快后慢
        item.el.textContent = Math.round(item.target * eased) + item.suffix;
        if (p < 1) item.raf = requestAnimationFrame(frame);
      }
      item.raf = requestAnimationFrame(frame);
    }

    function stopStatRoll() {
      statTimers.forEach(clearTimeout);
      statTimers = [];
      statItems.forEach(function (item) {
        if (item.raf) cancelAnimationFrame(item.raf);
        item.raf = 0;
      });
    }

    function playStatRoll() {
      stopStatRoll();
      statItems.forEach(function (item, i) {
        statTimers.push(setTimeout(function () { countUp(item); }, i * 130)); // 与 .stat 级联时序对齐
      });
    }

    function resetStatRoll() {
      stopStatRoll();
      statItems.forEach(function (item) { item.el.textContent = '0' + item.suffix; });
    }

    var statIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.intersectionRatio >= 0.4) {
          playStatRoll();
        } else if (entry.intersectionRatio === 0) {
          // 比例归 0（完全离开视口）才归零，中间比例保持现状，与进场动效的重置策略一致
          resetStatRoll();
        }
      });
    }, { threshold: [0, 0.4] });
    statIo.observe(statsSection);
  }

  // -- 滚动联动动画：Hero 视差 + 页头投影（rAF 合帧，避免滚动卡顿）--
  var headerEl = document.querySelector('header');
  var heroCopy = document.querySelector('.hero-copy');
  var heroImg = document.querySelector('.hero-media img');
  var scrollTicking = false;

  function applyScrollFx() {
    scrollTicking = false;
    var y = window.scrollY;
    if (headerEl) headerEl.classList.toggle('scrolled', y > 8);

    // Hero 视差只在本屏附近计算；位移是 scrollY 的纯函数，上滚/下滚可逆联动。
    // 图片 0.15 倍速下沉（scale 1.15 留了余量），文案反向轻移并随滚出渐隐
    if (!reducedMotion && heroImg && y <= window.innerHeight * 1.2) {
      heroImg.style.transform = 'translateY(' + Math.min(y * 0.15, 36) + 'px) scale(1.15)';
      if (heroCopy) {
        heroCopy.style.transform = 'translateY(' + (y * -0.06) + 'px)';
        heroCopy.style.opacity = String(Math.max(1 - y / (window.innerHeight * 0.9), 0));
      }
    }
  }

  function onScroll() {
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(applyScrollFx);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  applyScrollFx();
})();
