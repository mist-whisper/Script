// ==============================
// Ximalaya VIP – 手动注入 Cookie 脚本
// ==============================
//
// 说明：将下面的 MANUAL_COOKIE 值替换为你在浏览器中复制的完整 Cookie 字符串。
// 支持环境：Surge / Quantumult X / Loon

// —— 环境检测 ——  
const isReq  = typeof $request !== "undefined";
const isQX   = typeof $task    !== "undefined";
const isLoon = typeof $loon    !== "undefined";

// —— 通用通知函数 ——  
function notify(title, subtitle, message) {
  if (isQX) {
    $notify(title, subtitle, message);
  } else if (isLoon) {
    $notification.post(title, subtitle, message);
  } else if (typeof $notify !== "undefined") {
    // Surge
    $notify(title, subtitle, message);
  }
}

// —— 在此处粘贴你的完整 Cookie ——  
// 示例格式： "uid=123456; session=abcdef; theme=dark;"
const MANUAL_COOKIE = "1&_token=326951508&2DC12D40340C8F344DE687A904289C24F8EF224B2847FB6740119F498047D4873345B1F6E4A1169MBEB9F9C6266EA30_";

if (isReq) {
  // 拦截请求时注入你的 Cookie
  let headers = $request.headers;
  headers["Cookie"] = MANUAL_COOKIE;
  console.log("✅ 已手动注入 Cookie，跳过远程抓取");
  notify("Ximalaya VIP", "", "已使用手动 Cookie 注入");
  $done({ headers });
} else {
  // 非请求场景，不做任何处理
  $done({});
}