/**
 * remove_member_html.js
 * Loon Script-Response-Body 脚本
 *
 * 功能：
 * 1. 拦截主页面 HTML（含“解锁小宇宙PLUS”卡片的页面），
 * 2. 删除静态嵌入的卡片 DOM 片段，
 * 3. 并注入 CSS 以防残留任何占位。
 *
 * 使用说明：
 * - 将本脚本保存为 remove_member_html.js 并放到 Loon → Scripts 目录下。
 * - 在 Loon 配置文件的 [Script] 段添加一条规则，指向本脚本：
 *     ^https?:\/\/h5\.xiaoyuzhoufm\.com\/podcast-member.* url script-response-body remove_member_html.js
 */

(function() {
  // 1. 读取原始响应体（HTML 文本）
  let body = $response.body;

  // 2. 删除包含卡片的 <div> 容器
  //    假设卡片最外层容器 class 包含 "podcast-member-card"
  body = body.replace(
    /<div[^>]*class="[^"]*podcast-member-card[^"]*"[\s\S]*?<\/div>/gi,
    ''
  );

  // 3. 如果卡片未通过上述正则完全移除，可再注入 CSS 强制隐藏
  const hideCSS = `
    <style>
      /* 隐藏残余的 PLUS 卡片容器 */
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
    </style>
  `;
  // 注入到 </head> 前
  body = body.replace(/<\/head>/i, hideCSS + '</head>');

  // 4. 返回修改后的 HTML
  $done({ body });
})();