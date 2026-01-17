/*
 * 脚本功能：小红书解锁图片保存与文字复制
 * 匹配 URL：^https?://edith\.xiaohongshu\.com/.*
 * 适用工具：Surge, Loon, Quantumult X, Stash
 */

var body = $response.body;
var url = $request.url;

try {
    var obj = JSON.parse(body);

    // 辅助函数：处理单个笔记对象
    const processNote = (note) => {
        // 1. 解锁图片下载 (针对 function_switch)
        if (note.function_switch) {
            note.function_switch.forEach(func => {
                if (func.type === "image_download") {
                    func.enable = true; // 强制开启
                    func.reason = "";   // 清空禁止原因
                }
            });
        }

        // 2. 恢复长按复制菜单
        // 如果字段不存在或为空，强制注入复制和搜索选项
        if (!note.note_text_press_options || note.note_text_press_options.length === 0) {
            note.note_text_press_options = ["copy", "search", "share"];
        }

        // 3. 强制允许保存配置 (双重保险)
        if (note.media_save_config) {
            note.media_save_config.disable_save = false;
            note.media_save_config.disable_watermark = true; // 尝试请求无水印
        }

        // 4. 解锁右键/分享菜单中的下载选项
        if (note.share_info && note.share_info.function_entries) {
            // 确保 generate_image (保存图片) 存在
            let hasDownload = note.share_info.function_entries.some(e => e.type === "generate_image");
            if (!hasDownload) {
                note.share_info.function_entries.push({"type": "generate_image"});
            }
        }
    };

    // 遍历数据结构
    if (obj.data) {
        // 结构通常为 data[0].note_list
        if (Array.isArray(obj.data)) {
            obj.data.forEach(item => {
                if (item.note_list) {
                    item.note_list.forEach(note => processNote(note));
                }
            });
        } 
        // 某些旧版本或不同接口可能是直接在 data 下
        else if (obj.data.note_list) {
            obj.data.note_list.forEach(note => processNote(note));
        }
    }

    $done({ body: JSON.stringify(obj) });

} catch (e) {
    // 如果解析失败，原样返回，避免断网
    console.log("XHS Script Error: " + e);
    $done({});
}