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

let header = $request.headers;
const isLoon = typeof $task !== "undefined";
const MConfig = MConfig
const User = User
const cookie = cookie



if (isLoon) {
  header["MConfig-Info"] = MConfig;
  header["User-Agent"] = User;
  header["Cookie"] = cookie;
} else {
  header["mconfig-info"] = MConfig;
  header["user-agent"] = User;
  header["cookie"] = cookie;
}

$done({ headers: header });
