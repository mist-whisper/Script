/**
 * 喜马拉雅 VIP 激活脚本
 * 兼容：Loon / Surge / Quantumult X
 */

// —— 平台检测 —— 
const isQX    = typeof $task   !== 'undefined';
const isSurge = typeof $httpClient !== 'undefined' && typeof $loon === 'undefined';
const isLoon  = typeof $loon   !== 'undefined';

// —— 配置区 —— 
// 拉取 VIP Cookie 的接口
const API_URL   = 'https://wxpusher.zjiecode.com/api/message/8FJwxZdmJM52OhTPS8qZcvMdqzM6qvV4';
// 用于解析返回 HTML 中的 Cookie 值
const VIP_REGEX = /<p[^>]*>([^<]+)<\/p>/;
// 请求头（必要时可补充其他字段）
const REQ_HEADERS = {
  Host: 'wxpusher.zjiecode.com',
  'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148',
  'Sec-Fetch-Dest': 'document'
};

// —— 通用工具 —— 
function log(...args) {
  console.log(...args);
}

function notify(title, subtitle, message) {
  if (isQX) {
    $notify(title, subtitle, message);
  } else if (isSurge || isLoon) {
    $notification.post(title, subtitle, message);
  }
}

async function httpGet(req) {
  if (isQX) {
    return await $task.fetch(req);
  }
  return await new Promise((resolve, reject) => {
    $httpClient.get(req, (err, resp, body) => {
      if (err) reject(err);
      else resolve({ statusCode: resp.status, body, headers: resp.headers });
    });
  });
}

// —— 主逻辑 —— 
!(async () => {
  // 只在拦截请求时执行
  if (typeof $request === 'undefined') {
    return $done({});
  }
  try {
    // 拉取页面
    const response = await httpGet({ url: API_URL, method: 'GET', headers: REQ_HEADERS });
    const html = response.body;
    const match = html.match(VIP_REGEX);
    const ck = match ? match[1].trim() : null;

    if (ck) {
      // 给当前请求挂上 Cookie
      const headers = $request.headers;
      headers['Cookie'] = ck;
      log('🎉 喜马拉雅 VIP 激活成功，Cookie 已注入：', ck);
      notify('喜马拉雅 VIP', '', '激活成功！');
      $done({ headers });
    } else {
      log('❌ 喜马拉雅 VIP 未生效或已过期');
      notify('喜马拉雅 VIP', '', '未检测到有效会员，请检查接口返回');
      $done({});
    }
  } catch (err) {
    log('⚠️ 脚本执行出错：', err);
    notify('喜马拉雅 VIP', '', '脚本异常：' + err);
    $done({});
  }
})();