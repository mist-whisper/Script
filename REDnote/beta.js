/*
 * 增强版小红书解锁脚本
 * 功能：解锁保存图片、恢复复制按钮
 * 修复：增加防崩溃处理，增加日志输出
 */

const url = $request.url;
const body = $response.body;

// 定义需要强制开启的菜单选项
const forceOptions = ["copy", "search", "share", "dislike", "report"];

try {
    // 1. 尝试解析 JSON。如果 Body 为空或格式不对，这里会直接跳到 catch，不会报错中断请求
    if (!body) throw new Error("Body is empty");
    let obj = JSON.parse(body);

    // 2. 定义处理单个笔记的函数
    const fixNote = (note) => {
        if (!note) return;

        // --- 核心修改 A: 恢复复制 ---
        // 无论原本有没有，强制覆盖为完整的菜单列表
        note.note_text_press_options = forceOptions;

        // --- 核心修改 B: 恢复图片下载 ---
        // 针对 function_switch (你的 JSON 里是这里禁止的)
        if (note.function_switch && Array.isArray(note.function_switch)) {
            note.function_switch.forEach(item => {
                if (item.type === "image_download") {
                    item.enable = true;
                    item.reason = ""; // 清空“作者已关闭”的提示
                }
            });
        }

        // --- 核心修改 C: 媒体保存配置 ---
        if (note.media_save_config) {
            note.media_save_config.disable_save = false;
            note.media_save_config.disable_watermark = false; // 保持 false 或 true 均可，主要看服务端鉴权
            note.media_save_config.disable_weibo_cover = false;
        }

        // --- 核心修改 D: 分享菜单 ---
        // 确保分享菜单里有 "generate_image"
        if (note.share_info && Array.isArray(note.share_info.function_entries)) {
            const hasSave = note.share_info.function_entries.some(e => e.type === "generate_image");
            if (!hasSave) {
                note.share_info.function_entries.push({ "type": "generate_image" });
            }
        }
    };

    // 3. 遍历数据 (针对你提供的 data -> [0] -> note_list 结构)
    if (obj.data && Array.isArray(obj.data)) {
        obj.data.forEach(dataItem => {
            if (dataItem.note_list && Array.isArray(dataItem.note_list)) {
                dataItem.note_list.forEach(note => fixNote(note));
            }
        });
    } 
    // 兼容其他可能的接口结构 (直接在 data 下)
    else if (obj.data && obj.data.note_list) {
         obj.data.note_list.forEach(note => fixNote(note));
    }

    // 4. 打印成功日志 (你可以在 Surge/Loon 的日志界面看到这个)
    console.log("✅ XHS Script Success: Note unlocked.");

    $done({ body: JSON.stringify(obj) });

} catch (e) {
    // 5. 错误捕获：如果解析失败，原样返回数据，保证 App 不会白屏或报错
    console.log("❌ XHS Script Error: " + e.message);
    $done({});
}
