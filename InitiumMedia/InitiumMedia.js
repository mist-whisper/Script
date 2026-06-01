let body = $response.body;

// 执行替换操作
body = body
  .replace(/state="inactive"/g, 'state="active"')
  .replace(/message="很遗憾，您没有有效的订阅"/g, 'message="订阅有效，欢迎体验会员服务"')
  .replace(/term="false"/g, 'term="true"');

// 如果关键字段已被替换，则解锁成功
if (
  body.includes('state="active"') &&
  body.includes('message="订阅有效，欢迎体验会员服务"') &&
  body.includes('term="true"')
) {
  console.log('✅ 已解锁端传媒会员');
} else {
  console.log('❌ 解锁失败');
}

$done({ body });