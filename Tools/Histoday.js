// https://raw.githubusercontent.com/deezertidal/Surge_Module/master/files/histoday.js

/**
 * Surge/Quantumult X 脚本：历史上的今天（增强版）
 * 功能：从指定网站获取“历史上的今天”事件，并以本地通知形式推送。
 * 支持通过 $argument 传入参数：count、icon、color、url
 * 增强特性：
 *   - 参数严格校验
 *   - HTTP 请求重试（尝试两次）
 *   - 缓存机制：失败时使用上一次成功数据
 *   - 去重：同一天只推送一次
 *   - 当无事件时，发送“暂无事件”提示
 *   - 正则备选方案：主正则匹配失败时使用宽松模式
 * 
 * 参数说明：
 *   - count: 要显示的事件条数，必须为正整数，默认 6
 *   - icon: 通知的图标名称，可选
 *   - color: 通知图标颜色，可选（十六进制，要先 URL 编码，例如 %23FF4500）
 *   - url: 用于抓取“历史上的今天”数据的网页地址，可选，默认 https://lishishangdejintian.bmcx.com/
 */

'use strict';

// 兼容 Surge 与 Quantumult X：统一获取本地存储接口
const store = (typeof $persistentStore !== 'undefined') ? $persistentStore : $prefs;

/**
 * 读取本地缓存
 * @param {string} key - 缓存键
 * @return {string|null} - 返回存储的字符串或 null
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
 * @return {boolean|null} - 返回操作结果或 null
 */
function writeCache(key, value) {
  if (store && typeof store.write === 'function') {
    return store.write(value, key);
  }
  return null;
}

/**
 * 严格解析 $argument 参数，返回一个对象
 * 支持格式：key1=value1&key2=value2…，自动 decodeURIComponent
 * 忽略不合法或空 key 部分
 * @param {string} arg - Surge/Quantumult X 传入的 $argument 字符串
 * @return {Object} - { key: value, … }
 */
function getParams(arg) {
  if (!arg || typeof arg !== 'string') {
    return {};
  }
  const obj = {};
  arg.split('&').forEach(item => {
    const parts = item.split('=');
    if (parts.length !== 2) return;           // 必须恰好有一个 '='
    const key = parts[0].trim();
    if (!key) return;                         // key 不能为空
    const val = parts[1];
    obj[key] = decodeURIComponent(val || '');
  });
  return obj;
}

// 主流程 IIFE，立刻执行
(function () {
  // 1. 读取并校验参数
  const params = getParams($argument);
  
  // count 必须为正整数，否则回退为默认 6
  let count = parseInt(params.count, 10);
  if (isNaN(count) || count < 1) {
    count = 6;
  }
  // 通知图标和颜色，可选
  const icon = params.icon || '';
  const iconColor = params.color || '';
  // 抓取 URL，可选；若不合法则使用默认
  let fetchUrl = params.url || 'https://lishishangdejintian.bmcx.com/';
  if (!/^https?:\/\/.+/.test(fetchUrl)) {
    fetchUrl = 'https://lishishangdejintian.bmcx.com/';
  }

  // 2. 获取当前“月日”和用来去重的日期标识
  const now = new Date();
  const month = now.getMonth() + 1;              // JS 月份从 0 开始
  const day = now.getDate();
  const monthDay = `${month}月${day}日`;           // 用于匹配 HTML 中的“月日”
  const todayKey = `${month}-${day}`;            // 用于本地去重，格式如 "6-2"

  // 3. 去重：同一天只推送一次
  const lastSent = readCache('histoday_last_date');
  if (lastSent === todayKey) {
    // 今天已经推送过，直接结束
    $done();
    return;
  }

  // 4. 发起 HTTP 请求并处理：最多尝试 2 次
  fetchWithRetry(fetchUrl, 2, (success, html) => {
    if (!success) {
      // 两次请求均失败 → 尝试使用缓存
      const cachedContent = readCache('histoday_latest_content');
      if (cachedContent) {
        // 有缓存则推送“缓存”形式的内容
        const body = {
          title: '📓 历史上的今天（缓存）',
          content: cachedContent,
          icon: icon,
          'icon-color': iconColor,
          count: count
        };
        $done(body);
      } else {
        // 完全无缓存可用，直接结束
        $done();
      }
      return;
    }
    // 5. 请求成功 → 解析 HTML 并推送
    processHtml(html, monthDay, count, icon, iconColor, todayKey);
  });
})();

/**
 * 发起 HTTP GET 请求，最多尝试 retries 次
 * @param {string} url - 目标 URL
 * @param {number} retries - 剩余尝试次数
 * @param {function} callback - 回调 (success: boolean, data: html|string|null)
 */
function fetchWithRetry(url, retries, callback) {
  $httpClient.get(url, (error, response, data) => {
    if (!error && response && response.status === 200 && data) {
      callback(true, data);
    } else {
      if (retries > 1) {
        // 再尝试一次
        fetchWithRetry(url, retries - 1, callback);
      } else {
        callback(false, null);
      }
    }
  });
}

/**
 * 处理 HTML：提取“当日”事件并推送通知
 * @param {string} html - 原始 HTML 字符串
 * @param {string} monthDay - 格式如 "6月2日"，用于筛选当日
 * @param {number} count - 要推送的事件条数
 * @param {string} icon - 通知图标
 * @param {string} iconColor - 通知图标颜色
 * @param {string} todayKey - 用于缓存的去重键，格式 "M-D"
 */
function processHtml(html, monthDay, count, icon, iconColor, todayKey) {
  // 先把 HTML 中的 &nbsp; 全部替换成普通空格，方便后面正则匹配
  const sanitized = html.replace(/&nbsp;/g, ' ');

  // 主正则：严格匹配 “年份 + 月日 + /数字__lishishangdejintianchaxun/ + 事件标题”
  const primaryRegex = /(\d{4}年)(\d{1,2}月\d{1,2}日) <a href='\/\d+__lishishangdejintianchaxun\/' target='_blank'>(.*?)<\/a>/g;
  let matches = [...sanitized.matchAll(primaryRegex)];

  // 如果主正则几乎没匹配到，则使用更宽松的正则备选方案
  if (matches.length < 1) {
    const fallbackRegex = /(\d{4}年)(\d{1,2}月\d{1,2}日).*?<a [^>]*>(.*?)<\/a>/g;
    matches = [...sanitized.matchAll(fallbackRegex)];
  }

  // 若最终都没有匹配到任何条目，则发送“当天暂无记录”的通知
  if (!matches.length) {
    const body = {
      title: '📓 历史上的今天',
      content: `抱歉，系统暂未检索到 ${monthDay} 的历史事件。`,
      icon: icon,
      'icon-color': iconColor,
      count: 0
    };
    // 这条提示不会缓存，下一次脚本运行若页面有数据，还是会重新尝试
    $done(body);
    return;
  }

  // 过滤出“当日”事件，并拼接成“2025年6月2日 事件标题”格式
  const events = [];
  for (const match of matches) {
    const yearPart = match[1];    // 捕获到的“XXXX年”
    const datePart = match[2];    // 捕获到的“X月X日”
    const titlePart = match[3];   // 捕获到的“事件标题”
    if (datePart === monthDay) {
      events.push(`${yearPart}${datePart} ${titlePart}`);
    }
  }

  // 如果网页有数据，但当前“月日”没有事件
  if (!events.length) {
    const body = {
      title: '📓 历史上的今天',
      content: `抱歉，${monthDay} 当天暂无记录。`,
      icon: icon,
      'icon-color': iconColor,
      count: 0
    };
    $done(body);
    return;
  }

  // 只取前 count 条，用换行符拼成通知正文
  const notificationContent = events.slice(0, count).join('\n');

  // 构造通知对象，发送给 Surge/Quantumult X 平台
  const body = {
    title: '📓 历史上的今天',
    content: notificationContent,
    icon: icon,
    'icon-color': iconColor,
    count: count
  };
  $done(body);

  // 成功发送后，写入本地缓存：今天已推送标识 & 当日内容
  writeCache('histoday_last_date', todayKey);
  writeCache('histoday_latest_content', notificationContent);
}
