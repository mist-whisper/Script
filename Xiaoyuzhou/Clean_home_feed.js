const url = $request.url;
const body = $response.body;

if (!body) {
  $done({});
}

try {
  let obj = JSON.parse(body);

  if (url.includes("/v1/discovery-feed/list")) {
    if (Array.isArray(obj?.data)) {
      // 精准移除“听清信号的人”
      obj.data = obj.data.filter(item => {
        const isTarget =
          item?.id === "68368946d751e070efd98f0a" ||
          item?.voiceover === "听清信号的人" ||
          (item?.type === "EDITORS_COVER_BANNER" &&
           item?.url?.includes("collection.xiaoyuzhoufm.com/signal"));

        return !isTarget;
      });

      // 可选：清空第一项（如果仍需保留你原始逻辑）
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