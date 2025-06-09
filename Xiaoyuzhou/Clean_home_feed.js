const url = $request.url;
const body = $response.body;

// 无响应体时直接结束，放行原始数据
if (!body) {
  $done({});
}

try {
  // 解析响应 JSON
  /** 
   * @typedef {Object} FeedItem
   * @property {string} [type]
   * @property {string} [title]
   * @property {string} [image_url]
   * @property {any}    [other]  // 其它动态字段
   * 
   * @typedef {Object} FeedResponse
   * @property {FeedItem[]} [data]
   * @property {any}        [other]
   */
  /** @type {FeedResponse} */
  const obj = JSON.parse(body);

  // 精准匹配 /v1/discovery-feed/list 路径（含？或结尾）
  const feedListRegex = /\/v1\/discovery-feed\/list(\?|$)/;
  if (feedListRegex.test(url) && Array.isArray(obj.data)) {
    // 黑名单关键词，根据需求动态增删
    const blacklist = ["banner", "ad", "promo", "sponsored"];

    // 性能控制：最大检查项数（超过时直接保留不检查）
    const maxCheck = 500;

    obj.data = obj.data.filter((item, index) => {
      // 若数据量过大，跳过后续检查
      if (index >= maxCheck) return true;

      // 将整个条目序列化并小写，以检测任意字段中的关键字
      const text = JSON.stringify(item).toLowerCase();

      // 若包含任意黑名单关键词，则过滤掉
      return !blacklist.some(key => text.includes(key));
    });

    // 完全删除首条（避免空白占位）
    // if (obj.data.length > 0) {
    //   obj.data.shift();
    // }

    // 插入自定义占位条目，防止 UI 空白
    // obj.data.unshift({ type: "PLACEHOLDER", title: "—— 无广告占位 ——" });
  }

  // 返回修改后结果
  $done({ body: JSON.stringify(obj) });
} catch (e) {
  // 出错时记录日志并放行原始数据
  console.log("去广告脚本处理失败:", e.message);
  $done({});
}