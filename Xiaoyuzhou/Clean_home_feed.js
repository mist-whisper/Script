const url = $request.url;

if (!$response.body) {
  $done({});
}

try {
  let obj = JSON.parse($response.body);

  if (url.includes("/v1/discovery-feed/list")) {
    if (obj?.data && Array.isArray(obj.data) && obj.data.length > 0) {

      // ✅ 原逻辑：清空第一个元素
      obj.data[0] = {};

      // ✅ 新逻辑：过滤掉 type 为 EDITORS_COVER_BANNER 的项目
      obj.data = obj.data.filter(item => item?.type !== "EDITORS_COVER_BANNER");

      // ✅ 可选增强：如果你还想按 id 精准过滤，可添加如下逻辑
      // const blockedIds = ["68368946d751e070efd98f0a"];
      // obj.data = obj.data.filter(item => !blockedIds.includes(item?.id));
    }
  }

  $done({ body: JSON.stringify(obj) });
} catch (e) {
  console.log("处理失败:", e);
  $done({});
}