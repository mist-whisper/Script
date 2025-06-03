// 净化首页模块，包括播客寻宝、分类、朋友在听、付费精品节目单、听清信号的人等

const DEBUG = false; // 设置为 true 启用调试日志

let body = $response.body;

if (DEBUG) console.log("clean_home_feed.js 响应体长度: " + body.length);

// 判断是否为 JSON 响应
if (body.startsWith("{") || body.startsWith("[")) {
  try {
    let obj = JSON.parse(body);

    const filteredTitles = ["分类", "朋友在听", "新节目广场", "付费精品节目单", "听清信号的人"];

    if (Array.isArray(obj.data)) {
      obj.data = obj.data.filter(module => {
        if (module.type === "DISCOVERY_HEADER" && Array.isArray(module.data)) {
          module.data = module.data.filter(item => {
            const title = item.rightContent?.text || "";
            const url = item.url || "";
            const titleOk = !filteredTitles.includes(title);
            const urlOk = !url.includes("podcast-newforce-collection");

            if (DEBUG && (!titleOk || !urlOk)) {
              console.log(`已移除卡片：${title} | ${url}`);
            }

            return titleOk && urlOk;
          });

          return module.data.length > 0;
        }

        return true; // 保留其他模块
      });
    }

    $done({ body: JSON.stringify(obj) });
  } catch (e) {
    if (DEBUG) console.log("解析 JSON 失败：" + e.message);
    $done({});
  }
} else {
  if (DEBUG && body.includes("401 Authorization Required")) {
    console.log("接口返回 401 未授权 HTML");
  }
  $done({});
}