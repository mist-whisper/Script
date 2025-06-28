function removeAds(response) {
  try {
    // 检查响应体长度是否合理
    if (!response.body || response.body.length < 200) {
      console.log(`⚠️ 响应体过短（${response.body.length}字节），跳过处理`);
      return response.body;
    }
    
    let json = JSON.parse(response.body);
    
    // 深度验证JSON结构
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
    } else {
      console.log("⚠️ JSON结构异常，跳过广告移除");
      return response.body;
    }
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