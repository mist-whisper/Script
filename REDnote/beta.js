// 小红书去限制脚本 - 最终版
// 适用于 Loon 和 Surge
// 匹配: /api/sns/v1/note/imagefeed

let body = $response.body;
let obj;

if (!body) {
  console.log("❌ 响应体为空");
  $done({});
}

try {
  obj = JSON.parse(body);
  console.log("✅ JSON解析成功");
} catch (e) {
  console.log("❌ JSON解析失败: " + e);
  console.log("响应体长度: " + body.length);
  console.log("响应体预览: " + body.substring(0, 200));
  $done({});
}

if (obj && obj.success && obj.data) {
  try {
    let modified = false;
    
    // 遍历数据
    obj.data.forEach(item => {
      // 处理笔记列表
      if (item.note_list && Array.isArray(item.note_list)) {
        item.note_list.forEach(note => {
          
          // 1. 开启图片下载
          if (note.function_switch && Array.isArray(note.function_switch)) {
            note.function_switch.forEach(func => {
              if (func.type === "image_download" && !func.enable) {
                func.enable = true;
                func.reason = "";
                modified = true;
                console.log("✓ 已开启图片下载");
              }
            });
          }
          
          // 2. 去水印配置
          if (note.media_save_config) {
            if (!note.media_save_config.disable_watermark) {
              note.media_save_config.disable_save = false;
              note.media_save_config.disable_watermark = true;
              note.media_save_config.disable_weibo_cover = true;
              modified = true;
              console.log("✓ 已去除水印");
            }
          }
          
          // 3. 开启文字复制
          if (note.note_text_press_options !== undefined) {
            if (!note.note_text_press_options.length || 
                !note.note_text_press_options.some(opt => opt.type === "copy")) {
              note.note_text_press_options = [
                { "type": "copy", "name": "复制" }
              ];
              modified = true;
              console.log("✓ 已开启文字复制");
            }
          }
          
          // 4. 长按保存图片
          if (note.long_press_share_info && note.long_press_share_info.function_entries) {
            const hasDownload = note.long_press_share_info.function_entries.some(
              entry => entry.type === "image_download"
            );
            if (!hasDownload) {
              note.long_press_share_info.function_entries.unshift({
                type: "image_download"
              });
              modified = true;
              console.log("✓ 已添加长按保存");
            }
          }
          
          // 5. 解除评论限制
          if (note.comment_prompt_config && note.comment_prompt_config.forbidden_cmt_type !== 0) {
            note.comment_prompt_config.forbidden_cmt_type = 0;
            modified = true;
            console.log("✓ 已解除评论限制");
          }
        });
      }
      
      // 6. 处理评论列表
      if (item.comment_list && Array.isArray(item.comment_list)) {
        item.comment_list.forEach(comment => {
          if (comment.note_text_press_options !== undefined) {
            if (!comment.note_text_press_options.length) {
              comment.note_text_press_options = [
                { "type": "copy", "name": "复制" }
              ];
              modified = true;
            }
          }
        });
      }
    });
    
    if (modified) {
      body = JSON.stringify(obj);
      console.log("🎉 小红书脚本执行成功，已修改限制");
    } else {
      console.log("ℹ️ 未发现需要修改的限制");
    }
    
    $done({ body });
    
  } catch (e) {
    console.log("❌ 修改数据时出错: " + e);
    $done({});
  }
} else {
  console.log("⚠️ 数据结构不匹配");
  $done({});
}