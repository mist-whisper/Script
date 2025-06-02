// https://raw.githubusercontent.com/smartmimi/conf/master/surge/timecard.js

let tlist = {
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

// 当前日期
const now = new Date();
const tnowf = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;

// 日期差
function dateDiff(start, end) {
  try {
    const s = new Date(start), e = new Date(end);
    return Math.floor((e - s) / (1000 * 60 * 60 * 24)).toString();
  } catch {
    return "0";
  }
}

// 最近节日索引
function nowlist() {
  for (let i = 1; i <= Object.keys(tlist).length; i++) {
    const days = parseInt(dateDiff(tnowf, tlist[i]?.[1]));
    if (!isNaN(days) && days >= 0) return i;
  }
  return 1;
}

// 节日推送通知
function datenotice(index) {
  const date = tlist[index]?.[1];
  const name = tlist[index]?.[0];
  const pushed = $persistentStore.read("timecardpushed");
  if (pushed !== date && now.getHours() >= 6) {
    $persistentStore.write(date, "timecardpushed");
    $notification.post(`🎉今天是 ${date} ${name}`, "", tlist[index]?.[2] || "节日快乐！");
  }
}

// 图标样式
function icon_now(num) {
  if (num === 0) return "gift";
  if (num <= 3) return "timer";
  if (num <= 7) return "hare";
  return "tortoise";
}

// 丰富标题
function title_random(daystr) {
  const lunar = calendar.solar2lunar(
    now.getFullYear(),
    now.getMonth() + 1,
    now.getDate()
  );
  if (daystr === "0") return `🎉节日快乐，${lunar.festival || "愿你开心每一天"}！`;

  const titles = [
    "距离放假，还要摸鱼多少天？",
    "坚持住，就快放假啦！",
    "上班好累呀，下顿吃啥？",
    "努力，我还能加班24小时！",
    "今日宜：吃饭饭 忌：减肥",
    "摸鱼才是赚老板的钱",
    `📅 公历 ${now.getMonth() + 1} 月 ${now.getDate()} 日`,
    `🌙 农历 ${lunar.lMonthName}${lunar.lDayName}`,
    `💫 星座：${lunar.constellation}`,
    lunar.term ? `📌 节气：${lunar.term}` : "",
    `🔮 ${lunar.gzYear}年 ${lunar.animal}年`,
    `📖 ${lunar.gzMonth}月 ${lunar.gzDay}日`
  ];
  return titles[Math.floor(Math.random() * titles.length)] || "日历提醒";
}

// ========== 🌙 插入农历节日与节气 ==========

try {
  const calendar = calendar || $calendar;
  const y = now.getFullYear(), m = now.getMonth() + 1, d = now.getDate();
  const lunar = calendar.solar2lunar(y, m, d);

  const lunarFestivals = lunar.festival || "";
  const solarTerm = lunar.term || "";

  const dateKey = `${y}-${m}-${d}`;
  const existingNames = Object.values(tlist).map(i => i[0]);
  let counter = Object.keys(tlist).length + 1;

  if (lunarFestivals && !existingNames.includes(lunarFestivals)) {
    tlist[counter++] = [lunarFestivals, dateKey, `${lunarFestivals}到啦，祝你节日快乐🎉`];
  }

  if (solarTerm && !existingNames.includes(solarTerm)) {
    tlist[counter++] = [solarTerm, dateKey, `${solarTerm}时节，注意养生🍵`];
  }
} catch (e) {
  // calendar 模块异常处理
}

// ========== 🧾 主输出逻辑 ==========

const dnum = nowlist();
const daythis = dateDiff(tnowf, tlist[dnum]?.[1]);
const daynext = dateDiff(tnowf, tlist[dnum + 1]?.[1]);
const daynext2 = dateDiff(tnowf, tlist[dnum + 2]?.[1]);

// 今日节日推送
if (daythis === "0") datenotice(dnum);

// 节日当天显示诗句
let todayContent = `${tlist[dnum]?.[0]}:${daythis === "0" ? "🎉今天！" : daythis + "天"}`;
if (daythis === "0" && tlist[dnum]?.[2]) {
  todayContent += `\n📝 ${tlist[dnum][2]}`;
}

$done({
  title: title_random(daythis),
  icon: icon_now(parseInt(daythis)),
  content:
    `${todayContent}, ` +
    `${tlist[dnum + 1]?.[0]}:${daynext}天, ` +
    `${tlist[dnum + 2]?.[0]}:${daynext2}天`
});