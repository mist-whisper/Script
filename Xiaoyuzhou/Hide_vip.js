let body = $response.body;

const script = `
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

body = body.replace("</body>", script);

$done({ body });