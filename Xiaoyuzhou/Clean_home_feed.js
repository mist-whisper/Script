const url = $request.url;

if (!$response.body) {
  $done({});
}

try {
  let obj = JSON.parse($response.body);

  if (url.includes("/v1/discovery-feed/list")) {
    if (obj?.data) {
      if (Array.isArray(obj.data)) {
        // 旧逻辑处理：obj.data 是数组
        if (obj.data.length > 0) {
          obj.data[0] = {};
        }
      } else if (
        obj.data.sections &&
        Array.isArray(obj.data.sections) &&
        obj.data.sections.length > 0 &&
        Array.isArray(obj.data.sections[0].items)
      ) {
        // 新逻辑处理：obj.data.sections[0].items 是数组
        // 清空第一个元素（如果需要）
        obj.data.sections[0].items[0] = {};

        // 过滤掉 type 为 EDITORS_COVER_BANNER 的项
        obj.data.sections[0].items = obj.data.sections[0].items.filter(
          (item) => item?.type !== "EDITORS_COVER_BANNER"
        );
      }
    }
  }

  $done({ body: JSON.stringify(obj) });
} catch (e) {
  console.log("处理失败:", e);
  $done({});
}