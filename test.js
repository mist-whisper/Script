if (typeof $response !== "undefined" && $response.body) {
    let body = JSON.parse($response.body);

    // 如果有热搜词数组，清空它
    if (body.data && body.data.wordList) {
        body.data.wordList = [];
    }

    $done({ body: JSON.stringify(body) });
} else {
    // 如果不是拦截响应，直接返回空数据
    $done({ body: "{}" });
}