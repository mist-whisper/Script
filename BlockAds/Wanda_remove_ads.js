let body = $response.body;

if (!body || body.trim().length === 0) {
  $done({});
  return;
}

try {
  let obj = JSON.parse(body);

  // 需要移除的广告字段
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
  $done({});
}