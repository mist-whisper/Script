// ==Loon/Surge 脚本==
if (typeof $response !== "undefined") {
    let obj = JSON.parse($response.body);

    // 保留精选、美网、世欧预，删除其他模块
    if (obj.resData && obj.resData.menuList) {
        obj.resData.menuList = obj.resData.menuList.filter(item =>
            item.menuName === "精选" ||
            item.menuName === "美网" ||
            item.menuName === "世欧预"
        );
    }

    // 输出修改后的响应
    $done({ body: JSON.stringify(obj) });
} else {
    $done({});
}