// 小黑盒签到：Surge/Loon/QuanX通用版
// by mist_shu & chatgpt

const blackboxCookies = [
  // 示例格式：heybox_id#pkey=xxx;x_xhh_tokenid=yyy
  "1234567890#pkey=xxx;x_xhh_tokenid=yyy",
  "9876543210#pkey=aaa;x_xhh_tokenid=bbb"
];

// 配置
const headersCommon = {
  "User-Agent": "Mozilla/5.0 (Linux; Android 10; XiaoMi 13)",
  "Connection": "keep-alive",
  "Accept": "*/*"
};

(async () => {
  for (let i = 0; i < blackboxCookies.length; i++) {
    const line = blackboxCookies[i];
    const [heybox_id, cookie] = line.split("#");
    console.log(`👉 开始账号${i + 1}：heybox_id=${heybox_id}`);

    const signRes = await signIn(heybox_id, cookie);
    const batteryRes = await battery(heybox_id, cookie);
    const followRes = await follow(heybox_id, cookie);

    notify(i + 1, signRes, batteryRes, followRes);
  }
  $done();
})();

function get(url, headers = {}) {
  headers = { ...headersCommon, ...headers };
  return new Promise(resolve => {
    if (typeof $task !== "undefined") {
      // QuanX
      $task.fetch({ url, headers }).then(res => resolve(JSON.parse(res.body)));
    } else if (typeof $httpClient !== "undefined") {
      // Surge/Loon
      $httpClient.get({ url, headers }, (err, res, body) => {
        resolve(JSON.parse(body || "{}"));
      });
    }
  });
}

function signIn(id, cookie) {
  const ts = Math.floor(Date.now() / 1000);
  const url = `https://api.xiaoheihe.cn/task/sign_in/web/v2?heybox_id=${id}&imei=fakeimei&nonce=sign&hkey=fakehkey&_time=${ts}&dw=428&channel=heybox_xiaomi&x_app=heybox`;
  return get(url, {
    Referer: "https://api.xiaoheihe.cn",
    Cookie: cookie
  });
}

function battery(id, cookie) {
  const ts = Math.floor(Date.now() / 1000);
  const url = `https://api.xiaoheihe.cn/bbs/app/author/article/battery/charging?heybox_id=${id}&battery_inc=1&link_id=150786895&imei=fakeimei&hkey=fakehkey&_time=${ts}&channel=heybox_xiaomi&x_app=heybox`;
  return get(url, {
    Referer: "https://api.xiaoheihe.cn",
    Cookie: cookie
  });
}

function follow(id, cookie) {
  const ts = Math.floor(Date.now() / 1000);
  const url = `https://api.xiaoheihe.cn/user/actions/follow?heybox_id=${id}&following_id=12318034&imei=fakeimei&hkey=fakehkey&_time=${ts}&x_app=heybox`;
  return get(url, {
    Referer: "https://api.xiaoheihe.cn",
    Cookie: cookie
  });
}

function notify(index, sign, battery, follow) {
  const title = `🕹️ 小黑盒账号${index}`;
  const msg = `签到：${sign?.msg || "失败"}\n电量：${battery?.msg || "失败"}\n关注：${follow?.msg || "失败"}`;
  if (typeof $notify !== "undefined") $notify(title, "", msg);
  console.log(`${title}\n${msg}`);
}