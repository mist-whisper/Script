const url = $request.url;

if (!$response.body) {
  $done({});
}

try {
  let obj = JSON.parse($response.body);

  if (url.includes("/v1/discovery-feed/list")) {
    if (
      obj.data &&
      Array.isArray(obj.data.sections) &&
      obj.data.sections.length > 0 &&
      Array.isArray(obj.data.sections[0].items)
    ) {
      // 清空第一项（如果需要保留此逻辑）
      obj.data.sections[0].items[0] = {};

      // 过滤掉 type 为 EDITORS_COVER_BANNER 的项目
      obj.data.sections[0].items = obj.data.sections[0].items.filter(
        item => item?.type !== "EDITORS_COVER_BANNER"
      );
    }
  }

  $done({ body: JSON.stringify(obj) });
} catch (e) {
  console.log("处理失败:", e);
  $done({});
}