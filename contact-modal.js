// contact-modal.js —— 悬浮联系按钮 + 联系方式弹窗（全站共用一份）
// 用法：页面引入 <script src="/contact-modal.js" defer></script>，无需任何 HTML
// 二维码图片在首次打开弹窗时才注入，避免每页多下载 ~103 KB
// 图标来源（均为内联 path，不加载任何 CDN）：
//   品牌图标 WhatsApp / WeChat / Facebook / Instagram / YouTube 取自 Simple Icons，CC0 公共领域、无署名义务 — https://simpleicons.org
//   线性图标（电话 / 信封 / 厂房）取自 Lucide，ISC 许可、无署名义务 — https://lucide.dev/license
//   字体 Inter 自托管，SIL OFL 1.1（允许网站嵌入，无署名义务）
(function () {
  const MODAL_HTML = `
    <div id="contactFloatBtn" class="contact-float-btn" role="button" tabindex="0" onclick="openContactModal()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.2 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>Contact Us
    </div>
    <div id="contactModal" class="contact-modal" role="dialog" aria-modal="true" aria-label="Contact customer service">
        <div class="contact-modal-content">
            <span class="close" role="button" tabindex="0" aria-label="Close" onclick="closeContactModal()">&times;</span>
            <h2>Contact Customer Service</h2>
            <p><a href="mailto:ling@kfcatering.com?subject=Inquiry%20from%20kfcatering.com" class="btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="width:1em;height:1em;margin-right:8px;flex:none"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>Email：ling@kfcatering.com</a></p>
            <div class="contact-options">
                <div class="contact-option">
                    <h3><svg viewBox="0 0 24 24" fill="#25D366" aria-hidden="true" style="height:1em;width:1em;margin-right:8px;vertical-align:-0.1em"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg> WhatsApp</h3>
                    <a href="https://wa.me/8619927525746" target="_blank" rel="noopener noreferrer" class="btn">Add WhatsApp</a>
                    <img data-src="/images/whatsapp_qr.webp" alt="WhatsApp QR Code" class="qr-code">
                    <p class="note">Scan to add WhatsApp</p>
                </div>
                <div class="contact-option">
                    <h3><svg viewBox="0 0 24 24" fill="#07C160" aria-hidden="true" style="height:1em;width:1em;margin-right:8px;vertical-align:-0.1em"><path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89c-.135-.01-.27-.027-.407-.03zm-2.53 3.274c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982z"/></svg> WeChat</h3>
                    <a href="#" class="btn" onclick="triggerQrAnimation(); return false;">Add WeChat</a>
                    <img id="wechatQr" data-src="/images/wechat_qr.webp" alt="WeChat QR Code" class="qr-code">
                    <p class="note">Scan to add WeChat</p>
                </div>
                <div class="contact-option">
                    <h3><svg viewBox="0 0 24 24" fill="#1877F2" aria-hidden="true" style="height:1em;width:1em;margin-right:8px;vertical-align:-0.1em"><path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z"/></svg> Facebook</h3>
                    <a href="https://www.facebook.com/profile.php?id=100076730304582" target="_blank" rel="noopener noreferrer" class="btn">Browse Facebook</a>
                    <img data-src="/images/facebook_qr.webp" alt="Facebook QR Code" class="qr-code">
                    <p class="note">Scan to add Facebook</p>
                </div>
                <div class="contact-option">
                    <h3><svg viewBox="0 0 24 24" fill="#E1306C" aria-hidden="true" style="height:1em;width:1em;margin-right:8px;vertical-align:-0.1em"><path d="M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 20.628.9208 19.8378.6165 19.074.321 18.2017.1197 16.9244.0645 15.6471.0093 15.236-.005 11.977.0014 8.718.0076 8.31.0215 7.0301.0839m.1402 21.6932c-1.17-.0509-1.8053-.2453-2.2287-.408-.5606-.216-.96-.4771-1.3819-.895-.422-.4178-.6811-.8186-.9-1.378-.1644-.4234-.3624-1.058-.4171-2.228-.0595-1.2645-.072-1.6442-.079-4.848-.007-3.2037.0053-3.583.0607-4.848.05-1.169.2456-1.805.408-2.2282.216-.5613.4762-.96.895-1.3816.4188-.4217.8184-.6814 1.3783-.9003.423-.1651 1.0575-.3614 2.227-.4171 1.2655-.06 1.6447-.072 4.848-.079 3.2033-.007 3.5835.005 4.8495.0608 1.169.0508 1.8053.2445 2.228.408.5608.216.96.4754 1.3816.895.4217.4194.6816.8176.9005 1.3787.1653.4217.3617 1.056.4169 2.2263.0602 1.2655.0739 1.645.0796 4.848.0058 3.203-.0055 3.5834-.061 4.848-.051 1.17-.245 1.8055-.408 2.2294-.216.5604-.4763.96-.8954 1.3814-.419.4215-.8181.6811-1.3783.9-.4224.1649-1.0577.3617-2.2262.4174-1.2656.0595-1.6448.072-4.8493.079-3.2045.007-3.5825-.006-4.848-.0608M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.1506-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.156 2.771-6.1496 6.1738M8 12.0077a4 4 0 1 1 4.008 3.9921A3.9996 3.9996 0 0 1 8 12.0077"/></svg> Instagram</h3>
                    <a href="https://www.instagram.com/kingfoodcatering/" target="_blank" rel="noopener noreferrer" class="btn">Browse Instagram</a>
                    <img data-src="/images/instagram_qr.webp" alt="Instagram QR Code" class="qr-code">
                    <p class="note">Scan to add Instagram</p>
                </div>
            </div>
        </div>
    </div>`;

  document.body.insertAdjacentHTML('beforeend', MODAL_HTML);

  function loadQrImages() {
    document.querySelectorAll('#contactModal img[data-src]').forEach(img => {
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
    });
  }

  const modal = document.getElementById('contactModal');
  let lastFocused = null; // 打开前的焦点位置，关闭时还原

  window.openContactModal = function () {
    lastFocused = document.activeElement;
    loadQrImages();
    modal.style.display = 'block';
    const closeBtn = modal.querySelector('.close');
    if (closeBtn) closeBtn.focus();
  };

  window.closeContactModal = function () {
    modal.style.display = 'none';
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
    lastFocused = null;
  };

  // 无障碍：ESC 关闭；Tab 把焦点圈定在弹窗内（focus trap）
  document.addEventListener('keydown', (e) => {
    if (modal.style.display !== 'block') return;
    if (e.key === 'Escape') {
      closeContactModal();
      return;
    }
    if (e.key !== 'Tab') return;
    const focusables = modal.querySelectorAll('a[href], [tabindex]:not([tabindex="-1"])');
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  // 关闭按钮支持键盘激活（role=button 的 span 不响应 Enter/Space）
  const closeBtn = modal.querySelector('.close');
  if (closeBtn) {
    closeBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        closeContactModal();
      }
    });
  }

  // 悬浮按钮同为 role=button，补 Enter/Space 激活，保证纯键盘可打开弹窗
  const floatBtn = document.getElementById('contactFloatBtn');
  if (floatBtn) {
    floatBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openContactModal();
      }
    });
  }

  // 微信二维码抖动
  window.triggerQrAnimation = function () {
    const qr = document.getElementById('wechatQr');
    if (qr) {
      qr.classList.remove('animate');
      void qr.offsetWidth; // 触发重排，确保动画可重复
      qr.classList.add('animate');
    }
  };
})();
