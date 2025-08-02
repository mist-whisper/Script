/*
微信跳转页 URL 解锁器
适用场景：拦截 https://security.wechat.com/security/con/urlmiddlepagecgi 返回的跳转地址并自动跳转
作者：wish
时间：2025-08
*/

let body = $response.body || '';
let json;

try {
  json = JSON.parse(body);

  // 提取真实跳转 URL（已替换 HTML 实体）
  const rawUrl = json?.url || '';
  const decodedUrl = rawUrl
    .replace(/&#x2f;/g, '/')
    .replace(/&amp;/g, '&')
    .trim();

  if (/^https?:\/\//.test(decodedUrl)) {
    console.log(`✅ 发现跳转链接：${decodedUrl}`);
    $done({
      status: 302,
      headers: { Location: decodedUrl }
    });
  } else {
    console.log(`❌ URL 不合法或为空: ${decodedUrl}`);
    fallback();
  }
} catch (e) {
  console.log(`❌ JSON 解析失败: ${e.message}`);
  fallback();
}

function fallback() {
  // 默认跳回空白页（或可换成你的站点）
  $done({
    status: 302,
    headers: { Location: "https://support.wechat.com" }
  });
}