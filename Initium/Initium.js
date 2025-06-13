let body = $response.body;

// 替换关键字段为“已订阅”
body = body
  // 订阅状态从inactive到active
  .replace(/state="inactive"/g, 'state="active"')
  // 提示信息为已订阅
  .replace(/message="很遗憾，您没有有效的订阅"/g, 'message="订阅有效，欢迎体验会员服务"')
  // term字段布尔值置为true
  .replace(/term="false"/g, 'term="true"');

// 返回修改后的响应体
$done({ body });