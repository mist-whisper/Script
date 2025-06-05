const url = $request.url;

if (!$response.body) {
  $done({});
}

try {
  let obj = JSON.parse($response.body);

  if (url.includes("/v1/discovery-feed/list")) {
    console.log("✅ 进入 discovery-feed/list 分支");

    if (obj?.data) {
      // 如果是数组
      if (Array.isArray(obj.data)) {
        console.log("🔎 obj.data 是数组，长度:", obj.data.length);
        if (obj.data.length > 0) {
          obj.data[0] = {};
          console.log("✅ 已清空 obj.data[0]");
        }
      }

      // 如果包含 sections
      if (Array.isArray(obj.data.sections)) {
        console.log("🔍 sections 数量:", obj.data.sections.length);
        obj.data.sections.forEach((section, index) => {
          if (Array.isArray(section.items)) {
            const originalLength = section.items.length;
            section.items = section.items.filter(item =>
              item?.id !== "68368946d751e070efd98f0a" && item?.type !== "EDITORS_COVER_BANNER"
            );
            const newLength = section.items.length;
            console.log(`📦 Section[${index}]: 从 ${originalLength} 项过滤到 ${newLength} 项`);
          }
        });
      } else {
        console.log("⚠️ obj.data.sections 不存在或不是数组");
      }
    } else {
      console.log("⚠️ obj.data 不存在");
    }
  }

  $done({ body: JSON.stringify(obj) });
} catch (e) {
  console.log("处理失败:", e);
  $done({});
}