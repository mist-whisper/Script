// 小红书去限制脚本 - 完整版
// 适用于 Loon 和 Surge
// 功能：解除图片下载限制 + 开启文字复制

const url = $request.url;
let body = $response.body;

if (body) {
  try {
    let obj = JSON.parse(body);
    
    // 处理笔记数据
    if (obj.data && Array.isArray(obj.data)) {
      obj.data.forEach(item => {
        if (item.note_list && Array.isArray(item.note_list)) {
          item.note_list.forEach(note => {
            
            // 1. 开启图片下载功能
            if (note.function_switch && Array.isArray(note.function_switch)) {
              note.function_switch.forEach(func => {
                if (func.type === "image_download") {
                  func.enable = true;
                  func.reason = "";
                }
              });
            }
            
            // 2. 修改媒体保存配置（去水印）
            if (note.media_save_config) {
              note.media_save_config.disable_save = false;
              note.media_save_config.disable_watermark = true;
              note.media_save_config.disable_weibo_cover = true;
            }
            
            // 3. 开启文字复制功能
            if (note.note_text_press_options) {
              note.note_text_press_options = [
                {
                  "type": "copy",
                  "name": "复制"
                }
              ];
            }
            
            // 4. 添加图片下载到长按菜单
            if (note.long_press_share_info && note.long_press_share_info.function_entries) {
              const hasDownload = note.long_press_share_info.function_entries.some(
                entry => entry.type === "image_download"
              );
              if (!hasDownload) {
                note.long_press_share_info.function_entries.unshift({
                  type: "image_download"
                });
              }
            }
            
            // 5. 确保评论可以复制
            if (note.comment_prompt_config) {
              note.comment_prompt_config.forbidden_cmt_type = 0;
            }
          });
        }
        
        // 6. 处理评论列表的复制功能
        if (item.comment_list && Array.isArray(item.comment_list)) {
          item.comment_list.forEach(comment => {
            if (comment.note_text_press_options !== undefined) {
              comment.note_text_press_options = [
                {
                  "type": "copy",
                  "name": "复制"
                }
              ];
            }
          });
        }
      });
    }
    
    body = JSON.stringify(obj);
    console.log("小红书脚本执行成功");
  } catch (e) {
    console.log("小红书脚本错误: " + e);
  }
}

$done({ body });