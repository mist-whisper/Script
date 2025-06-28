function removeAds(response) {
  try {
    // 1. 获取响应内容
    const body = response.body;
    if (!body) {
      console.log("⏩ 空响应体，跳过处理");
      return body;
    }
    
    // 2. 智能检测JSON内容（即使Content-Type不规范）
    const contentType = response.headers?.['Content-Type'] || 
                       response.headers?.['content-type'] || '';
    
    const isLikelyJSON = body.trim().startsWith('{') || 
                         body.trim().startsWith('[') ||
                         contentType.includes('json') ||
                         contentType.includes('text/plain');
    
    if (!isLikelyJSON) {
      console.log(`⏩ 跳过非JSON响应: ${contentType}`);
      return body;
    }
    
    // 3. 检查是否为目标API结构
    if (!body.includes('"objects"') || 
        !body.includes('"bizCode"') ||
        !body.includes('"OpenAPP-&-FlashAD"')) {
      console.log('⏩ 缺少必要字段，非目标API响应');
      return body;
    }
    
    // 4. 解析JSON
    let json = JSON.parse(body);
    
    // 5. 深度验证JSON结构
    if (json?.data?.objects) {
      // 安全移除广告项
      const adKeys = [
        "OpenAPP-&-FlashAD",
        "InTheaters-&-BoxAD"
      ];
      
      adKeys.forEach(key => {
        if (Array.isArray(json.data.objects[key])) {
          console.log(`✅ 成功移除广告项: ${key}`);
          json.data.objects[key] = [];
        }
      });
      
      return JSON.stringify(json);
    }
    
    console.log("⏩ JSON结构异常，跳过处理");
    return body;
  } catch (e) {
    console.log(`❌ JSON解析失败: ${e.message}`);
    return response.body;
  }
}

// 主处理流程
if (typeof $response !== "undefined") {
  const finalBody = removeAds($response);
  $done({ body: finalBody });
} else {
  console.log("⚠️ 未找到$response对象");
}