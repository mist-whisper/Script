// 小宇宙会员推广移除脚本
// URL: https://api.xiaoyuzhoufm.com/v1/membership/platform

console.log("🎯 小宇宙会员屏蔽脚本执行");

try {
  let body = JSON.parse($response.body);

  // 安全检查
  if (body?.data) {
    body.data.messages = [];
    body.data.button = {};
    body.data.link = "";
    body.data.showRenewal = false;
    body.data.memberType = "VIP"; // 可选：伪装已开会员
  }

  $done({ body: JSON.stringify(body) });

} catch (e) {
  console.log("❌ 脚本执行失败:", e);
  $done({});
}
