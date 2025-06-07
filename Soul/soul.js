/*
 * Soul++ 增强脚本
 * 功能：精简Soul应用界面，移除干扰元素
 * 逻辑：打开开关即隐藏对应模块
 * 版本：2.0
 * 更新：重构开关逻辑，增强参数处理
 */

let url = $request?.url;
let body = $response?.body;
if (!url || !body) $done({});

try {
  let obj = JSON.parse(body);
  
  // 严格布尔值转换函数
  const parseBool = (value, defaultValue = false) => {
    if (value === undefined || value === null) return defaultValue;
    return String(value).toLowerCase() === "true";
  };
  
  // 统一开关处理函数
  const shouldHide = (paramName, defaultValue = false) => {
    return parseBool($argument?.[paramName], defaultValue);
  };

  // 路径匹配检查
  const isPath = (keyword) => url.indexOf(keyword) !== -1;

  // 主处理逻辑
  if (isPath("/chat/limitInfo")) {
    /* 聊天限制信息处理 */
    const data = obj.data || {};
    ["subMsg", "extMsg", "abValue", "freeEquityStatus", "msg", "remainFreeCount", "type"].forEach(prop => {
      delete data[prop];
    });
    data.limit = false;
    
  } else if (isPath("/planet/config")) {
    /* 星球功能配置 */
    const hideSoulMatch = shouldHide("hideSoulMatch");
    const hideVoiceMatch = shouldHide("hideVoiceMatch");
    const hidePartyMatch = shouldHide("hidePartyMatch");
    const hideMasked = shouldHide("hideMasked");
    const hideMaskedMatch = shouldHide("hideMaskedMatch");
    const hidePlanet = shouldHide("hidePlanet");

    // 功能ID映射表
    const FEATURE_IDS = {
      soulMatch: 1,
      voiceMatch: 2,
      partyMatch: 3,
      masked: 4,
      maskedMatch: 9,
      planet: 10
    };

    // 确定要保留的功能
    const visibleFeatures = [];
    if (!hideSoulMatch) visibleFeatures.push(FEATURE_IDS.soulMatch);
    if (!hideVoiceMatch) visibleFeatures.push(FEATURE_IDS.voiceMatch);
    if (!hidePartyMatch) visibleFeatures.push(FEATURE_IDS.partyMatch);
    if (!hideMasked) visibleFeatures.push(FEATURE_IDS.masked);
    if (!hideMaskedMatch) visibleFeatures.push(FEATURE_IDS.maskedMatch);
    if (!hidePlanet) visibleFeatures.push(FEATURE_IDS.planet);

    // 应用过滤
    obj.data.showRedMind = false;
    obj.data.chatRoomInfo = obj.data.chatRoomInfo || {};
    obj.data.chatRoomInfo.showChatRoom = false;
    obj.data.gameInfo = obj.data.gameInfo || {};
    obj.data.gameInfo.showGameCard = false;
    
    if (obj.data.coreCards && Array.isArray(obj.data.coreCards)) {
      obj.data.coreCards = obj.data.coreCards.filter(card => 
        visibleFeatures.includes(card.sortId)
      );
      
      // 清理卡片属性
      obj.data.coreCards.forEach(card => {
        card.showLuckyBag = false;
        card.showRedMind = false;
        card.style = 1;
        delete card.bgImg;
        delete card.iconUrl;
      });
    }
    
    obj.data.gameInfo.gameCards = [];
    obj.data.showLuckyBag = false;
    
  } else if (isPath("/chatroom/chatClassifyRoomList")) {
    /* 聊天室列表处理 */
    obj.data.positionContentRespList = []; // 移除广告横幅
    
  } else if (isPath("/square/header/tabs")) {
    /* 广场页签处理 */
    if (Array.isArray(obj.data)) {
      obj.data.forEach(card => {
        card.unreadFlag = 0; // 清除未读红点
      });
      // 只保留推荐页签
      obj.data = obj.data.filter(item => item.pageId === "PostSquare_Recommend");
    }
    
  } else if (isPath("/homepage/metrics")) {
    /* 主页指标处理 */
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
    /* 用户引导列表 */
    obj.data.userDTOList = []; // 清空推荐用户
    
  } else if (isPath("/homepage/tabs/v2")) {
    /* 主页标签页处理 */
    obj.data.selectedTagPool = {};
    const HIDDEN_TABS = ["STAR_TRAILS"];
    if (Array.isArray(obj.data.headTabDTOList)) {
      obj.data.headTabDTOList = obj.data.headTabDTOList.filter(t => 
        !HIDDEN_TABS.includes(t.tabCode)
      );
    }
    
  } else if (isPath("/chatroom/getRoomTagInfo")) {
    /* 聊天室标签处理 */
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

    // 标签ID映射表
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

    // 确定要保留的标签
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

    // 应用标签过滤
    if (obj.data?.res && Array.isArray(obj.data.res)) {
      obj.data.res = obj.data.res.filter(t => visibleTags.includes(t.id));
      
      // 清理标签图标
      obj.data.res.forEach(tag => {
        if (tag.iconConfig !== null) tag.iconConfig = null;
      });
    }
    
  } else if (isPath("/snapchat/url")) {
    /* 图片预览处理 */
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

  // 返回修改后的响应
  body = JSON.stringify(obj);
  $done({body});
  
} catch (error) {
  console.log(`脚本处理错误: ${error.message}`);
  $done({});
}
