/*
 * 名称: 发现页内容过滤脚本
 * 功能: 移除发现页的分类/社交/付费内容模块
 * 作者: 
 * 更新时间: 2025-05-08
 */

// ===================== 配置部分 =====================
// 需要过滤的 URL 特征 (按需修改)
const TARGET_URL = "/discovery"; 

// 需要排除的 URL 关键词 (按需修改)
const EXCLUDE_KEYWORDS = [
  "category",              // 分类
  "personalUpdateList",    // 朋友在听
  "apron",                 // 新节目广场
  "payPodcastRecommendation" // 付费内容
];

// ===================== 主逻辑 ===================== 
(() => {
  'use strict';
  
  // 仅处理目标请求
  if (!$request.url.includes(TARGET_URL)) {
    $done({});
    return;
  }

  try {
    // 解析原始响应体
    let originalBody = $response.body;
    let jsonData = JSON.parse(originalBody);
    
    // 遍历所有模块
    if (jsonData.data && Array.isArray(jsonData.data)) {
      jsonData.data = jsonData.data.map(module => {
        // 仅处理 DISCOVERY_HEADER 模块
        if (module.type === "DISCOVERY_HEADER") {
          // 过滤不需要的条目
          if (module.data && Array.isArray(module.data)) {
            module.data = module.data.filter(item => {
              // 检查 URL 是否包含排除关键词
              return !EXCLUDE_KEYWORDS.some(keyword => 
                item.url && item.url.includes(keyword)
            });
          }
        }
        return module; // 保留其他类型模块
      });
    }

    // 返回修改后的响应体
    $done({
      body: JSON.stringify(jsonData)
    });

  } catch (error) {
    // 异常处理
    console.log(`脚本执行失败: ${error.message}`);
    $done({}); // 返回原始响应
  }
})();

/* ===================== 注释说明 =====================
1. 脚本工作流程:
   匹配目标URL -> 解析JSON -> 过滤指定模块 -> 返回新数据

2. 安全机制:
   - try-catch 捕获所有异常
   - 严格模式 ('use strict') 避免意外错误
   - 类型检查 (Array.isArray)
   
3. 扩展建议:
   - 如需保留条目数量占位，可替换为空白数据
   - 可添加 debug 模式输出日志
   - 可组合多个过滤条件 (AND/OR 逻辑)
*/