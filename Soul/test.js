// Loon/Surge/QuanX 通用格式，拦截响应并移除 AI 相关字段
// 脚本用途：移除 aigc、ai_partner、AiReading 等字段

// ==UserScript==
// @name         Remove AI Configs
// @namespace    http://yourdomain.com
// @version      1.0
// @description  移除AI相关配置和免责声明，保留其他功能
// @author       GPT
// ==/UserScript==

if ($response?.body) {
  try {
    let obj = JSON.parse($response.body);
    const gc = obj?.data?.globalConfig;

    if (gc && typeof gc === 'object') {
      const patterns = [
        /aigc/i,
        /ai_partner/i,
        /officialTagAiConfig/i,
        /feature_ios_AiReading_Control/i,
      ];

      for (const key of Object.keys(gc)) {
        if (patterns.some(p => p.test(key))) {
          delete gc[key];
        }
      }
    }

    $done({ body: JSON.stringify(obj) });
  } catch (e) {
    console.log('Error cleaning AI configs:', e);
    $done({});
  }
} else {
  $done({});
}