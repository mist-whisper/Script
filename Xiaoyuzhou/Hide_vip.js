/**
 * remove_member_dom.js
 * Loon Script-Response-Body 脚本
 *
 * 功能：在 HTML 页面响应里注入小段 JS，页面加载时及动态插入时都把残余的会员卡片 DOM 节点 remove()
 * 规则示例：^https?:\/\/h5\.xiaoyuzhoufm\.com\/podcast.* url script-response-body remove_member_dom.js
 */
(function() {
  let body = $response.body;
  
  // 要注入的前端脚本
  const inject = `
<script>
(function() {
  // 移除逻辑：找出可能的卡片容器并删掉
  function rm() {
    var sel = document.querySelector('.member-module, .vip-banner, [data-component="vip"], .podcast-member-card');
    if (sel) {
      sel.remove();
      console.log('会员卡片 DOM 已移除');
    }
  }
  // DOMReady 之后执行一次
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', rm);
  } else {
    rm();
  }
  // 监听后续动态插入
  new MutationObserver(rm).observe(document.body, { childList: true, subtree: true });
})();
</script>`;

  // 将脚本注入到 </body> 之前
  body = body.replace(/<\/body>/i, inject + '</body>');
  $done({ body });
})();