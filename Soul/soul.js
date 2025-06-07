/*
 * Soul++ 增强脚本 - 优化版
 * 功能：精简 Soul 应用界面，移除干扰元素
 * 说明：通过 URL 匹配与参数开关进行模块精简
 * 作者：树先生
 * 更新时间：2025-06-07
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

  // 是否隐藏模块（通过参数名判断）
  const shouldHide = (paramName, defaultValue = false) => {
    return parseBool($argument?.[paramName], defaultValue);
  };

  // URL 路径匹配工具函数
  const isPath = (keyword) => url.includes(keyword);

  /* ---------- 模块匹配处理 ---------- */

  if (isPath("/chat/limitInfo")) {
    // 聊天限制信息精简
    const data = obj.data || {};
    ["subMsg", "extMsg", "abValue", "freeEquityStatus", "msg", "remainFreeCount", "type"].forEach(k => delete data[k]);
    data.limit = false;

  } else if (isPath("/planet/config")) {
    // 星球主界面入口卡片处理

    const hideSoulMatch = shouldHide("hideSoulMatch");
    const hideVoiceMatch = shouldHide("hideVoiceMatch");
    const hidePartyMatch = shouldHide("hidePartyMatch");
    const hideMasked = shouldHide("hideMasked");
    const hideMaskedMatch = shouldHide("hideMaskedMatch");
    const hidePlanet = shouldHide("hidePlanet");

    // 功能 ID 映射
    const FEATURE_IDS = {
      soulMatch: 1,
      voiceMatch: 2,
      partyMatch: 3,
      masked: 4,
      maskedMatch: 9,
      planet: 10
    };

    // 要保留的卡片 sortId 列表
    const visibleFeatures = [];
    if (!hideSoulMatch) visibleFeatures.push(FEATURE_IDS.soulMatch);
    if (!hideVoiceMatch) visibleFeatures.push(FEATURE_IDS.voiceMatch);
    if (!hidePartyMatch) visibleFeatures.push(FEATURE_IDS.partyMatch);
    if (!hideMasked) visibleFeatures.push(FEATURE_IDS.masked);
    if (!hideMaskedMatch) visibleFeatures.push(FEATURE_IDS.maskedMatch);
    if (!hidePlanet) visibleFeatures.push(FEATURE_IDS.planet);

    // 通用功能开关
    obj.data.showRedMind = false;
    obj.data.chatRoomInfo = obj.data.chatRoomInfo || {};
    obj.data.chatRoomInfo.showChatRoom = false;
    obj.data.gameInfo = obj.data.gameInfo || {};
    obj.data.gameInfo.showGameCard = false;
    obj.data.showLuckyBag = false;

    // 过滤主卡片 coreCards
    if (Array.isArray(obj.data.coreCards)) {
      obj.data.coreCards = obj.data.coreCards.filter(card =>
        visibleFeatures.includes(card.sortId)
      );

      obj.data.coreCards.forEach(card => {
        card.showLuckyBag = false;
        card.showRedMind = false;
        card.style = 1;
        delete card.bgImg;
        delete card.iconUrl;
      });
    }

    // 清空游戏卡片
    obj.data.gameInfo.gameCards = [];

  } else if (isPath("/chatroom/chatClassifyRoomList")) {
    // 派对首页广告横幅
    obj.data.positionContentRespList = [];

  } else if (isPath("/square/header/tabs")) {
    // 广场顶部标签页
    if (Array.isArray(obj.data)) {
      obj.data.forEach(tab => tab.unreadFlag = 0);
      obj.data = obj.data.filter(tab => tab.pageId === "PostSquare_Recommend");
    }

  } else if (isPath("/homepage/metrics")) {
    // 主页推荐信息、点赞等
    const metrics = obj.data || {};
    metrics.recentViewNum = 0;
    metrics.showTipsCard = false;
    metrics.showMetric = false;
    metrics.hasHomePageLiked = false;
    if (metrics.homePageLikedMetric) {
      metrics.homePageLikedMetric.addNum = 0;
      metrics.homePageLikedMetric.likedTotalNum = 0;
      metrics.homePageLikedMetric.hasShowHistoryDynamic = false;
    }

  } else if (isPath("relation/guideUserList")) {
    // 引导用户推荐
    obj.data.userDTOList = [];

  } else if (isPath("/homepage/tabs/v2")) {
    // 主页标签页隐藏
    obj.data.selectedTagPool = {};
    const HIDDEN_TABS = ["STAR_TRAILS"];
    if (Array.isArray(obj.data.headTabDTOList)) {
      obj.data.headTabDTOList = obj.data.headTabDTOList.filter(t =>
        !HIDDEN_TABS.includes(t.tabCode)
      );
    }

  } else if (isPath("/chatroom/getRoomTagInfo")) {
    // 聊天室标签页精简

    const hideHot = shouldHide("hideHotTag");
    const hideAll = shouldHide("hideAllTag");
    const hideEmotion = shouldHide("hideEmotionTag");
    const hidePersonal = shouldHide("hidePersonalTag");
    const hidePlay = shouldHide("hidePlayTag");
    const hideInterest = shouldHide("hideInterestTag");
    const hideArgue = shouldHide("hideArgueTag");
    const hideStory = shouldHide("hideStoryTag");
    const hideChat = shouldHide("hideChatTag");
    const hideHeart = shouldHide("hideHeartTag");

    const TAG_IDS = {
      hot: 11,
      all: 0,
      emotion: 43,
      personal: 44,
      play: 12,
      interest: 10,
      argue: 6,
      story: 5,
      chat: 4,
      heart: 2
    };

    const visibleTags = [];
    if (!hideHot) visibleTags.push(TAG_IDS.hot);
    if (!hideAll) visibleTags.push(TAG_IDS.all);
    if (!hideEmotion) visibleTags.push(TAG_IDS.emotion);
    if (!hidePersonal) visibleTags.push(TAG_IDS.personal);
    if (!hidePlay) visibleTags.push(TAG_IDS.play);
    if (!hideInterest) visibleTags.push(TAG_IDS.interest);
    if (!hideArgue) visibleTags.push(TAG_IDS.argue);
    if (!hideStory) visibleTags.push(TAG_IDS.story);
    if (!hideChat) visibleTags.push(TAG_IDS.chat);
    if (!hideHeart) visibleTags.push(TAG_IDS.heart);

    if (obj.data?.res && Array.isArray(obj.data.res)) {
      obj.data.res = obj.data.res.filter(tag => visibleTags.includes(tag.id));
      obj.data.res.forEach(tag => {
        if (tag.iconConfig !== null) tag.iconConfig = null;
      });
    }

  } else if (isPath("/snapchat/url")) {
    // 图片预览推送通知
    try {
      const imageUrl = obj.data?.url;
      if (typeof imageUrl === "string") {
        $notification.post("图片通知", "查看图片", "点击查看详情", {
          "open-url": imageUrl,
          "media-url": imageUrl
        });
      }
    } catch (e) {
      console.log(`图片处理错误: ${e.message}`);
    }
  }

  // 返回处理结果
  body = JSON.stringify(obj);
  $done({ body });

} catch (err) {
  console.log("脚本异常:", err.message);
  $done({});
}