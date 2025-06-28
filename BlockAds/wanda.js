function removeAds(response) {
  try {
    let json = JSON.parse(response.body);
    
    // 检查是否存在广告数据路径
    if (json?.data?.objects) {
      // 清空广告数组
      json.data.objects["OpenAPP-&-FlashAD"] = [];
      json.data.objects["InTheaters-&-BoxAD"] = [];
    }
    
    // 返回修改后的JSON
    return JSON.stringify(json);
  } catch (e) {
    console.log("广告移除失败: " + e);
    return response.body; // 出错时返回原始内容
  }
}

// Loon/Surge 响应处理
const modifiedBody = removeAds($response);
$done({ body: modifiedBody });