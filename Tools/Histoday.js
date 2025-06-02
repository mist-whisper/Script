// https://raw.githubusercontent.com/deezertidal/Surge_Module/master/files/histoday.js

// 从传入的参数字符串中解析出键值对并返回一个对象
function getParams(param) {
  return Object.fromEntries(
    $argument
      .split("&") // 以 & 分割参数字符串
      .map((item) => item.split("=")) // 把每个 key=value 分割成 [key, value]
      .map(([k, v]) => [k, decodeURIComponent(v)]) // 对值进行解码
  );
}

// 调用 getParams，解析出脚本运行时传入的参数
const params = getParams($argument);

// 设置请求的目标 URL
const url = "https://lishishangdejintian.bmcx.com/";

// 发送 GET 请求
$httpClient.get(url, (error, response, data) => {
  if (error) {
    // 如果请求出错，则在控制台输出错误，并结束脚本
    console.log(error);
    $done();
  } else {
    // 将返回的 HTML 数据中的 &nbsp; 替换为普通空格，方便后续正则匹配
    const sanitizedData = data.replace(/&nbsp;/g, ' ');
    // 处理返回的数据
    handleResponse(sanitizedData);
  }
});

function handleResponse(data) {
  // 定义正则，匹配形如 "YYYY年M月D日 <a href='/数字__lishishangdejintianchaxun/' ...>事件描述</a>"
  const regex = /(\d{4}年)(\d{1,2}月\d{1,2}日) <a href='\/\d+__lishishangdejintianchaxun\/' target='_blank'>(.*?)<\/a>/g;
  // 使用 matchAll 提取所有匹配项
  const matches = [...data.matchAll(regex)];

  if (matches.length > 0) {
    // 获取当前年份（但后续并未使用，仅保留以防扩展）
    const today = new Date().getFullYear();
    const events = [];

    // 遍历所有匹配项，组合年份和事件描述
    for (const match of matches) {
      // match[1] 是 "YYYY年"， match[3] 是事件描述
      events.push(`${match[1]} ${match[3]}`);
    }

    // 从参数中读取 count，默认取 5 条
    const count = parseInt(params.count) || 5;
    // 取出前 count 条事件，用换行符分隔
    const notification = events.slice(0, count).join("\n");

    // 构造通知的主体
    const body = {
      title: "📓历史上的今天",          // 通知标题
      content: notification,          // 通知内容
      icon: params.icon,              // 图标（从参数获取）
      "icon-color": params.color,     // 图标颜色（从参数获取）
      count: count                    // 保留的事件条数标记
    };

    // 返回通知内容给平台执行
    $done(body);
  } else {
    // 如果没有匹配到任何历史事件，返回空对象
    $done({});
  }
}
