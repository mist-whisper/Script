const url = $request.url;
const header = $request.headers;
const isNetEase = url.includes("/interface") && url.includes(".music.163.com/");

// 兼容 Loon 和 Surge 参数读取
let cookie, mconfig, userAgent;

if (typeof $argument !== "undefined") {
  // Loon 方式
  cookie = $argument.Cookie;
  mconfig = $argument.MConfigInfo;
  userAgent = $argument.UserAgent;
} else {
  // Surge 方式：通过环境变量或直接在脚本顶部配置
  cookie = "Cookie";
  mconfig = "MConfigInfo";
  userAgent = "UserAgent";
}

if (isNetEase) {
  if (!cookie || !mconfig || !userAgent) {
    console.log("参数缺失信息：");
    if (!cookie) console.log("❌ Cookie 参数缺失");
    if (!mconfig) console.log("❌ MConfigInfo 参数缺失");
    if (!userAgent) console.log("❌ UserAgent 参数缺失");
    $notification.post("网易云音乐遇到问题", "参数缺失", "请填入会员数据");
    $done({});
  } else {
    header["cookie"] = cookie;
    header["mconfig-info"] = mconfig;
    header["user-agent"] = userAgent;
    console.log("✅ 网易云音乐会员已解锁 🎉");
    $done({ headers: header });
  }
} else {
  $done({});
}
