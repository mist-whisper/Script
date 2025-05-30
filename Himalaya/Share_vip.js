// ===========================================
// Ximalaya VIP – 手动或远程注入 Cookie 脚本
// ===========================================
//
// 说明：
// 1. 如果你想手动控制 Cookie，请将 MANUAL_COOKIE 填为你的登录 Cookie 字符串（完整复制整个 Cookie 值）。
// 2. 如果留空或不填，则脚本会自动远程获取最新 Cookie 并注入。
// 3. 支持环境：Surge / Quantumult X / Loon

// —— 环境检测 ——  
const isReq  = typeof $request !== 'undefined';
const isQX   = typeof $task    !== 'undefined';
const isLoon = typeof $loon    !== 'undefined';

// —— 通用通知函数 ——  
function notify(title, subtitle, message) {
  if (isQX) {
    $notify(title, subtitle, message);
  } else if (isLoon) {
    $notification.post(title, subtitle, message);
  } else if (typeof $notify !== 'undefined') {
    $notify(title, subtitle, message);
  }
}

// —— 手动填写你的完整 Cookie ——
// 示例： "uid=123456; session=abcdef; theme=dark;"
const MANUAL_COOKIE = "1&_token=326951508&2DC12D40340C8F344DE687A904289C24F8EF224B2847FB6740119F498047D4873345B1F6E4A1169MBEB9F9C6266EA30_";  // ← 在此粘贴你的 Cookie，留空则自动远程获取

if (isReq) {
  // 如果手动 Cookie 已设置，则直接注入
  if (MANUAL_COOKIE && MANUAL_COOKIE.trim()) {
    let headers = $request.headers;
    headers['Cookie'] = MANUAL_COOKIE;
    console.log("✅ 已使用手动 Cookie 注入");
    notify("Ximalaya VIP", "", "已使用手动 Cookie 注入");
    $done({ headers });
  } else {
    // 否则执行远程拉取逻辑
    (async () => {
      try {
        const requestOptions = {
          url: "https://wxpusher.zjiecode.com/api/message/8FJwxZdmJM52OhTPS8qZcvMdqzM6qvV4",
          method: "GET",
          headers: {
            "Host": "wxpusher.zjiecode.com",
            "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148",
            "Sec-Fetch-Dest": "document"
          }
        };
        // 发起远程请求
        const res = isQX
          ? await $task.fetch(requestOptions)
          : await new Promise((resolve, reject) => {
              $httpClient.get(requestOptions, (err, resp, body) => {
                if (err) reject(err);
                else resolve({ status: resp.status, body });
              });
            });
        // 从返回的 HTML 中提取 Cookie
        const html = res.body;
        const match = html.match(/<p[^>]*>([^<]+)<\/p>/);
        const ck = match ? match[1].trim() : null;
        if (ck) {
          let headers = $request.headers;
          headers['Cookie'] = ck;
          console.log("✅ 喜马拉雅激活会员成功");
          notify("Ximalaya VIP", "", "会员激活成功");
          $done({ headers });
        } else {
          console.log("❌ 未获取到有效 Cookie，可能已过期");
          $done({});
        }
      } catch (e) {
        console.log("❌ 喜马拉雅会员异常：" + e);
        $done({});
      }
    })();
  }
} else {
  // 非请求场景，直接结束脚本
  $done({});
}