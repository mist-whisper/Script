/*
  [Script]
  ^https?:\/\/api\.example\.com\/global-config url script-response-body remove-ai-config.loon.js
  (根据实际API地址修改域名和路径)
*/

// 定义需要移除的 AI 相关配置键
const AI_KEYS = new Set([
  "chat_ai_partner_placeholder",
  "chat_aigc_identity_config",
  "aigc_identity_config",
  "chat_aigc_open_max_time",
  "chat_aigc_2_hide_beta_icon",
  "ai_patainer_config_switch",
  "chatlist_virtualman_session_entrance_info",
  "officialTagAiConfig"
]);

// 处理响应内容
if (typeof $response !== "undefined") {
  let body = JSON.parse($response.body);
  
  // 删除 globalConfig 中的 AI 键
  if (body.data?.globalConfig) {
    Object.keys(body.data.globalConfig).forEach(key => {
      if (AI_KEYS.has(key)) {
        delete body.data.globalConfig[key];
      }
    });
  }
  
  // 可选：关闭相关开关（如果需要保留键）
  // body.data.globalConfig.ai_patainer_config_switch = "0"; 
  
  // 返回修改后的内容
  $done({ body: JSON.stringify(body) });
} else {
  $done({});
}