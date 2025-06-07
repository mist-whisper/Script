/*
 * Soul++ 增强脚本 v2.1
 * 功能：精简 Soul 界面元素，支持布尔开关控制隐藏模块
 * 作者：wish
 */

let url = $request?.url;
let body = $response?.body;
if (!url || !body) $done({});

try {
  let obj = JSON.parse(body);

  // 布尔参数解析函数
  const parseBool = (value, defaultValue = false) => {
    if (value === undefined || value === null) return defaultValue;
    return String(value).toLowerCase() === "true";
  };

  // 统一读取隐藏开关
  const shouldHide = (paramName, defaultValue = false) => {
    return parseBool($argument?.[paramName], defaultValue);
  };

  // 路径判断
  const isPath = (keyword) => url.includes(keyword);

  if (isPath("/planet/config")) {
    // 🌍 星球实验室模块处理
    const hideSoulMatch = shouldHide("hideSoulMatch");
    const hideVoiceMatch = shouldHide("hideVoiceMatch");
    const hidePartyMatch = shouldHide("hidePartyMatch");
    const hideMasked = shouldHide("hideMasked");
    const hideMaskedMatch = shouldHide("hideMaskedMatch");
    const hidePlanet = shouldHide("hidePlanet");

    // sortId 映射表（核心功能卡片 ID）
    const FEATURE_IDS = {
      soulMatch: 1,
      voiceMatch: 2,
      partyMatch: 3,
      masked: 4,
      maskedMatch: 9,
      planet: 10,
    };

    // 构建应保留的 sortId 列表
    const visibleSortIds = [];
    if (!hideSoulMatch) visibleSortIds.push(FEATURE_IDS.soulMatch);
    if (!hideVoiceMatch) visibleSortIds.push(FEATURE_IDS.voiceMatch);
    if (!hidePartyMatch) visibleSortIds.push(FEATURE_IDS.partyMatch);
    if (!hideMasked) visibleSortIds.push(FEATURE_IDS.masked);
    if (!hideMaskedMatch) visibleSortIds.push(FEATURE_IDS.maskedMatch);
    if (!hidePlanet) visibleSortIds.push(FEATURE_IDS.planet);

    // 🌐 清理字段及过滤 coreCards
    if (Array.isArray(obj.data?.coreCards)) {
      obj.data.coreCards = obj.data.coreCards.filter(card =>
        visibleSortIds.includes(card.sortId)
      );

      obj.data.coreCards.forEach(card => {
        card.showLuckyBag = false;
        card.showRedMind = false;
        card.style = 1;
        delete card.bgImg;
        delete card.iconUrl;
      });
    }

    obj.data.showRedMind = false;
    obj.data.showLuckyBag = false;

    if (obj.data.chatRoomInfo) obj.data.chatRoomInfo.showChatRoom = false;
    if (obj.data.gameInfo) {
      obj.data.gameInfo.showGameCard = false;
      obj.data.gameInfo.gameCards = [];
    }
  }

  // 其他接口精简逻辑（与你原脚本一致，可酌情删改）
  else if (isPath("/chat/limitInfo")) {
    const fields = ["subMsg", "extMsg", "abValue", "freeEquityStatus", "msg", "remainFreeCount", "type"];
    fields.forEach(field => delete obj.data?.[field]);
    obj.data.limit = false;
  }

  else if (isPath("/chatroom/chatClassifyRoomList")) {
    obj.data.positionContentRespList = [];
  }

  else if (isPath("/square/header/tabs")) {
    if (Array.isArray(obj.data)) {
      obj.data.forEach(card => (card.unreadFlag = 0));
      obj.data = obj.data.filter(item => item.pageId === "PostSquare_Recommend");
    }
  }

  else if (isPath("/homepage/metrics")) {
    const d = obj.data;
    d.recentViewNum = 0;
    d.showTipsCard = false;
    d.showMetric = false;
    d.hasHomePageLiked = false;
    if (d.homePageLikedMetric) {
      d.homePageLikedMetric.addNum = 0;
      d.homePageLikedMetric.likedTotalNum = 0;
      d.homePageLikedMetric.hasShowHistoryDynamic = false;
    }
  }

  else if (isPath("relation/guideUserList")) {
    obj.data.userDTOList = [];
  }

  else if (isPath("/homepage/tabs/v2")) {
    obj.data.selectedTagPool = {};
    const hiddenTabs = ["STAR_TRAILS"];
    if (Array.isArray(obj.data.headTabDTOList)) {
      obj.data.headTabDTOList = obj.data.headTabDTOList.filter(t => !hiddenTabs.includes(t.tabCode));
    }
  }

  else if (isPath("/chatroom/getRoomTagInfo")) {
    const TAG_IDS = {
      hot: 11, all: 0, emotion: 43, personal: 44, play: 12,
      interest: 10, argue: 6, story: 5, chat: 4, heart: 2,
    };

    const visibleTagIds = [];
    for (let key in TAG_IDS) {
      if (!shouldHide(`hide${key.charAt(0).toUpperCase()}${key.slice(1)}Tag`)) {
        visibleTagIds.push(TAG_IDS[key]);
      }
    }

    if (Array.isArray(obj.data?.res)) {
      obj.data.res = obj.data.res.filter(t => visibleTagIds.includes(t.id));
      obj.data.res.forEach(tag => tag.iconConfig = null);
    }
  }

  else if (isPath("/snapchat/url")) {
    try {
      const imageUrl = obj.data?.url;
      if (typeof imageUrl === "string") {
        $notification.post("图片通知", "查看图片", "点击查看详情", {
          "open-url": imageUrl,
          "media-url": imageUrl,
        });
      }
    } catch (e) {
      console.log("图片处理错误: " + e.message);
    }
  }

  // 返回最终修改结果
  body = JSON.stringify(obj);
  $done({ body });

} catch (err) {
  console.log("脚本处理错误: " + err.message);
  $done({});
}