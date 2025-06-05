const url = $request.url;
const body = $response.body;

if (!body) {
  $done({});
}

try {
  let obj = JSON.parse(body);

  if (url.includes("/v1/discovery-feed/list")) {
    if (Array.isArray(obj?.data)) {
      // 移除所有可能是广告或 banner 的项
      obj.data = obj.data.filter(item => {
        if (!item?.type) return true;
        return !item.type.includes("BANNER") && !item.type.includes("AD");
      });

      // 可选：清空第一项
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