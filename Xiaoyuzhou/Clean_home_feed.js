const url = $request.url;

if (!$response.body) {
  $done({});
}

try {
  let obj = JSON.parse($response.body);

  if (url.includes("/v1/discovery-feed/list")) {
    if (obj?.data) {
      // 旧结构兼容处理
      if (Array.isArray(obj.data)) {
        if (obj.data.length > 0) {
          obj.data[0] = {};
        }
      }

      // 新结构处理：遍历所有 sections[].items[]
      if (Array.isArray(obj.data.sections)) {
        obj.data.sections.forEach(section => {
          if (Array.isArray(section.items)) {
            section.items = section.items.filter(item =>
              item?.id !== "68368946d751e070efd98f0a" && item?.type !== "EDITORS_COVER_BANNER"
            );
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