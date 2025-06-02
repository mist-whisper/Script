// https://raw.githubusercontent.com/deezertidal/Surge_Module/master/files/histoday.js

/**
 * Surge/Quantumult X 脚本：历史上的今天（HTML 抓取版，基础优化）
 *
 * 说明：
 *   • 从 https://lishishangdejintian.bmcx.com/ 抓取“历史上的今天”页面
 *   • 仅提取当前日期（“月日”）对应的历史事件，格式为“YYYY年M月D日 事件标题”
 *   • 支持 $argument 传参：count、icon、color、url
 *   • 修复了原版 getParams 中的语法错误
 *   • 根据用户指定的 count 截取前 N 条事件；缺省为 6 条
 *   • 若当天没有事件，则不推送任何内容（与原逻辑保持一致）
 *
 *
 * 参数说明：
 *   • count（可选）：要显示的事件条数，必须为正整数；默认为 6
 *   • icon（可选）：本地通知的图标名称
 *   • color（可选）：本地通知的图标颜色（十六进制，需 URL 编码，例如 %23FF4500）
 *   • url（可选）：抓取“历史上的今天”页面的 URL；默认为 https://lishishangdejintian.bmcx.com/
 */

'use strict';

// 解析 $argument，如 "count=5&icon=bell&color=%23FF4500&url=https://..." → { count: "5", icon: "bell", color: "#FF4500", url: "https://..." }
function getParams(arg) {
  if (!arg || typeof arg !== 'string') {
    return {};
  }
  const obj = {};
  arg.split('&').forEach(item => {
    const parts = item.split('=');
    if (parts.length !== 2) return;
    const key = parts[0].trim();
    if (!key) return;
    obj[key] = decodeURIComponent(parts[1] || '');
  });
  return obj;
}

const params = getParams($argument);
// count：正整数，否则默认 6
let count = parseInt(params.count, 10);
if (isNaN(count) || count < 1) {
  count = 6;
}
// icon、color、url 均可选
const icon = params.icon || '';
const iconColor = params.color || '';
let fetchUrl = params.url || 'https://lishishangdejintian.bmcx.com/';
// 简单校验 URL 是否以 http:// 或 https:// 开头
if (!/^https?:\/\/.+/.test(fetchUrl)) {
  fetchUrl = 'https://lishishangdejintian.bmcx.com/';
}

// 发起 GET 请求，拿到 HTML
$httpClient.get(fetchUrl, (error, response, data) => {
  if (error) {
    console.log('【历史上的今天】网络请求出错：', error);
    $done();
    return;
  }
  if (!response || response.status !== 200 || !data) {
    console.log(`【历史上的今天】HTTP 返回状态：${response ? response.status : '未知'}`);
    $done();
    return;
  }
  // 将 &nbsp; 全部替换为普通空格，方便正则匹配
  const sanitizedData = data.replace(/&nbsp;/g, ' ');
  handleResponse(sanitizedData);
});

function handleResponse(html) {
  // 获取当前“月日”，例如 “6月2日”
  const now = new Date();
  const month = now.getMonth() + 1;         // JS 的月份从 0 开始
  const day = now.getDate();
  const todayStr = `${month}月${day}日`;

  // 正则：捕获“YYYY年”、“M月D日”和<a>标签中的事件标题
  const regex = /(\d{4}年)(\d{1,2}月\d{1,2}日) <a href='\/\d+__lishishangdejintianchaxun\/' target='_blank'>(.*?)<\/a>/g;
  const matches = [...html.matchAll(regex)];

  if (matches.length === 0) {
    // 页面中没有任何符合模式的条目，直接不推送
    $done({});
    return;
  }

  // 收集所有“当日”事件
  const events = [];
  for (const match of matches) {
    const yearPart = match[1];   // “YYYY年”
    const datePart = match[2];   // “M月D日”
    const titlePart = match[3];  // 事件标题
    if (datePart === todayStr) {
      // 拼成 “YYYY年M月D日 事件标题”
      events.push(`${yearPart}${datePart} ${titlePart}`);
    }
  }

  if (events.length === 0) {
    // 页面有历史条目，但没有任何一条对应今天的“月日”
    // 与原脚本一致，这里直接不推送任何通知
    $done({});
    return;
  }

  // 取前 count 条，并用换行符拼接为通知正文
  const notification = events.slice(0, count).join('\n');

  // 构造 Surge/Quantumult X 通知所需的 JSON 对象
  const body = {
    title: '📓 历史上的今天',
    content: notification,
    icon: icon,
    'icon-color': iconColor,
    count: count
  };

  $done(body);
}
