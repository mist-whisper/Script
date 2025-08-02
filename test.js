/**
 * @fileoverview 微信新版外链跳转页自动跳转/解锁脚本
 * @author 
 * @version v2.0
 * @description 支持新版微信提示页结构（如：security.wechat.com），无cgiData结构，尝试匹配明文URL，失败时跳转到快照页
 */

// 获取完整响应体
let respBody = $response.body || "";

console.log("🔍 Response Body Length:", respBody.length);

// 正则提取 https 链接（明文存在才生效）
let urlMatch = respBody.match(/https:\/\/[a-zA-Z0-9\-_.]+\.[a-zA-Z]{2,}(\/[^\s<"']*)?/);

if (urlMatch) {
  let realURL = urlMatch[0];
  console.log("✅ 提取到原始链接:", realURL);

  // 你可以选择直接跳转，或使用快照中转（推荐，绕过封锁）
  const useCache = true;
  const targetURL = useCache
    ? "https://web.archive.org/web/20991231999999/" + realURL
    : realURL;

  $done({
    status: 302,
    headers: {
      Location: targetURL
    },
    body: ""
  });
} else {
  console.log("❌ 未能提取跳转链接，页面结构可能完全动态化");

  // 回退跳转地址（你可以换成自己的提示页或固定地址）
  $done({
    status: 302,
    headers: {
      Location: "https://web.archive.org/web/*/https://example.com"
    },
    body: ""
  });
}