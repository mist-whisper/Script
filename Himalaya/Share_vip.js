const isQX = typeof $task !== 'undefined';
const isLoon = typeof $loon !== 'undefined';
const isSurge = typeof $httpClient !== 'undefined' && typeof $persistentStore !== 'undefined';
const isRequest = typeof $request !== 'undefined';

function notify(title, subtitle, message) {
  if (isQX) {
    $notify(title, subtitle, message);
  } else if (isLoon || isSurge) {
    $notification.post(title, subtitle, message);
  }
}

function getValue(key) {
  if (isQX) return $prefs.valueForKey(key);
  if (isLoon || isSurge) return $persistentStore.read(key);
}

async function handleRequest() {
  try {
    const cookie = getValue('ximalaya_cookie');

    if (cookie) {
      const headers = $request.headers;
      headers['1&_token=326951508&2DC12D40340C8F344DE687A904289C24F8EF224B2847FB6740119F498047D4873345B1F6E4A1169MBEB9F9C6266EA30_'] = cookie;
      console.log('✅ 使用本地 Cookie 注入成功');
      $done({ headers });
    } else {
      console.log('❌ 未检测到本地 Cookie，请先手动设置');
      notify('喜马拉雅 VIP 激活失败', '', '⚠️ 未设置持久化 Cookie（ximalaya_cookie）');
      $done({});
    }
  } catch (err) {
    console.log('❌ 错误：', err);
    notify('喜马拉雅脚本出错', '', String(err));
    $done({});
  }
}

if (isRequest) {
  handleRequest();
} else {
  $done({});
}