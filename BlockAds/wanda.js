let body = $response.body;

// 打印日志，便于排查
console.log("Response body length:", body.length);
// 可选：console.log("Response body content:", body);

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
  // 打印错误信息
  console.log("JSON Parse error:", e.message);
  // 返回原始内容，避免中断
  $done({});
}