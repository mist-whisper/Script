// Loon/Surge response-body-js
let body = $response.body;
if (body) {
    let obj = JSON.parse(body);
    if (obj.data && obj.data.moduleList) {
        // 移除 URL 包含 "putao" 的商城模块
        obj.data.moduleList = obj.data.moduleList.filter(item => !item.url || !item.url.includes("putao"));
    }
    $done({body: JSON.stringify(obj)});
} else {
    $done({});
}