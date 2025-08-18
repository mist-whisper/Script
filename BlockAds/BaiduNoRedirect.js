const method = $request.method;
const url = $request.url;
const status = $response.status;
let headers = $response.headers;
const notifiTitle = "百度搜索防跳转AppStore错误";

try {
    if (method === "GET" && status === 302 && headers.hasOwnProperty('Location')) {
        if (headers.Location.includes('.apple.com')) {
            let tokenData = getUrlParamValue(url, 'tokenData');
            if (tokenData) {
                try {
                    let tokenDataObj = JSON.parse(decodeURIComponent(tokenData));
                    if (tokenDataObj.url) {
                        headers.Location = tokenDataObj.url;
                        console.log(`修复跳转成功 → ${headers.Location}`);
                    } else {
                        console.log("tokenDataObj.url 缺失，保留原 Location");
                    }
                } catch (e) {
                    console.log(`解析 tokenData 出错: ${e}`);
                }
            } else {
                console.log("未获取到 tokenData，保留原 Location");
            }
        } else {
            console.log("非 AppStore 跳转，无需修改 Location");
        }
    } else {
        console.log(`请求无需处理: method=${method}, status=${status}, url=${url}`);
    }
} catch (err) {
    console.log(`脚本异常: ${err}`);
}

$done({ headers });

function getUrlParamValue(url, queryName) {
    if (!url.includes("?")) return null;
    return Object.fromEntries(
        url.substring(url.indexOf("?") + 1)
           .split("&")
           .map(pair => pair.split("="))
    )[queryName];
}
