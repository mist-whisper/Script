const url = $request.url;
const body = $response.body;

if (!body) {
  $done({});
}

try {
  let obj = JSON.parse(body);

  if (url.includes("/v1/discovery-feed/list")) {
    if (Array.isArray(obj?.data)) {
      // 移除 type === "DISCOVERY_COVER_BANNER" 的项
      obj.data = obj.data.filter(item => item.type !== "DISCOVERY_COVER_BANNER");

      if (obj.data.length > 0) {
        obj.data[0] = {};
      }
    }
  }

  $done({ body: JSON.stringify(obj) });
} catch (e) {
  console.log("处理失败:", e.message);
  $done({});
}