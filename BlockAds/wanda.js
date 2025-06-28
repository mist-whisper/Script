let body = $response.body;

// 日志辅助调试
console.log("Raw body type:", typeof body);
console.log("Raw body length:", body ? body.length : "null");
console.log("Raw body content:", body);

if (!body || body.trim().length === 0) {
  // 没有内容，直接返回
  $done({});
  return;
}

try {
  let obj = JSON.parse(body);

  // 你要移除的广告字段
  const adKeys = [
    "OpenAPP-&-FlashAD",
    "InTheaters-&-BoxAD"
    // 如有其它广告项，继续添加
  ];

  if (obj?.data?.objects) {
    adKeys.forEach(key => {
      if (Array.isArray(obj.data.objects[key])) {
        obj.data.objects[key] = [];
      }
    });
  }

  $done({ body: JSON.stringify(obj) });
} catch (e) {
  console.log("JSON Parse error:", e.message);
  $done({});
}