let body = $response.body;
let obj = JSON.parse(body);

// 遍历所有项目
const games = obj?.data?.games || [];

for (const game of games) {
  for (const microGame of game.microGames || []) {
    const aiModes = microGame?.leftIcon?.info?.aimodes || [];

    for (const mode of aiModes) {
      // 匹配语音陪跑功能
      if (mode.aiMode === "audioGuide") {
        mode.support = true;          // 显示为支持
        mode.check = true;            // 模拟已启用
        mode.fallbackPopup = null;    // 移除升级弹窗
        mode.focusOption = "normal";  // 默认选项设置

        // 伪装为会员激活状态（如果有事件追踪逻辑）
        if (Array.isArray(mode.playCardShowPluginOptionItems)) {
          for (const item of mode.playCardShowPluginOptionItems) {
            if (item.eventTrackMap) {
              item.eventTrackMap.prime_status = "active";
              item.eventTrackMap.type = "无限制";
              item.eventTrackMap.item_name = "无限次使用";
              item.eventTrackMap.prime_type_status = "{}";
            }
            item.limitFreeCount = null;
          }
        }
      }
    }
  }
}

$done({ body: JSON.stringify(obj) });