/**
 * @fileoverview 微信新版外链跳转页自动跳转/解锁脚本（修复 match 报错）
 * @version v2.1
 */

let respBody = typeof $response.body === "string" ? $response.body : $response.body?.toString?.() || "";

console.log("🔍 Response Body Length:", respBody.length);

// 正则提取 https URL（极限条件下可能无）
let urlMatch = respBody.match(/https:\/\/[a-zA-Z0-9\-_.]+\.[a-zA-Z]{2,}(\/[^\s<"']*)?/);

if (urlMatch) {
  let realURL = urlMatch[0];
  console.log("✅ 提取到原始链接:", realURL);

  // 使用快照方式跳转（更稳妥）
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
  console.log("❌ 没找到 URL，使用 fallback");

  $done({
    status: 302,
    headers: {
      Location: "https://web.archive.org/web/*/https://example.com"
    },
    body: ""
  });
}