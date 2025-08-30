/*
 * Kuwo 波点小镇入口屏蔽
 * 解决 body 为字节数组的问题
 */

let body = $response.body;

try {
  // 如果 body 是数组/字节，需要转成字符串
  if (typeof body !== "string") {
    body = String.fromCharCode.apply(null, body);
  }

  let obj = JSON.parse(body);

  if (obj && obj.data) {
    if (obj.data.town !== undefined) {
      console.log("波点小镇原始值: " + obj.data.town);
      obj.data.town = 0;
      console.log("波点小镇已修改为: " + obj.data.town);
    }

    if (obj.data.personalizeAdvert !== undefined) {
      console.log("广告开关原始值: " + obj.data.personalizeAdvert);
      obj.data.personalizeAdvert = 0;
      console.log("广告开关已修改为: " + obj.data.personalizeAdvert);
    }
  }

  body = JSON.stringify(obj);
} catch (e) {
  console.log("波点小镇脚本出错: " + e);
}

$done({ body });