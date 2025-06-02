// https://raw.githubusercontent.com/smartmimi/conf/master/surge/timecard.js

// 📅 节日列表：节日名称、日期、祝福语
const tlist = {
  1: ["元旦", "2025-01-01", "辞旧迎新岁月长，四季更替展宏图。祝君新年多喜乐，岁岁年年福安康。"],
  2: ["春节", "2025-01-29", "春风送暖入屠苏，万象更新迎福来。红灯高挂辞旧岁，喜气洋洋迎新春。"],
  3: ["元宵", "2025-02-12", "银灯高挂照夜空，花灯映照笑声融。元宵团圆幸福至，人间天上共此情。"],
  4: ["清明", "2025-04-04", "清明时节雨纷纷，思故人，泪满巾。祭扫先人铭记恩，追思不忘慰亲魂。"],
  5: ["劳动", "2025-05-01", "春华秋实勤为本，绿意盎然笑脸新。劳动节日共欢庆，幸福生活汗水成。"],
  6: ["端午", "2025-05-31", "龙舟竞渡江水绿，粽香四溢传千年。五月五日端午至，安康常伴绕心间。"],
  7: ["国庆", "2025-10-01", "山河壮丽锦绣新，十月华诞庆辉煌。"],
  8: ["中秋", "2025-10-06", "银盘高悬照大地，一轮明月寄相思。月满中秋人团圆，愿君此刻共此时。"],
  9: ["元旦", "2026-01-01", "辞旧迎新岁月长，四季更替展宏图。祝君新年多喜乐，岁岁年年福安康。"]
};

// 当前日期格式化（yyyy-mm-dd）
const now = new Date();
const todayStr = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;

/**
 * 计算两个日期相差的天数
 * @param {string} startDate - 格式为 yyyy-mm-dd
 * @param {string} endDate
 * @returns {number} 天数（字符串形式）
 */
function dateDiff(startDate, endDate) {
  try {
    const [sy, sm, sd] = startDate.split('-').map(Number);
    const [ey, em, ed] = endDate.split('-').map(Number);
    const start = new Date(sy, sm - 1, sd);
    const end = new Date(ey, em - 1, ed);
    return Math.floor((end - start) / (1000 * 60 * 60 * 24)).toString();
  } catch {
    return "0";
  }
}

/**
 * 找到下一个将要到来的节日
 * @returns {number} 节日在 tlist 中的键
 */
function getNearestHolidayIndex() {
  for (let i = 1; i <= Object.keys(tlist).length; i++) {
    const diff = parseInt(dateDiff(todayStr, tlist[i]?.[1]));
    if (!isNaN(diff) && diff >= 0) {
      return i;
    }
  }
  return -1;
}

/**
 * 计算当前日期距离指定节日的天数
 * @param {number} index - tlist 的索引
 * @returns {string} 天数或空值
 */
function daysUntilHoliday(index) {
  const date = tlist[index]?.[1];
  return date ? dateDiff(todayStr, date) : "";
}

/**
 * 节日当天通知推送
 */
function notifyIfHolidayToday(index) {
  const targetDate = tlist[index]?.[1];
  if (!targetDate) return;

  const pushed = $persistentStore.read("timecardpushed");
  if (pushed !== targetDate && now.getHours() >= 6) {
    $persistentStore.write(targetDate, "timecardpushed");
    $notification.post(
      `🎉今天是 ${targetDate} ${tlist[index][0]}节`,
      "",
      tlist[index][2] || "节日快乐~"
    );
  }
}

/**
 * 渲染天数展示文字
 * @param {string} dayStr - 天数字符串
 * @returns {string}
 */
function formatDayText(dayStr) {
  if (dayStr === "0") {
    notifyIfHolidayToday(nearestHolidayIndex);
    return "🎉";
  }
  return `${dayStr}天`;
}

/**
 * 图标样式切换逻辑
 * @param {number} dayNum
 * @returns {string}
 */
function iconForDay(dayNum) {
  if (dayNum === 0) return "gift";
  if (dayNum <= 3) return "timer";
  if (dayNum <= 7) return "hare";
  return "tortoise";
}

/**
 * 随机生成顶部标题
 * @param {string} days - 当前距离节日的天数
 * @returns {string}
 */
function getRandomTitle(days) {
  if (days === "0") return "节日快乐，万事大吉";

  const titles = [
    "距离放假，还要摸鱼多少天？",
    "坚持住，就快放假啦！",
    "上班好累呀，下顿吃啥？",
    "努力，我还能加班24小时！",
    "今日宜：吃饭饭  忌：减肥",
    "躺平中，等放假",
    "只有摸鱼才是赚老板的钱",
    now.toLocaleDateString(), // 公历
    "", // 可拓展农历
    "小乌龟慢慢爬"
  ];
  const index = Math.floor(Math.random() * titles.length);
  return titles[index] || "摸鱼日记";
}

// 🌟 主体逻辑
const nearestHolidayIndex = getNearestHolidayIndex();
const daysToThis = daysUntilHoliday(nearestHolidayIndex);
const daysToNext = daysUntilHoliday(nearestHolidayIndex + 1);
const daysToAfter = daysUntilHoliday(nearestHolidayIndex + 2);

$done({
  title: getRandomTitle(daysToThis),
  icon: iconForDay(parseInt(daysToThis)),
  content:
    `${tlist[nearestHolidayIndex]?.[0] || "未知"}: ${formatDayText(daysToThis)}, ` +
    `${tlist[nearestHolidayIndex + 1]?.[0] || "未知"}: ${formatDayText(daysToNext)}, ` +
    `${tlist[nearestHolidayIndex + 2]?.[0] || "未知"}: ${formatDayText(daysToAfter)}`
});