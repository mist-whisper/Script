// !author = 怎么肥事   2025/5/4

let body = $response.body;

try {
    let obj = JSON.parse(body);
    let imageUrl = obj?.data?.url;

    if (imageUrl && typeof imageUrl === 'string') {
        console.log("图片地址: " + imageUrl);

         $notification.post("图片预览", "点击跳转浏览器", imageUrl, {
            "media-url": imageUrl,
            "open-url": imageUrl
        });

        var attach = {  
                "openUrl":"loon://switch",
                "mediaUrl":imageUrl,
                "clipboard":"图片通知已接收"
        }
        // 调用$notification.post方法发送通知
           // $notification.post("图片通知", "查看图片", "点击查看详情", attach);
    }
} catch (e) {
    console.log("处理图片预览出错：" + e);
}

$done({ body });
