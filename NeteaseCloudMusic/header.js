(function () {
  const url = $request.url;
  const headers = $request.headers;
  const isNetEase = url.includes("/interface") && url.includes(".music.163.com/");

  if (!isNetEase) return $done({});

  // 参数解析函数
  function parseArguments(argStr) {
    if (typeof argStr !== "string") return {};  // 关键修复点
    return Object.fromEntries(
      argStr
        .split("&")
        .map(kv => kv.split("="))
        .filter(kv => kv.length === 2)
        .map(([k, v]) => [k, decodeURIComponent(v)])
    );
  }

  const args = parseArguments($argument);
  const cookie = args.Cookie;
  const mconfig = args.MConfigInfo;
  const userAgent = args.UserAgent;

  if (!cookie || !mconfig || !userAgent) {
    $notification.post(
      "网易云音乐配置错误",
      "参数缺失",
      "请在脚本参数中设置 Cookie、MConfigInfo、UserAgent"
    );
    return $done({});
  }

  headers["cookie"] = cookie;
  headers["mconfig-info"] = mconfig;
  headers["user-agent"] = userAgent;

  $done({ headers });
})();







/*
const url = $request.url;
const header = $request.headers;
const isNetEase = url.includes("/interface") && url.includes(".music.163.com/");

if (isNetEase) {
  // 从 Loon 脚本参数中读取配置
  const cookie = $argument?.Cookie;
  const mconfig = $argument?.MConfigInfo;
  const userAgent = $argument?.UserAgent;

  // 检查参数是否缺失
  if (!cookie || !mconfig || !userAgent) {
    $notification.post(
      "网易云音乐配置错误",
      "参数缺失",
      "请在 Loon 脚本参数中填写 Cookie、MConfigInfo 和 UserAgent"
    );
    $done({});
  } else {
    header["cookie"] = cookie;
    header["mconfig-info"] = mconfig;
    header["user-agent"] = userAgent;
  }

  $done({ headers: header });
} else {
  $done({});
}
*/


/*
const url = $request.url;
const header = $request.headers;
const isNetEase = url.includes("/interface") && url.includes(".music.163.com/");

if (isNetEase) {
  if (
    $persistentStore.read("Music163_MConfigInfo") === undefined ||
    $persistentStore.read("Music163_MConfigInfo") === null
  ) {
    $notification.post("网易云音乐遇到问题", "参数缺失", "请在插件内填入会员数据");
    $done({});
  } else {
    header["cookie"] = $persistentStore.read("Music163_Cookie");
    header["mconfig-info"] = $persistentStore.read("Music163_MConfigInfo");
    header["user-agent"] = $persistentStore.read("Music163_UserAgent");
  }

  $done({ headers: header });
} else {
  $done({});
}
*/
