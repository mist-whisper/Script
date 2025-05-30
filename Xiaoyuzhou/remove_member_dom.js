/**
 * remove_member_dom.js
 * Loon Script-Response-Body 脚本
 *
 * 功能：
 *  1. 拦截页面 HTML（含“解锁小宇宙PLUS”卡片的主页面或内嵌页面）
 *  2. 注入前端脚本 & CSS，把任何残留的会员卡片容器彻底 remove() 或隐藏
 *
 * 使用配置（放在 Loon 配置文件的 [Script] 段）：
 *   ^https?:\/\/h5\.xiaoyuzhoufm\.com\/podcast-member.* url script-response-body remove_member_dom.js
 */
(function() {
  let body = $response.body;

  // 1. 注入的前端脚本：DOMReady 及动态插入都执行 rm()
  const injectScript = `
<script>
(function() {
  function rm() {
    // 根据实际页面结构，列出所有可能的卡片容器选择器
    var sel = document.querySelector(
      '.podcast-member-card, .vip-banner, [data-component="vip"], .member-module'
    );
    if (sel) {
      sel.remove();
      console.log('会员卡片 DOM 已移除');
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', rm);
  } else {
    rm();
  }
  new MutationObserver(rm).observe(document.body, {
    childList: true,
    subtree: true
  });
})();
<\/script>`;

  // 2. 注入 CSS，强制隐藏所有可能的空占位
  const injectStyle = `
<style>
  .podcast-member-card,
  .vip-banner,
  [data-component="vip"],
  .member-module {
    display: none !important;
    visibility: hidden !important;
    height: 0 !important;
    margin: 0 !important;
    padding: 0 !important;
  }
</style>`;

  // 3. 把 CSS 和脚本插入到 </head> 与 </body> 之间
  body = body
    .replace(/<\/head>/i, injectStyle + '</head>')
    .replace(/<\/body>/i, injectScript + '</body>');

  $done({ body });
})();