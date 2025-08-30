let body = $response.body;
try {
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
  console.log("脚本出错:", e);
}

$done({ body });