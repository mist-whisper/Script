let body = $response.body;

try {
  // 如果 body 是数组（数字 ASCII），先转字符串
  if (Array.isArray(body)) {
    body = String.fromCharCode.apply(null, body);
  }

  // 如果 body 是对象，先序列化
  if (typeof body === "object") {
    body = JSON.stringify(body);
  }

  console.log("原始响应体长度:", body.length);

  let obj = JSON.parse(body);

  if (obj && obj.data) {
    if (obj.data.downloadAdvert !== undefined) {
      console.log("原始 downloadAdvert:", obj.data.downloadAdvert);
      obj.data.downloadAdvert = 0;
      console.log("已修改 downloadAdvert:", obj.data.downloadAdvert);
    }
    if (obj.data.showAd !== undefined) {
      console.log("原始 showAd:", obj.data.showAd);
      obj.data.showAd = 0;
      console.log("已修改 showAd:", obj.data.showAd);
    }
    body = JSON.stringify(obj);
  }
} catch (e) {
  console.log("脚本出错:", e.message);
  console.log("原始响应体:", body);
}

$done({ body });