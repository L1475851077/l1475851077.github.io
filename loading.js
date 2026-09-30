// loading.js
(function () {
  // 1. 遮罩节点：优先复用页面内联的 #global-loading，缺失时才动态插入
  let loadingEl = document.getElementById('global-loading');
  if (!loadingEl) {
    loadingEl = document.createElement('div');
    loadingEl.id = 'global-loading';
    loadingEl.className = 'global-loading';
    loadingEl.innerHTML = `
    <div class="loading-brand">
      <img src="/images/logo.webp" alt="">
      <div class="loading-word">KINGFOOD<small>Catering Equipment</small></div>
    </div>
    <div class="loading-line"><i></i></div>
  `;
    document.body.insertBefore(loadingEl, document.body.firstChild);
  }

  // 2. 隐藏加载遮罩的函数
  function hideLoading() {
    const el = document.getElementById('global-loading');
    if (el) {
      el.style.opacity = '0';
      el.style.visibility = 'hidden';
      setTimeout(() => {
        if (el.parentNode) el.parentNode.removeChild(el);
      }, 400);
    }
  }

  // 3. 初始化页面：添加 loaded 类 + 隐藏 loading
  function initPage() {
    if (!document.body.classList.contains('loaded')) {
      document.body.classList.add('loaded');
    }
    hideLoading();
  }

  // 4. 监听加载事件：DOM 就绪即隐藏（图片已全部懒加载，不必等 window.load 的外部资源）
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPage, { once: true });
  } else {
    initPage();
  }
  window.addEventListener('pageshow', (e) => {
    if (e.persisted) setTimeout(initPage, 100);
  });

  // 5. 兜底：1 秒后强制显示，防止后续脚本报错把内容永久遮住
  setTimeout(() => {
    if (!document.body.classList.contains('loaded')) {
      initPage();
    }
  }, 1000);
})();
