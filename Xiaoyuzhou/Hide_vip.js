// 小宇宙会员 banner 屏蔽脚本
// URL: https://api.xiaoyuzhoufm.com/v1/membership/platform

console.log("✅ 小宇宙会员脚本已触发");

try {
  let body = JSON.parse($response.body);

  if (body?.data) {
    body.data.messages = [];
    body.data.button = {};
    body.data.link = "";
    body.data.showRenewal = false;

    // 可选：伪装成已开会员
   //  body.data.memberType = "VIP";
  }

  $done({ body: JSON.stringify(body) });

} catch (e) {
  console.log("❌ 小宇宙脚本异常:", e);
  $done({});
}
