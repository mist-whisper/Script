const url = $request.url;

if (!$response.body) {
  $done({});
}

try {
  let obj = JSON.parse($response.body);

  if (url.includes("/v1/discovery-feed/list")) {
    if (obj && Array.isArray(obj.data)) {
      // 打印原始数据确认结构
      console.log("原始数据项数量:", obj.data.length);

      // 打印每项 type，确保能看到 EDITORS_COVER_BANNER
      obj.data.forEach((item, index) => {
        console.log(`第${index}项 type:`, item?.type);
      });

      // ✅ 清空第一项（保留原始行为）
      obj.data[0] = {};

      // ✅ 过滤 EDITORS_COVER_BANNER 项
      obj.data = obj.data.filter(item => item?.type !== "EDITORS_COVER_BANNER");

      console.log("过滤后数据项数量:", obj.data.length);
    } else {
      console.log("obj.data 不是数组，结构为：", JSON.stringify(obj));
    }
  }

  $done({ body: JSON.stringify(obj) });
} catch (e) {
  console.log("处理失败:", e);
  $done({});
}