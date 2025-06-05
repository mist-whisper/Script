const url = $request.url;

if (!$response.body) {
  $done({});
}

try {
  let obj = JSON.parse($response.body);

  if (url.includes("/v1/discovery-feed/list")) {
    if (obj?.data && Array.isArray(obj.data) && obj.data.length > 0) {

      // ✅ 原始逻辑：清空第一项
      obj.data[0] = {};

      // ✅ 新增逻辑：过滤掉 type 为 EDITORS_COVER_BANNER 的项
      const blockedTypes = ["EDITORS_COVER_BANNER"];
      obj.data = obj.data.filter(item => item?.type !== undefined && !blockedTypes.includes(item.type));
    }
  }

  $done({ body: JSON.stringify(obj) });
} catch (e) {
  console.log("处理失败:", e);
  $done({});
}