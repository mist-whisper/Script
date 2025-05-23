let body = JSON.parse($response.body);

// 移除所有 messages
body.data.messages = [];

// 隐藏按钮和链接
body.data.button = {};
body.data.link = "";
body.data.showRenewal = false;

$done({ body: JSON.stringify(body) });
