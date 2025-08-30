/*
 * Kuwo 波点小镇入口屏蔽
 * 修复 JSON 解析失败的问题
 */

let body = $response.body;

try {
  // 去掉可能的 BOM、前后空白
  body = body.trim().replace(/^\uFEFF/, '');

  let obj = JSON.parse(body);

  if (obj && obj.data) {
    if (obj.data.town !== undefined) {
      console.log("波点小镇原始值: " + obj.data.town);
      obj.data.town = 0; // 屏蔽入口
      console.log("波点小镇已修改为: " + obj.data.town);
    }

    // 如果需要，还可以关掉广告开关
    if (obj.data.personalizeAdvert !== undefined) {
      console.log("广告开关原始值: " + obj.data.personalizeAdvert);
      obj.data.personalizeAdvert = 0;
      console.log("广告开关已修改为: " + obj.data.personalizeAdvert);
    }
  }

  body = JSON.stringify(obj);
} catch (e) {
  console.log("波点小镇脚本出错: " + e);
  console.log("原始响应体: " + body); // 打印原始内容，方便调试
}

$done({ body });