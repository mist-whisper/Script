let body = $response.body;
let obj = JSON.parse(body);

// 找到所有 games
const games = obj?.data?.games || [];

for (const game of games) {
  for (const microGame of game.microGames || []) {
    const aiModes = microGame?.leftIcon?.info?.aimodes || [];

    for (const mode of aiModes) {
      if (mode.aiMode === "run") {
        mode.support = true;
        mode.check = true;
        mode.fallbackPopup = null;

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