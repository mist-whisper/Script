let body = $response.body;
let obj;

try {
  obj = JSON.parse(body);
} catch (e) {
  $done({});
  return;
}

// 仅当 data 是数组时处理
if (Array.isArray(obj.data)) {
  obj.data = obj.data.filter(item => {
    // 只保留 type 不是 DISCOVERY_HEADER 和 DISCOVERY_BANNER 的模块
    return item.type !== 'DISCOVERY_HEADER' && item.type !== 'DISCOVERY_BANNER';
  });
}

$done({ body: JSON.stringify(obj) });