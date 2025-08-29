const status = $response.status;
let headers = $response.headers;
const url = $request.url;

try {
    if (status === 302 && headers.hasOwnProperty('Location')) {

        const location = headers.Location;

        // ✅ 只处理指向 App Store 的跳转
        if (/\.apple\.com/.test(location)) {

            // 百度搜索页面：修复 tokenData 跳转
            if (/www\.baidu\.com/.test(url)) {
                let tokenData = getUrlParamValue(url, 'tokenData');
                if (tokenData) {
                    try {
                        let tokenDataObj = JSON.parse(decodeURIComponent(tokenData));
                        if (tokenDataObj.url) {
                            headers.Location = tokenDataObj.url;
                            console.log(`✅ 百度搜索修复 App Store → ${headers.Location}`);
                        } else {
                            console.log("⚠ tokenDataObj.url 缺失，保留原 Location");
                        }
                    } catch (e) {
                        console.log(`⚠ 解析 tokenData 出错: ${e}，保留原 Location`);
                    }
                } else {
                    console.log("ℹ 百度搜索未获取到 tokenData，保留原 Location");
                }

            // 百度贴吧：阻止 App Store 跳转
            } else if (/tieba\.baidu\.com/.test(url)) {
                headers.Location = url; // 保留当前网页
                console.log(`🚫 百度贴吧阻止跳转 App Store`);

            } else {
                // 其他 App Store 跳转，默认保留原跳转
                console.log("ℹ 其他 App Store 跳转，保留原 Location");
            }

        } else {
            // 非 App Store 跳转，不修改 headers
            console.log("ℹ 非 App Store URL，正常跳转");
        }

    } else {
        console.log("ℹ 非 302 跳转，无需处理");
    }

} catch (err) {
    console.log(`❌ 脚本异常: ${err}`);
}

// 返回 headers
$done({ headers });

// 工具函数：获取 URL 查询参数
function getUrlParamValue(url, queryName) {
    if (!url.includes("?")) return null;
    const params = Object.fromEntries(
        url.substring(url.indexOf("?") + 1)
           .split("&")
           .map(pair => pair.split("="))
    );
    return params[queryName] || null;
}
