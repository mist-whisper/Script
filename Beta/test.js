/**
 * @supported Loon, Surge, Quantumult X
 * @name    精简首页模块
 * @desc    去除“分类”、“朋友在听”和“付费精品节目单”模块
 * @url     https://api.example.com/discovery/home     // ← 替换为实际接口
 * @hostname api.example.com                           // ← 替换为实际域名
 */

(function() {
  // 1. 解析原始响应体
  let body = $response.body;
  let obj;
  try {
    obj = JSON.parse(body);
  } catch (e) {
    // 解析失败时直接返回原始数据
    return $done({});
  }

  // 2. 只处理顶层 data 数组
  if (Array.isArray(obj.data)) {
    obj.data = obj.data
      // 对每个模块单独处理
      .map(section => {
        // 仅针对“发现页头部”（DISCOVERY_HEADER）类型进行内部过滤
        if (section.type === "DISCOVERY_HEADER" && Array.isArray(section.data)) {
          // 3. 过滤掉不需要的条目
          section.data = section.data.filter(item => {
            // 取出右侧文字
            let txt = item.rightContent && item.rightContent.text;
            // 若匹配以下任一，则剔除
            return !(
              txt === "分类" ||
              txt === "朋友在听" ||
              txt === "付费精品节目单"
            );
          });
          // 过滤后如果为空，则返回 null，后续会被剔除
          return section.data.length > 0 ? section : null;
        }
        // 其他类型原样保留
        return section;
      })
      // 将被标为 null 的模块剔除
      .filter(s => s !== null);
  }

  // 4. 返回修改后的响应
  $done({
    body: JSON.stringify(obj)
  });
})();
