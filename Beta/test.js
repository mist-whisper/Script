const excludeKeywords = ["category", "personalUpdateList", "apron", "payPodcastRecommendation"];

let body = $response.body;
try {
  let json = JSON.parse(body);
  json.data = json.data.map(section => {
    if (section.type === "DISCOVERY_HEADER") {
      section.data = section.data.filter(item => 
        !excludeKeywords.some(keyword => item.url.includes(keyword))
    }
    return section;
  });
  body = JSON.stringify(json);
} catch (e) {
  console.log("JSON处理失败:", e);
}
$done({ body });