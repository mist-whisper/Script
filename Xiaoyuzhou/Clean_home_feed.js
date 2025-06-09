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

      // ⚠️ 不再清空 obj.data[0]，避免破坏 UI 或加载逻辑
    }
  }

  $done({ body: JSON.stringify(obj) });
} catch (e) {
  console.log("处理失败:", e.message);
  $done({});
}