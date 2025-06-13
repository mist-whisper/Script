const url = $request.url;
const header = $request.headers;
const isNetEase = url.includes("/interface") && url.includes(".music.163.com/");

let cookie = "";
let mconfig = "";
let userAgent = "";

// 🔁 参数兼容处理
if (typeof $argument === "string") {
  // Surge: $argument 是字符串，需手动解析
  const params = Object.fromEntries(
    $argument.split("&").map(pair => pair.split("=").map(decodeURIComponent))
  );
  cookie = params.Cookie || "";
  mconfig = params.MConfigInfo || "";
  userAgent = params.UserAgent || "";
} else if (typeof $argument === "object" && $argument !== null) {
  // Loon: $argument 是对象
  cookie = $argument.Cookie || "";
  mconfig = $argument.MConfigInfo || "";
  userAgent = $argument.UserAgent || "";
}

if (isNetEase) {
  if (!cookie || !mconfig || !userAgent) {
    console.log("参数缺失信息：");
    if (!cookie) console.log("❌ Cookie 参数缺失");
    if (!mconfig) console.log("❌ MConfigInfo 参数缺失");
    if (!userAgent) console.log("❌ UserAgent 参数缺失");

    $notification.post("网易云音乐遇到问题", "参数缺失", "请在脚本参数中填写会员数据");
    $done({});
  } else {
    header["cookie"] = cookie;
    header["mconfig-info"] = mconfig;
    header["user-agent"] = userAgent;

    console.log("✅ 网易云音乐会员解锁成功 🎉");
    $done({ headers: header });
  }
} else {
  $done({});
}