/*
 * Kuwo 波点小镇入口屏蔽
 * 目标接口: /api/ucenter/setting/privacy/all
 */

let body = $response.body;

try {
  let obj = JSON.parse(body);

  if (obj && obj.data && obj.data.town !== undefined) {
    console.log("波点小镇原始值: " + obj.data.town);
    obj.data.town = 0; // 屏蔽入口
    console.log("波点小镇已修改为: " + obj.data.town);
  }

  body = JSON.stringify(obj);
} catch (e) {
  console.log("波点小镇脚本出错: " + e);
}

$done({ body });