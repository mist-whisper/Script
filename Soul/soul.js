//  soul.js - 开关逻辑统一为 “true” 表示启用
//  支持 Surge / Loon / Quantumult X
//  传参方式：argument=soulMatch=true&planet=true

let url = $request.url;
let body = $response.body;
let obj = JSON.parse(body);

// ✅ 所有开关逻辑：只有设置为 "true" 才启用
function isEnabled(key) {
  return $argument[key] === "true";
}

// ========= 主路由逻辑 =========
if (url.includes("/chat/limitInfo")) {
  handleLimitInfo(obj);
} else if (url.includes("/planet/config")) {
  handlePlanetConfig(obj);
} else if (url.includes("/chatroom/chatClassifyRoomList")) {
  obj.data.positionContentRespList = [];
} else if (url.includes("/square/header/tabs")) {
  obj.data.forEach(card => card.unreadFlag = 0);
  obj.data = obj.data.filter(item => item.pageId === "PostSquare_Recommend");
} else if (url.includes("/homepage/metrics")) {
  handleHomePageMetrics(obj);
} else if (url.includes("relation/guideUserList")) {
  obj.data.userDTOList = [];
} else if (url.includes("/homepage/tabs/v2")) {
  obj.data.selectedTagPool = {};
  obj.data.headTabDTOList = obj.data.headTabDTOList.filter(t => t.tabCode !== "STAR_TRAILS");
} else if (url.includes("/chatroom/getRoomTagInfo")) {
  handleRoomTagInfo(obj);
} else if (url.includes("/snapchat/url")) {
  handleSnapchatUrl(obj);
}

body = JSON.stringify(obj);
$done({ body });

// ========= 模块处理函数 =========

function handleLimitInfo(obj) {
  delete obj.data.subMsg;
  delete obj.data.extMsg;
  delete obj.data.abValue;
  delete obj.data.freeEquityStatus;
  delete obj.data.msg;
  delete obj.data.remainFreeCount;
  delete obj.data.type;
  obj.data.limit = false;
}

function handlePlanetConfig(obj) {
  const sortIdMap = {
    soulMatch: 1,
    voiceMatch: 2,
    partyMatch: 3,
    masked: 4,
    maskedMatch: 9,
    planet: 10
  };

  let resultArray = [];
  for (const key in sortIdMap) {
    if (isEnabled(key)) {
      resultArray.push(sortIdMap[key]);
    }
  }

  obj.data.showRedMind = false;
  obj.data.chatRoomInfo.showChatRoom = false;
  obj.data.gameInfo.showGameCard = false;
  obj.data.showLuckyBag = false;

  let filtered = obj.data.coreCards.filter(card => resultArray.includes(card.sortId));
  if (filtered.length > 0) {
    obj.data.coreCards = filtered;
  }

  obj.data.gameInfo.gameCards = [];

  obj.data.coreCards.forEach(card => {
    card.showLuckyBag = false;
    card.showRedMind = false;
    card.style = 1;
    delete card.bgImg;
    delete card.iconUrl;
  });
}

function handleHomePageMetrics(obj) {
  obj.data.recentViewNum = 0;
  obj.data.showTipsCard = false;
  obj.data.showMetric = false;
  obj.data.hasHomePageLiked = false;

  const metric = obj.data.homePageLikedMetric;
  if (metric) {
    metric.addNum = 0;
    metric.likedTotalNum = 0;
    metric.hasShowHistoryDynamic = false;
  }
}

function handleRoomTagInfo(obj) {
  const idMap = {
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

  let resultArray = [];
  for (const key in idMap) {
    if (isEnabled(key)) {
      resultArray.push(idMap[key]);
    }
  }

  obj.data.res = obj.data.res.filter(t => resultArray.includes(t.id));
  obj.data.res.forEach(card => {
    if (card.iconConfig != null) card.iconConfig = null;
  });
}

function handleSnapchatUrl(obj) {
  try {
    let imageUrl = obj.data.url;
    if (imageUrl && typeof imageUrl === 'string') {
      const attach = {
        openUrl: imageUrl,
        mediaUrl: imageUrl
      };
      $notification.post("图片通知", "查看图片", "点击查看详情", attach);
    }
  } catch (e) {
    console.log("处理图片预览出错：" + e);
  }
}