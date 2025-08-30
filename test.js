if (typeof $response !== "undefined" && $response.body) {
    let body = JSON.parse($response.body);

    if (body.data && body.data.moduleList) {
        // 过滤掉包含商城内容的模块
        body.data.moduleList = body.data.moduleList.filter(item => {
            return !item.name.includes("周边商品") && !item.name.includes("爱豆淘") && !item.name.includes("实体专辑畅销榜") && !item.name.includes("推荐商品");
        });
    }

    $done({ body: JSON.stringify(body) });
} else {
    $done({});
}