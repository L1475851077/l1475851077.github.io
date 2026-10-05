// products-data.js —— 商品数据统一读入口（读侧合并，不改写任何数据文件）
//
// 两个数据文件由 CMS 分别提交、格式不动：
//   · products/data.js（全局 CATEGORIES + PRODUCTS，列表/分类字段，"Update list item" 提交）
//   · products/product_details/products.json（详情数组 subtitle/features/specs，"Update detail item" 提交）
// 各消费方一律 await window.productsDataReady 取合并数据，不再直接读 window.PRODUCTS
// 或自行 fetch products.json。列表字段以 data.js 为权威，详情侧只补充 subtitle/features/specs。
(function () {
  'use strict';

  function fromGlobals() {
    return {
      categories: Array.isArray(window.CATEGORIES) ? window.CATEGORIES : [],
      products: Array.isArray(window.PRODUCTS) ? window.PRODUCTS : [],
      details: []
    };
  }

  window.productsDataReady = (async () => {
    const data = fromGlobals();
    if (!data.products.length) return data; // data.js 未加载的页面：回退空数据，不发起无谓请求
    try {
      // no-cache：CMS 提交后强制走 ETag 复验，避免内容更新后拿到旧缓存
      const res = await fetch('/products/product_details/products.json', { cache: 'no-cache' });
      if (res.ok) {
        const details = await res.json();
        if (Array.isArray(details)) {
          data.details = details;
          const detailById = new Map(details.map(d => [d.id, d]));
          data.products = data.products.map(p => {
            const d = detailById.get(p.id);
            return d ? Object.assign({}, p, {
              subtitle: d.subtitle,
              features: d.features,
              specs: d.specs
            }) : Object.assign({}, p);
          });
        }
      } else {
        console.warn('[products-data] products.json HTTP ' + res.status + '，详情字段缺失');
      }
    } catch (err) {
      console.warn('[products-data] products.json 加载失败，详情字段缺失：', err);
    }
    return data;
  })();
})();
