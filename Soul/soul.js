// 当前文件内容仅供个人学习和研究使用，若使用过程中发生任何问题概不负责

// ===== 平台检测与兼容层 =====
const isLoon = typeof $loon !== 'undefined';
const isSurge = typeof $httpClient !== 'undefined' && !isLoon;

// 日志函数 - 根据平台选择输出方式
function log(message) {
    if (isLoon) $loon.log(message);
    if (isSurge) console.log(message);
}

// 参数获取函数 - 兼容 Loon 和 Surge
function getArgument(key) {
    if (isLoon) {
        return $config[key] || "";
    } else if (isSurge) {
        return ($argument && $argument[key]) ? $argument[key] : "";
    }
    return "";
}

// 通知函数 - 兼容 Loon 和 Surge
function notify(title, subtitle, message, options) {
    if (isLoon) {
        $notify(title, subtitle, message, options);
    } else if (isSurge) {
        $notification.post(title, subtitle, message, options);
    }
}

// ===== 核心功能逻辑 =====
let url = $request.url;
let body = $response.body;
let obj = JSON.parse(body);

// 辅助函数：检查参数是否为 "1"
function shouldEnable(param) {
    return param === "1";
}

// 聊天限制信息处理
if (url.indexOf("/chat/limitInfo") != -1) {
    log("处理聊天限制信息...");
    delete obj.data.subMsg;
    delete obj.data.extMsg;
    delete obj.data.abValue;
    delete obj.data.freeEquityStatus;
    delete obj.data.msg;
    delete obj.data.remainFreeCount;
    delete obj.data.type;
    obj.data.limit = false;
} 
// 星球配置处理
else if (url.indexOf("/planet/config") != -1) {
    log("处理星球配置...");
    let soulMatch = getArgument("soulMatch");
    let voiceMatch = getArgument("voiceMatch");
    let partyMatch = getArgument("partyMatch");
    let masked = getArgument("masked");
    let maskedMatch = getArgument("maskedMatch");
    let planet = getArgument("planet");

    const sortIdMap = {
        soulMatch: 1,
        voiceMatch: 2,
        partyMatch: 3,
        masked: 4,
        maskedMatch: 9,
        planet: 10
    };

    let resultArray = [];
    if (shouldEnable(soulMatch)) resultArray.push(sortIdMap.soulMatch);
    if (shouldEnable(voiceMatch)) resultArray.push(sortIdMap.voiceMatch);
    if (shouldEnable(partyMatch)) resultArray.push(sortIdMap.partyMatch);
    if (shouldEnable(masked)) resultArray.push(sortIdMap.masked);
    if (shouldEnable(maskedMatch)) resultArray.push(sortIdMap.maskedMatch);
    if (shouldEnable(planet)) resultArray.push(sortIdMap.planet);
    
    obj.data.showRedMind = false;
    obj.data.chatRoomInfo.showChatRoom = false;
    obj.data.gameInfo.showGameCard = false;
    obj.data.coreCards = obj.data.coreCards.filter(card => resultArray.includes(card.sortId));
    obj.data.gameInfo.gameCards = [];
    obj.data.coreCards.forEach(card => {
        if (card.hasOwnProperty('showLuckyBag')) card.showLuckyBag = false;
        card.showRedMind = false;
        card.style = 1;
        delete card.bgImg;
        delete card.iconUrl;
    });
    obj.data.showLuckyBag = false;
} 
// 聊天房间列表处理
else if (url.indexOf("/chatroom/chatClassifyRoomList") != -1) {
    log("处理聊天房间列表...");
    obj.data.positionContentRespList = []; // 移除广告横幅
} 
// 广场标签页处理
else if (url.indexOf("/square/header/tabs") != -1) {
    log("处理广场标签页...");
    obj.data.forEach(card => {
        card.unreadFlag = 0; // 清除未读标志
    });
    obj.data = obj.data.filter(item => item.pageId === "PostSquare_Recommend"); // 仅保留推荐页
} 
// 首页指标处理
else if (url.indexOf("/homepage/metrics") != -1) {
    log("处理首页指标...");
    obj.data.recentViewNum = 0;
    obj.data.showTipsCard = false;
    obj.data.showMetric = false;
    obj.data.hasHomePageLiked = false;
    if (obj.data.homePageLikedMetric) {
        obj.data.homePageLikedMetric.addNum = 0;
        obj.data.homePageLikedMetric.likedTotalNum = 0;
        obj.data.homePageLikedMetric.hasShowHistoryDynamic = false;
    }
} 
// 关系推荐用户处理
else if (url.indexOf("relation/guideUserList") != -1) {
    log("处理推荐用户列表...");
    obj.data.userDTOList = []; // 清空推荐用户
} 
// 首页标签页v2处理
else if (url.indexOf("/homepage/tabs/v2") != -1) {
    log("处理首页标签页v2...");
    obj.data.selectedTagPool = {};
    const tab = ["STAR_TRAILS"];
    obj.data.headTabDTOList = obj.data.headTabDTOList.filter(t => !tab.includes(t.tabCode));
} 
// 聊天房间标签处理
else if (url.indexOf("/chatroom/getRoomTagInfo") != -1) {
    log("处理聊天房间标签...");
    let hot = getArgument("hot");
    let all = getArgument("all");
    let emotion = getArgument("emotion");
    let personal = getArgument("personal");
    let play = getArgument("play");
    let interest = getArgument("interest");
    let argue = getArgument("argue");
    let story = getArgument("story");
    let chat = getArgument("chat");
    let heart = getArgument("heart");

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
    if (shouldEnable(hot)) resultArray.push(idMap.hot);
    if (shouldEnable(all)) resultArray.push(idMap.all);
    if (shouldEnable(emotion)) resultArray.push(idMap.emotion);
    if (shouldEnable(personal)) resultArray.push(idMap.personal);
    if (shouldEnable(play)) resultArray.push(idMap.play);
    if (shouldEnable(interest)) resultArray.push(idMap.interest);
    if (shouldEnable(argue)) resultArray.push(idMap.argue);
    if (shouldEnable(story)) resultArray.push(idMap.story);
    if (shouldEnable(chat)) resultArray.push(idMap.chat);
    if (shouldEnable(heart)) resultArray.push(idMap.heart);
    
    obj.data.res = obj.data.res.filter(t => resultArray.includes(t.id));
    obj.data.res.forEach(card => {
        if (card.iconConfig != null) {
            card.iconConfig = null;
        }
    });
} 
// 图片预览处理
else if (url.indexOf("/snapchat/url") != -1) {
    log("处理图片预览...");
    try {
        let imageUrl = obj.data.url;
        if (imageUrl && typeof imageUrl === 'string') {
            log("检测到图片URL: " + imageUrl);
            notify("图片通知", "查看图片", "点击查看详情", {
                "openUrl": imageUrl,
                "mediaUrl": imageUrl
            });
        }
    } catch (e) {
        log("处理图片预览出错：" + e);
    }
}

// 返回修改后的响应
body = JSON.stringify(obj);
$done({body});
