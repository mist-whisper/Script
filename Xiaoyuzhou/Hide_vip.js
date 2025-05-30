/**
 * remove_member.js
 * Loon Script-Response-Body 脚本
 *
 * 功能：拦截小宇宙会员接口的 JSON 响应，删除整个 data 模块（会员权益卡片等）  
 * 使用方式：在 Loon 配置的 [Script] 段添加对应的 URL 规则，指向本脚本文件
 */

(function() {
  // 1. 获取原始响应体字符串
  let body = $response.body;

  try {
    // 2. 将 JSON 字符串解析成 JS 对象
    let obj = JSON.parse(body);

    // 3. 检查 data 字段是否存在
    if (obj.data) {
      // —— 整块移除会员模块 —— 
      delete obj.data;

      // —— 或者按需精细化删除字段 —— 
      // delete obj.data.messages;
      // delete obj.data.button;
      // delete obj.data.link;
      // delete obj.data.showRenewal;
      // delete obj.data.memberType;
    }

    // 4. 把修改后的对象重新 stringify 为 JSON 字符串
    body = JSON.stringify(obj);
  } catch (e) {
    // JSON 解析或操作失败时，打印警告（不影响页面正常加载原始响应）
    console.warn("remove_member.js 脚本执行失败：", e);
  }

  // 5. 返回修改后的响应体
  $done({ body });
})();