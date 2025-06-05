const url = $request.url;

// 若无响应体，直接返回空对象，避免崩溃
if (!$response.body) {
  $done({});
}

try {
  let obj = JSON.parse($response.body);

  // 匹配特定接口
  if (url.includes("/v1/discovery-feed/list")) {
    if (obj?.data && Array.isArray(obj.data)) {
      // 定义需要屏蔽的类型
      const blockedTypes = ["EDITORS_COVER_BANNER"];

      // 过滤掉对应类型的数据项
      obj.data = obj.data.filter(item => !blockedTypes.includes(item?.type));
    }
  }

  // 返回处理后的结果
  $done({ body: JSON.stringify(obj) });

} catch (e) {
  console.log("处理失败:", e);
  $done({});
}