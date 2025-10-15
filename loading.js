// loading.js
(function () {
  // 1. 动态插入加载遮罩
  const loadingEl = document.createElement('div');
  loadingEl.id = 'global-loading';
  loadingEl.className = 'global-loading';
  loadingEl.innerHTML = `
    <div class="spinner"></div>
    <p>Loading...</p>
  `;
  document.body.insertBefore(loadingEl, document.body.firstChild);

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

  // 4. 监听加载事件
  window.addEventListener('load', initPage);
  window.addEventListener('pageshow', (e) => {
    if (e.persisted) setTimeout(initPage, 100);
  });

  // 5. 兜底：3秒后强制显示
  setTimeout(() => {
    if (!document.body.classList.contains('loaded')) {
      initPage();
    }
  }, 3000);
})();
