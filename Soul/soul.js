//  2025-04-04
//  树先生
//  当前文件内容仅供个人学习和研究使用，若使用过程中发生任何问题概不负责

let url = $request.url;
let body = $response.body;
let obj = JSON.parse(body);

// ✅ 参数解析：兼容 Surge 和 Loon
const args = typeof $argument === "string"
  ? Object.fromEntries($argument.split("&").map(kv => kv.split("=")))
  : {};

const getBoolArg = (key) => args[key] === "true";

if (url.includes("/chat/limitInfo")) {
  delete obj.data.subMsg;
  delete obj.data.extMsg;
  delete obj.data.abValue;
  delete obj.data.freeEquityStatus;
  delete obj.data.msg;
  delete obj.data.remainFreeCount;
  delete obj.data.type;
  obj.data.limit = false;

} else if (url.includes("/planet/config")) {
  const sortIdMap = {
    soulMatch: 1,
    voiceMatch: 2,
    partyMatch: 3,
    masked: 4,
    maskedMatch: 9,
    planet: 10
  };

  const resultArray = Object.keys(sortIdMap)
    .filter(key => getBoolArg(key))
    .map(key => sortIdMap[key]);

  obj.data.showRedMind = false;
  obj.data.chatRoomInfo.showChatRoom = false;
  obj.data.gameInfo.showGameCard = false;
  obj.data.coreCards = obj.data.coreCards.filter(card => resultArray.includes(card.sortId));
  obj.data.gameInfo.gameCards = [];

  obj.data.coreCards.forEach(card => {
    card.showLuckyBag = false;
    card.showRedMind = false;
    card.style = 1;
    delete card.bgImg;
    delete card.iconUrl;
  });

  obj.data.showLuckyBag = false;

} else if (url.includes("/chatroom/chatClassifyRoomList")) {
  obj.data.positionContentRespList = [];

} else if (url.includes("/square/header/tabs")) {
  obj.data.forEach(card => card.unreadFlag = 0);
  obj.data = obj.data.filter(item => item.pageId === "PostSquare_Recommend");

} else if (url.includes("/homepage/metrics")) {
  obj.data.recentViewNum = 0;
  obj.data.showTipsCard = false;
  obj.data.showMetric = false;
  obj.data.hasHomePageLiked = false;
  if (obj.data.homePageLikedMetric) {
    obj.data.homePageLikedMetric.addNum = 0;
    obj.data.homePageLikedMetric.likedTotalNum = 0;
    obj.data.homePageLikedMetric.hasShowHistoryDynamic = false;
  }

} else if (url.includes("relation/guideUserList")) {
  obj.data.userDTOList = [];

} else if (url.includes("/homepage/tabs/v2")) {
  obj.data.selectedTagPool = {};
  const tab = ["STAR_TRAILS"];
  obj.data.headTabDTOList = obj.data.headTabDTOList.filter(t => !tab.includes(t.tabCode));

} else if (url.includes("/chatroom/getRoomTagInfo")) {
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

  const resultArray = Object.keys(idMap)
    .filter(key => getBoolArg(key))
    .map(key => idMap[key]);

  obj.data.res = obj.data.res.filter(t => resultArray.includes(t.id));
  obj.data.res.forEach(card => card.iconConfig = null);

} else if (url.includes("/snapchat/url")) {
  try {
    const imageUrl = obj.data.url;
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

body = JSON.stringify(obj);
$done({ body });