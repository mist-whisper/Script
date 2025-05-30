/**
 * remove_member_api.js
 * Loon Script-Response-Body 脚本
 *
 * 功能：
 *  1. 拦截会员入口接口 https://api.xiaoyuzhoufm.com/v1/membership/platform/app-entry
 *  2. 删除整个 data 模块（包括 messages、button、link、memberType 等）
 *     防止前端拿到任何会员相关数据
 *
 * 使用配置（放在 Loon 配置文件的 [Script] 段）：
 *   ^https?:\/\/api\.xiaoyuzhoufm\.com\/v1\/membership\/platform\/app-entry url script-response-body remove_member_api.js
 */
(function() {
  let body = $response.body;
  try {
    let obj = JSON.parse(body);
    if (obj.data) {
      // 删除整个 data 对象
      delete obj.data;
    }
    body = JSON.stringify(obj);
  } catch (e) {
    console.warn("remove_member_api.js 执行异常：", e);
  }
  $done({ body });
})();