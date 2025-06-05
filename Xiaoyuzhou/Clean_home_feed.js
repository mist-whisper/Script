const url = $request.url;

if (!$response.body) {
  $done({});
}

try {
  let obj = JSON.parse($response.body);

  if (url.includes("/v1/discovery-feed/list")) {
    if (Array.isArray(obj.data)) {
      const originalLength = obj.data.length;

      // 过滤所有包含"听清信号的人"的项
      obj.data = obj.data.filter(item => {
        // 可根据 type 或 id 或 voiceover 精准匹配
        return item?.id !== "68368946d751e070efd98f0a" &&
               item?.type !== "EDITORS_COVER_BANNER" &&
               item?.voiceover !== "听清信号的人";
      });

      const newLength = obj.data.length;
      console.log(`✅ 过滤 obj.data: 从 ${originalLength} 项变为 ${newLength} 项`);
    } else {
      console.log("⚠️ obj.data 不是数组");
    }
  }

  $done({ body: JSON.stringify(obj) });
} catch (e) {
  console.log("处理失败:", e);
  $done({});
}