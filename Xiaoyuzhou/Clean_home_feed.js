// clean_home_feed.js：净化首页模块，包括播客寻宝、分类、朋友在听、付费精品节目单等

let body = $response.body;
let obj = JSON.parse(body);

// 待过滤的标题关键词
const filteredTitles = ["分类", "朋友在听", "新节目广场", "付费精品节目单"];

if (Array.isArray(obj.data)) {
  obj.data = obj.data.filter(module => {
    // 只处理顶部横向卡片类型
    if (module.type === "DISCOVERY_HEADER" && Array.isArray(module.data)) {
      module.data = module.data.filter(item => {
        const title = item.rightContent?.text || "";
        const url = item.url || "";
        const titleOk = !filteredTitles.includes(title);
        const urlOk = !url.includes("podcast-newforce-collection");
        return titleOk && urlOk;
      });

      // 如果过滤后已空，移除整个模块
      return module.data.length > 0;
    }

    return true; // 保留其他模块
  });
}

$done({ body: JSON.stringify(obj) });
