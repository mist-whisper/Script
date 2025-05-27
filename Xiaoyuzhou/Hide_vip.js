let body = $response.body;

// 1. 替换会员按钮跳转链接为空（禁用点击）
try {
  let obj = JSON.parse(body);
  if (obj?.data?.link?.includes("podcast-member")) {
    obj.data.link = "";
    body = JSON.stringify(obj);
  }
} catch (e) {
  // 非 JSON 内容跳过解析，继续执行注入
}

// 2. 注入隐藏会员横幅的 CSS 样式
const css = `
<style>
  div:has(*:contains("解锁小宇宙PLUS")),
  div:has(*:contains("去开通")),
  div:has(*:contains("了解更多权益详情")) {
    display: none !important;
  }
</style></head>`;
body = body.replace("</head>", css);

// 3. 兼容性补丁：注入 JS 方式（备用，增强兼容）
const js = `
<script>
window.onload = function() {
  const all = document.querySelectorAll("div, section, article");
  all.forEach(el => {
    if (el.innerText?.includes("解锁小宇宙PLUS") || el.innerText?.includes("去开通")) {
      el.remove();
    }
  });
};
</script></body>`;
body = body.replace("</body>", js);

$done({ body });