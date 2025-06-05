const url = $request.url;

if (!$response.body) {
  $done({});
}

try {
  let obj = JSON.parse($response.body);

  if (url.includes("/v1/discovery-feed/list")) {
    if (obj?.data) {
      if (Array.isArray(obj.data)) {
        // 旧逻辑，直接清空第一个元素
        if (obj.data.length > 0) {
          obj.data[0] = {};
        }
      } else if (obj.data.sections && Array.isArray(obj.data.sections)) {
        // 遍历所有 sections，过滤 items
        obj.data.sections.forEach(section => {
          if (Array.isArray(section.items)) {
            section.items = section.items.filter(item => {
              // 过滤所有 type 为 EDITORS_COVER_BANNER 或指定 id 的项
              return item?.type !== "EDITORS_COVER_BANNER" && item?.id !== "68368946d751e070efd98f0a";
            });
          }
        });
      }
    }
  }

  $done({ body: JSON.stringify(obj) });
} catch (e) {
  console.log("处理失败:", e);
  $done({});
}