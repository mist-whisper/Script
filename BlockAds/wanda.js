// 🎯 移除启动页与影院页广告项

let body = $response.body;
if (!body) $done({});

try {
  let obj = JSON.parse(body);

  // 广告项模块列表
  const adKeys = [
    "OpenAPP-&-FlashAD",
    "InTheaters-&-BoxAD"
  ];

  if (obj?.data?.objects) {
    adKeys.forEach(key => {
      if (obj.data.objects.hasOwnProperty(key)) {
        obj.data.objects[key] = []; // 清空数组内容
      }
    });
  }

  $done({ body: JSON.stringify(obj) });

} catch (e) {
  console.log("🚨 JSON 解析失败:", e);
  $done({});
}