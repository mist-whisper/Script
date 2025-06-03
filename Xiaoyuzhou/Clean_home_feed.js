// 友情感谢怎么肥事的优化

const url = $request.url;

if (!$response.body) {
  $done({});
}

try {
  let obj = JSON.parse($response.body);

  if (url.includes("/v1/discovery-feed/list")) {
    if (obj?.data && Array.isArray(obj.data) && obj.data.length > 0) {
      obj.data[0] = {}; 
    }
  }

  $done({ body: JSON.stringify(obj) });
} catch (e) {
  console.log("处理失败:", e);
  $done({});
}