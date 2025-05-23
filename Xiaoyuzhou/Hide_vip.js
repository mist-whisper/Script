// 脚本名称：小宇宙会员屏蔽
// 作用：清空会员推广字段

let body = JSON.parse($response.body);

// 清空 messages 内容
body.data.messages = [];

// 隐藏开通按钮和链接
body.data.button = {};
body.data.link = "";
body.data.showRenewal = false;

// 强制标记为会员（可选）
body.data.memberType = "VIP";

$done({ body: JSON.stringify(body) });
