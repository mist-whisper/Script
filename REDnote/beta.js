/*
 * 脚本功能：小红书解锁图片保存与文字复制 (增强防报错版)
 * 匹配 URL：^https?://edith\.xiaohongshu\.com/.*
 * 更新日志：增加了 Content-Type 检查，防止因解析 Protobuf 或图片导致的 JSON Error
 */

var body = $response.body;
var headers = $response.headers;

// 辅助函数：获取 Header 值（兼容大小写）
function getHeader(headers, key) {
    if (!headers) return null;
    return headers[key] || headers[key.toLowerCase()] || headers[key.toUpperCase()];
}

// 1. 安全检查：如果 Body 为空，直接结束
if (!body) {
    $done({});
}

// 2. 类型检查：只有当 Content-Type 包含 json 时才尝试解析
// 这一步能过滤掉 Protobuf、图片、HTML 等导致报错的数据
var contentType = getHeader(headers, "Content-Type") || "";
if (contentType.indexOf("application/json") === -1) {
    // console.log("XHS Script: Skipped non-JSON response (" + contentType + ")");
    $done({}); // 原样返回，不做处理
}

try {
    var obj = JSON.parse(body);

    // 辅助函数：处理单个笔记对象
    const processNote = (note) => {
        // 1. 解锁图片下载
        if (note.function_switch) {
            note.function_switch.forEach(func => {
                if (func.type === "image_download") {
                    func.enable = true;
                    func.reason = "";
                }
            });
        }

        // 2. 恢复长按复制菜单
        if (!note.note_text_press_options || note.note_text_press_options.length === 0) {
            note.note_text_press_options = ["copy", "search", "share"];
        }

        // 3. 强制允许保存配置
        if (note.media_save_config) {
            note.media_save_config.disable_save = false;
            note.media_save_config.disable_watermark = true;
        }

        // 4. 解锁分享菜单下载
        if (note.share_info && note.share_info.function_entries) {
            let hasDownload = note.share_info.function_entries.some(e => e.type === "generate_image");
            if (!hasDownload) {
                note.share_info.function_entries.push({"type": "generate_image"});
            }
        }
    };

    // 遍历逻辑
    if (obj.data) {
        if (Array.isArray(obj.data)) {
            obj.data.forEach(item => {
                if (item.note_list) item.note_list.forEach(processNote);
            });
        } else if (obj.data.note_list) {
            obj.data.note_list.forEach(processNote);
        } else if (obj.data.note_list_v2) { // 兼容部分新接口
            obj.data.note_list_v2.forEach(processNote);
        }
    }

    $done({ body: JSON.stringify(obj) });

} catch (e) {
    // 依然捕获错误，但因为前面加了 Content-Type 检查，这里的触发率会大幅降低
    // 只有当服务器返回了 JSON Header 但内容却是坏的时候才会触发
    console.log("XHS Processing Error: " + e);
    $done({});
}
