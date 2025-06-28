function removeAds(response) {
  try {
    // 1. 检查Content-Type是否为JSON
    const contentType = response.headers?.['Content-Type'] || 
                       response.headers?.['content-type'] || '';
                       
    if (!contentType.includes('application/json')) {
      console.log(`⏩ 跳过非JSON响应: ${contentType}`);
      return response.body;
    }
    
    // 2. 检查响应体长度是否合理
    if (!response.body || response.body.length < 500) {
      console.log(`⏩ 响应体过短（${response.body?.length || 0}字节），跳过处理`);
      return response.body;
    }
    
    // 3. 检查是否包含必要字段
    if (!response.body.includes('"objects"') || 
        !response.body.includes('"bizCode"')) {
      console.log('⏩ 缺少必要字段，非目标API响应');
      return response.body;
    }
    
    let json = JSON.parse(response.body);
    
    // 4. 深度验证JSON结构
    if (json?.data?.objects) {
      // 安全移除广告项
      const adKeys = [
        "OpenAPP-&-FlashAD",
        "InTheaters-&-BoxAD"
      ];
      
      adKeys.forEach(key => {
        if (Array.isArray(json.data.objects[key])) {
          console.log(`✅ 移除广告项: ${key}`);
          json.data.objects[key] = [];
        }
      });
      
      return JSON.stringify(json);
    }
    
    console.log("⏩ JSON结构异常，跳过处理");
    return response.body;
  } catch (e) {
    console.log(`❌ 处理失败: ${e.message}`);
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