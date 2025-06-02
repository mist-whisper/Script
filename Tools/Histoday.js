// https://raw.githubusercontent.com/deezertidal/Surge_Module/master/files/histoday.js

//6.2
/**
 * 解析脚本传入的参数字符串，返回键值对对象。
 * 支持空字符串处理、重复键覆盖、值解码，并提供默认值接口。
 * @param {string} rawArg - 形如 "key1=val1&key2=val2" 的参数字符串
 * @returns {Object} params - 解析后的参数对象（key -> decoded value）
 */
function getParams(rawArg) {
  const params = {};

  // 如果没有提供任何参数，则直接返回空对象
  if (!rawArg || typeof rawArg !== 'string') {
    return params;
  }

  // 按 & 拆分，每一项可能是 key=val 或只包含 key
  rawArg.split('&').forEach(item => {
    if (!item) return;

    const [rawKey, rawVal] = item.split('=');
    const key = rawKey ? rawKey.trim() : '';
    // value 可能含有 =，只 decodeURIComponent 一次
    const val = rawVal !== undefined ? decodeURIComponent(rawVal.trim()) : '';

    if (!key) return;
    // 如果同一个 key 出现多次，以最后一个为准
    params[key] = val;
  });

  return params;
}

/**
 * 安全地从参数对象中读取整数，并进行范围检查，没有或不合法时返回默认值。
 * @param {Object} params - 已解析的参数对象
 * @param {string} key - 需要读取的键名
 * @param {number} defaultVal - 默认值
 * @param {number} min - 下限（inclusive）
 * @param {number} max - 上限（inclusive）
 * @returns {number} - 最终得到的合法整数
 */
function getIntParam(params, key, defaultVal, min, max) {
  if (!params.hasOwnProperty(key)) {
    return defaultVal;
  }
  const parsed = parseInt(params[key], 10);
  if (isNaN(parsed)) {
    return defaultVal;
  }
  if (parsed < min) {
    return min;
  }
  if (parsed > max) {
    return max;
  }
  return parsed;
}

/**
 * 主流程：向指定 URL 发起 GET 请求，抓取“历史上的今天”数据并返回通知体
 */
(function main() {
  // 1. 解析参数
  const params = getParams($argument);
  // 为 icon 和 color 提供内置默认值，防止外部参数缺失导致报错
  const icon = params.icon ? params.icon : '📅';
  const iconColor = params.color ? params.color : '#FF4500';
  // 限制 count 在 [1, 20] 之间，默认 6
  const count = getIntParam(params, 'count', 6, 1, 20);

  // 2. 构造请求 URL（可以根据需要将 URL 也做成可配置参数）
  const url = "https://lishishangdejintian.bmcx.com/";

  // 3. 发起网络请求
  $httpClient.get(url, (error, response, data) => {
    // 3.1 网络层错误
    if (error) {
      console.log("请求失败：", error);
      $done({});
      return;
    }

    // 3.2 检查 HTTP 状态码，只有 200 才处理
    if (!response || response.status !== 200) {
      console.log(`非 200 响应：${response ? response.status : '无响应对象'}`);
      $done({});
      return;
    }

    // 3.3 确保返回数据存在且为字符串
    if (!data || typeof data !== 'string') {
      console.log('返回的数据为空或格式不对');
      $done({});
      return;
    }

    // 3.4 将 HTML 中的 &nbsp; 统一替换为普通空格，方便后续正则处理
    const sanitizedData = data.replace(/&nbsp;/g, ' ');
    // 进入数据解析流程
    handleResponse(sanitizedData, { icon, iconColor, count });
  });
})();

/**
 * 解析返回的 HTML，提取“YYYY年M月D日 <a>事件描述</a>”的条目，
 * 并构造带 HTML 样式的通知体：
 * - 标题：加粗、大字号并用颜色区分，同时在括号内显示具体月日
 * - 每条事件：只保留年份和描述，字号稍大、不同颜色
 * @param {string} html - 已经做了 &nbsp; 替换的页面源码
 * @param {Object} options - 通知所需的额外参数
 * @param {string} options.icon - 通知图标
 * @param {string} options.iconColor - 通知图标颜色
 * @param {number} options.count - 希望展示的事件条数
 */
function handleResponse(html, options) {
  const { icon, iconColor, count } = options;
  const events = [];
  let monthDay = null; // 用于存储“6月2日”之类的月日文本

  try {
    /**
     * 正则说明：
     * - (\d{4}年)   匹配年份，例如 "2025年"
     * - (\d{1,2}月\d{1,2}日)  匹配月日，例如 "6月2日" 或 "12月25日"
     * - <a href='\/\d+__lishishangdejintianchaxun\/' target='_blank'>(.*?)<\/a>
     *     匹配链接中的事件描述，捕获文本内容到 group[3]
     */
    const regex = /(\d{4}年)(\d{1,2}月\d{1,2}日)\s*<a\s+href='\/\d+__lishishangdejintianchaxun\/'\s+target='_blank'>(.*?)<\/a>/g;
    let match;

    while ((match = regex.exec(html)) !== null) {
      const yearText = match[1].trim();      // "2025年"
      const dateText = match[2].trim();      // "6月2日"
      const description = match[3].trim();   // "事件描述"

      // 只在第一次匹配时保存月日，用于标题中显示
      if (monthDay === null) {
        monthDay = dateText;
      }

      // 简单校验：年份要四位数字 + "年"，月日要包含 "月" 和 "日"
      if (!/^\d{4}年$/.test(yearText) || !/^\d{1,2}月\d{1,2}日$/.test(dateText)) {
        continue; // 跳过格式不符合预期的条目
      }

      // 只保留年份和描述：例如 "2025年：某某大事件"
      events.push({ year: yearText, desc: description });

      if (events.length >= count) {
        break; // 已收集够指定数量，退出循环
      }
    }
  } catch (e) {
    console.log('解析 HTML 时发生异常：', e);
    $done({});
    return;
  }

  // 如果没匹配到任何事件，则直接返回空
  if (events.length === 0 || !monthDay) {
    $done({});
    return;
  }

  // 构造带样式的标题：加粗、大字号、特定颜色
  // 例如：<span style="font-weight:bold;font-size:22px;color:#FF4500">📓 历史上的今天 (6月2日)</span>
  const titleHTML = `<span style="font-weight:bold; font-size:22px; color:${iconColor};">${icon} 历史上的今天 (${monthDay})</span>`;

  // 构造带样式的事件列表：每行用 <div>，字号适当增大、用蓝色区分
  // 例如：<div style="font-size:16px; color:#3333FF;">2025年：某某大事件</div>
  let contentHTML = '';
  events.forEach(item => {
    contentHTML += `<div style="font-size:16px; color:#3333FF; margin-bottom:4px;">${item.year}：${item.desc}</div>`;
  });

  // 返回包含 HTML 的通知体
  const body = {
    title: titleHTML,
    content: contentHTML.trim(),
    icon: icon,
    "icon-color": iconColor,
    count: events.length
  };

  $done(body);
}
