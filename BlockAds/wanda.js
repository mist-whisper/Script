let body = $response.body;
console.log("Raw body:", body);

if (!body) {
  // body 为空，直接返回
  $done({});
  return;
}

try {
  let obj = JSON.parse(body);

  // 广告字段列表
  const adKeys = [
    "OpenAPP-&-FlashAD",
    "InTheaters-&-BoxAD",
    "NewHome-&-HBTips",
    "NewHome-&-Home_Banner",
    "NewHome-&-MiddleAD",
    "NewHome-&-FilmAD",
    "NewHome-&-Transformers"
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