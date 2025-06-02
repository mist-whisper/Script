// https://raw.githubusercontent.com/deezertidal/Surge_Module/master/files/histoday.js

/**
 * Surge/Quantumult X 脚本：历史上的今天（HTML 抓取版，增强容错）
 *
 * 功能：
 *   • 从指定网站抓取“历史上的今天”HTML，解析当日事件并推送本地通知  
 *   • 支持参数：count、icon、color、url、use_cache  
 *   • 容错特性：重试、缓存回退、去重、备用正则
 *
 *
 * 参数说明：
 *   • count（可选）：要推送的事件条数，必须为正整数；缺省为 6。  
 *   • icon、color（可选）：本地通知的图标名称和图标颜色（颜色需 URL 编码，如 %23FF4500）。  
 *   • url（可选）：抓取“历史上的今天”HTML 的目标网址；默认 https://lishishangdejintian.bmcx.com/  
 *   • use_cache（可选）：若传 “1”，在请求失败或解析不到当日事件时优先回退到缓存。  
 *
 * 核心流程：
 *   1. 解析并校验参数；  
 *   2. 计算当前“月日”（格式如 “6月2日”）和去重键（“6-2”）；  
 *   3. 去重：检查缓存中的 “histoday_last_date”，如果等于去重键，直接退出；  
 *   4. 发起 HTTP GET 请求，尝试最多两次；  
 *      4.1 请求成功且解析到 HTML → 替换 &nbsp; → 用主正则提取所有“年份+月日+标题” → 用备用正则备选。  
 *      4.2 从匹配结果中过滤 “月日 === 当日” 的条目，拼成 “YYYY年M月D日 事件标题”；  
 *      4.3 若找到 ≥1 条事件 → 截取前 count 条，拼接通知正文并推送；写入缓存（今天的去重键 + 最新正文）；  
 *      4.4 若未找到任何当日事件但 HTML 中有匹配（即网页上确实有条目，只是都不是今天） → 推送“今日暂无记录”通知，不写入缓存；  
 *      4.5 若整个 HTML 没有匹配任何条目 → 认为解析失败；若 use_cache=1 且缓存存在 → 回退推送缓存内容；否则直接退出；  
 *   5. 如果两次请求都失败 → 若 use_cache=1 且缓存存在 → 回退推送；否则直接退出。  
 *
 */

'use strict';

// 兼容 Surge 与 Quantumult X：统一使用 $persistentStore 或 $prefs 进行缓存
const store = (typeof $persistentStore !== 'undefined') ? $persistentStore : $prefs;

/**
 * 读取本地缓存
 * @param {string} key - 缓存键
 * @returns {string|null}
 */
function readCache(key) {
  if (store && typeof store.read === 'function') {
    return store.read(key);
  }
  return null;
}

/**
 * 写入本地缓存
 * @param {string} key - 缓存键
 * @param {string} value - 要存储的字符串
 * @returns {boolean|null}
 */
function writeCache(key, value) {
  if (store && typeof store.write === 'function') {
    return store.write(value, key);
  }
  return null;
}

/**
 * 严格解析 $argument（格式：key1=value1&key2=value2…）
 * 只保留等号两侧非空 key，自动 decodeURIComponent
 * @param {string} arg
 * @returns {Object<string,string>}
 */
function getParams(arg) {
  if (!arg || typeof arg !== 'string') {
    return {};
  }
  const obj = {};
  arg.split('&').forEach(item => {
    const parts = item.split('=');
    if (parts.length !== 2) return;       // 必须恰好一个 '='
    const key = parts[0].trim();
    if (!key) return;                     // key 不能为空
    obj[key] = decodeURIComponent(parts[1] || '');
  });
  return obj;
}

// 立即执行主逻辑
(function () {
  // -------------------- 1. 解析并校验参数 --------------------
  const params = getParams($argument);

  // count：要推送的事件条数，必须为正整数，否则默认 6
  let count = parseInt(params.count, 10);
  if (isNaN(count) || count < 1) {
    count = 6;
  }

  // 通知 icon、icon-color（可选）
  const icon = params.icon || '';
  const iconColor = params.color || '';

  // 抓取 URL（可选），需以 http:// 或 https:// 开头，否则使用默认
  let fetchUrl = params.url || 'https://lishishangdejintian.bmcx.com/';
  if (!/^https?:\/\/.+/.test(fetchUrl)) {
    fetchUrl = 'https://lishishangdejintian.bmcx.com/';
  }

  // use_cache：是否在失败时回退到缓存（传 '1' 表示启用）
  const useCache = (params.use_cache === '1');

  // -------------------- 2. 构造“月日”与去重键 --------------------
  const now = new Date();
  const month = now.getMonth() + 1;             // 取当前月份 1-12
  const day = now.getDate();                    // 当前日 1-31
  const monthDay = `${month}月${day}日`;         // 用于在 HTML 中匹配，如 "6月2日"
  const todayKey = `${month}-${day}`;           // 用于缓存去重，如 "6-2"

  // -------------------- 3. 去重：同一天只推送一次 --------------------
  const lastSent = readCache('histoday_last_date');
  if (lastSent === todayKey) {
    // 今天已推送，直接结束
    $done();
    return;
  }

  // -------------------- 4. 发起 HTTP GET 请求，最多重试 2 次 --------------------
  fetchHtmlWithRetry(fetchUrl, 2, (success, html) => {
    if (!success) {
      // 如果连续两次请求都失败，且允许 use_cache，则回退到缓存
      if (useCache) {
        const cachedContent = readCache('histoday_latest_content');
        if (cachedContent) {
          const body = {
            title: '📓 历史上的今天（缓存）',
            content: cachedContent,
            icon: icon,
            'icon-color': iconColor,
            count: count
          };
          $done(body);
          return;
        }
      }
      // 没有缓存或不使用缓存，直接结束
      $done();
      return;
    }
    // 成功获取 HTML，进入解析阶段
    processHtml(html, monthDay, count, icon, iconColor, todayKey, useCache);
  });
})();

/**
 * 发起 HTTP GET 请求，最多重试 retries 次
 * @param {string} url
 * @param {number} retries - 剩余尝试次数
 * @param {function(success:boolean, data:string|null)} callback
 */
function fetchHtmlWithRetry(url, retries, callback) {
  $httpClient.get(url, (error, response, data) => {
    if (!error && response && response.status === 200 && data) {
      callback(true, data);
    } else {
      if (retries > 1) {
        fetchHtmlWithRetry(url, retries - 1, callback);
      } else {
        callback(false, null);
      }
    }
  });
}

/**
 * 处理 HTML：提取当日事件并推送通知
 * @param {string} html           - 原始 HTML 字符串
 * @param {string} monthDay       - 格式如 "6月2日"，用于筛选当日
 * @param {number} count          - 要推送的事件条数
 * @param {string} icon           - 通知图标名称
 * @param {string} iconColor      - 通知图标颜色
 * @param {string} todayKey       - 去重键，如 "6-2"
 * @param {boolean} useCache      - 是否启用缓存回退
 */
function processHtml(html, monthDay, count, icon, iconColor, todayKey, useCache) {
  // 先把 HTML 中的 &nbsp; 替换为普通空格，避免正则被干扰
  const sanitized = html.replace(/&nbsp;/g, ' ');

  // 主正则：严格匹配 “YYYY年M月D日 <a href='/ID__lishishangdejintianchaxun/' …>标题</a>”
  const primaryRegex = /(\d{4}年)(\d{1,2}月\d{1,2}日) <a href='\/\d+__lishishangdejintianchaxun\/' target='_blank'>(.*?)<\/a>/g;
  let matches = [...sanitized.matchAll(primaryRegex)];

  // 如果主正则匹配不到任何内容，尝试备用正则
  if (matches.length === 0) {
    // 宽松版，匹配“YYYY年M月D日”后面跟着任意 <a> 标签内容
    const fallbackRegex = /(\d{4}年)(\d{1,2}月\d{1,2}日).*?<a [^>]*>(.*?)<\/a>/g;
    matches = [...sanitized.matchAll(fallbackRegex)];
  }

  // 如果 HTML 中根本没有任何“年份+月日+链接”模式的内容，则认为解析失败
  if (matches.length === 0) {
    // 当解析失败时，若允许 use_cache 且有缓存，则回退推送缓存
    if (useCache) {
      const cached = readCache('histoday_latest_content');
      if (cached) {
        const bodyCache = {
          title: '📓 历史上的今天（缓存）',
          content: cached,
          icon: icon,
          'icon-color': iconColor,
          count: count
        };
        $done(bodyCache);
        return;
      }
    }
    // 不使用缓存或没缓存，直接结束
    $done();
    return;
  }

  // 遍历所有匹配到的条目，筛选“月日 === 当日”的事件
  const events = [];
  for (const match of matches) {
    const yearPart = match[1];   // 例如 "2025年"
    const datePart = match[2];   // 例如 "6月2日"
    const titlePart = match[3];  // 事件标题文本
    if (datePart === monthDay) {
      // 拼成 “YYYY年M月D日 事件标题”
      events.push(`${yearPart}${datePart} ${titlePart}`);
    }
  }

  // 如果找到 ≥1 条事件
  if (events.length > 0) {
    // 取前 count 条，拼接成多行通知正文
    const notificationContent = events.slice(0, count).join('\n');

    const body = {
      title: '📓 历史上的今天',
      content: notificationContent,
      icon: icon,
      'icon-color': iconColor,
      count: count
    };
    $done(body);

    // 推送成功后，写入缓存：今天的去重键 & 最新正文
    writeCache('histoday_last_date', todayKey);
    writeCache('histoday_latest_content', notificationContent);
    return;
  }

  // 如果 HTML 中有匹配（说明网页确实有条目），但没有一条是“当日”的
  // → 说明今天确实没有历史事件，需要提示用户“今日暂无记录”
  const bodyNoEvents = {
    title: '📓 历史上的今天',
    content: `抱歉，${monthDay} 暂无历史记录。`,
    icon: icon,
    'icon-color': iconColor,
    count: 0
  };
  $done(bodyNoEvents);
  // “暂无记录”提示不写入缓存，次日脚本会继续尝试抓取
}
