/** 配置区：开关与 ID 列表，按需修改即可 */
const config = {
  enableChatLimitUnlock: true,                // 解锁聊天次数限制
  enablePlanetConfig: true,                   // 应用星球配置过滤
  enablePartyAdBlock: true,                   // 屏蔽派对/聊天室广告
  enableSquareTabFilter: true,                // 精简广场标签
  enableHomepageMetricsReset: true,           // 隐藏/重置首页指标
  enableGuideClear: true,                     // 清空新手引导用户列表
  enableHomepageTabFilter: true,              // 精简首页标签
  enableRoomTagFilter: true,                  // 精选聊天房间类型
  enableSnapchatNotify: true,                 // 图片预览本地通知

  // 允许显示的星球卡片 ID 列表（示例）
  allowedPlanetCardIds: [101, 102, 103, 104],

  // 广场页保留的 tab id 列表
  allowedSquareTabIds: [1, 2, 3],

  // 首页保留的 tab id 列表
  allowedHomepageTabIds: ['home', 'match', 'notifications'],

  // 允许进入的房间标签 ID 列表
  allowedRoomTagIds: [10, 20, 30, 40],
};

/** 通用工具函数区 */

/** 安全地 JSON.parse，失败时返回 null */
const safeJSONParse = str => {
  try {
    return JSON.parse(str);
  } catch (err) {
    console.error('❌ JSON.parse error:', err);
    return null;
  }
};

/** 安全地 JSON.stringify，失败时返回 null */
const safeJSONStringify = obj => {
  try {
    return JSON.stringify(obj);
  } catch (err) {
    console.error('❌ JSON.stringify error:', err);
    return null;
  }
};

/** 批量删除对象字段 */
const removeFields = (obj, fields = []) => {
  fields.forEach(f => {
    if (obj.hasOwnProperty(f)) delete obj[f];
  });
  return obj;
};

/** 批量设置对象的布尔或标量属性 */
const setFields = (obj, map = {}) => {
  Object.entries(map).forEach(([key, val]) => {
    obj[key] = val;
  });
  return obj;
};

/** 用 allowedIds 过滤数组中包含 idKey 的元素 */
const filterByIds = (arr = [], allowedIds = [], idKey = 'id') => {
  if (!Array.isArray(arr)) return [];
  return arr.filter(item => allowedIds.includes(item[idKey]));
};

/** 各接口的处理函数区 */

/**
 * 解锁聊天次数限制
 */
const handleLimitInfo = (url, body) => {
  if (!config.enableChatLimitUnlock) return body;
  if (body.data) {
    // 标记为无次数限制
    body.data.limit = false;
    // 删除或重置提示字段
    removeFields(body.data, ['remainTimes', 'message', 'tips']);
  }
  return body;
};

/**
 * 星球页配置过滤
 */
const handlePlanetConfig = (url, body) => {
  if (!config.enablePlanetConfig) return body;
  const d = body.data || {};
  // 只保留白名单卡片
  d.coreCards = filterByIds(d.coreCards, config.allowedPlanetCardIds, 'cardId');
  // 关闭所有可选 UI 提示
  setFields(d, {
    showHeart: false,
    showGameEntry: false,
    showLuckyBag: false
  });
  body.data = d;
  return body;
};

/**
 * 屏蔽派对/聊天室广告横幅
 */
const handlePartyAd = (url, body) => {
  if (!config.enablePartyAdBlock) return body;
  if (body.data && Array.isArray(body.data.bannerList)) {
    body.data.bannerList = [];
  }
  return body;
};

/**
 * 精简广场页 tabs
 */
const handleSquareTab = (url, body) => {
  if (!config.enableSquareTabFilter) return body;
  if (body.data && Array.isArray(body.data.tabs)) {
    body.data.tabs = filterByIds(body.data.tabs, config.allowedSquareTabIds, 'id');
  }
  return body;
};

/**
 * 隐藏/重置首页指标与提示
 */
const handleHomepageMetrics = (url, body) => {
  if (!config.enableHomepageMetricsReset) return body;
  const d = body.data || {};
  setFields(d, {
    visitCount: 0,
    likeCount: 0,
    commentCount: 0
  });
  // 清空提示卡片
  if (Array.isArray(d.tipCards)) d.tipCards = [];
  body.data = d;
  return body;
};

/**
 * 清空新手引导用户列表
 */
const handleGuideUsers = (url, body) => {
  if (!config.enableGuideClear) return body;
  if (body.data && Array.isArray(body.data.users)) {
    body.data.users = [];
  }
  return body;
};

/**
 * 精简首页 tabs v2
 */
const handleHomepageTabV2 = (url, body) => {
  if (!config.enableHomepageTabFilter) return body;
  if (body.data && Array.isArray(body.data.tabs)) {
    body.data.tabs = body.data.tabs.filter(
      tab => config.allowedHomepageTabIds.includes(tab.id)
    );
  }
  return body;
};

/**
 * 精选聊天房间标签
 */
const handleRoomTag = (url, body) => {
  if (!config.enableRoomTagFilter) return body;
  if (body.data && Array.isArray(body.data.tags)) {
    body.data.tags = filterByIds(body.data.tags, config.allowedRoomTagIds, 'tagId');
    // 删除图标字段
    body.data.tags.forEach(t => delete t.iconUrl);
  }
  return body;
};

/**
 * SnapChat 图片预览通知
 */
const handleSnapchatUrl = (url, body) => {
  if (!config.enableSnapchatNotify) return body;
  const picUrl = body.data && body.data.url;
  if (picUrl) {
    $notification.post('图片预览', '', '点击查看大图', picUrl);
  }
  return body;
};

/** URL 匹配表：路径片段 => 处理函数 */
const handlers = new Map([
  ['/chat/limitInfo',         handleLimitInfo],
  ['/planet/config',          handlePlanetConfig],
  ['/chatroom/chatClassifyRoomList', handlePartyAd],
  ['/square/header/tabs',     handleSquareTab],
  ['/homepage/metrics',       handleHomepageMetrics],
  ['/relation/guideUserList', handleGuideUsers],
  ['/homepage/tabs/v2',       handleHomepageTabV2],
  ['/chatroom/getRoomTagInfo', handleRoomTag],
  ['/snapchat/url',           handleSnapchatUrl],
]);

/** 主流程 */
(() => {
  const url = $request.url;
  const rawBody = $response.body;
  // 解析 JSON
  const bodyObj = safeJSONParse(rawBody);
  if (!bodyObj) {
    // 解析失败，返回原始响应
    return $done({ body: rawBody });
  }

  // 查找对应的处理器
  const handler = [...handlers.entries()]
    .find(([path]) => url.includes(path))
    ?.[1];

  let newBody = bodyObj;
  if (handler) {
    try {
      newBody = handler(url, bodyObj);
    } catch (err) {
      console.error(`❌ Handler error for ${url}:`, err);
    }
  }

  // 序列化并返回
  const newBodyStr = safeJSONStringify(newBody);
  if (!newBodyStr) {
    // 序列化失败，回退到原始
    return $done({ body: rawBody });
  }
  $done({ body: newBodyStr });
})();